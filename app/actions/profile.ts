'use server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { normalizeLocale } from '@/lib/i18n';

/**
 * Guarantee a profile row exists for the current user.
 * Creates one with safe defaults if it's missing (e.g. first OAuth login).
 */
export async function ensureProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .upsert(
      { id: user.id },
      { onConflict: 'id', ignoreDuplicates: true }
    )
    .select()
    .single();

  if (error) {
    // Row already exists — just fetch it
    const { data: existing } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    return existing;
  }
  return data;
}

export async function updateProfileRegion(region: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // upsert: creates the row if it doesn't exist yet, updates if it does
  const { error } = await supabase
    .from('profiles')
    .upsert(
      { id: user.id, region, region_source: 'manual' },
      { onConflict: 'id' }
    );

  if (error) throw error;

  // Cookie write is best-effort — DB is the source of truth
  try {
    const cookieStore = await cookies();
    cookieStore.set('user_region', region, {
      path: '/',
      maxAge: 2592000,
      sameSite: 'lax',
    });
  } catch {
    // cookies().set() can throw outside a response context; ignore
  }

  revalidatePath('/profile');
  revalidatePath('/home');
  revalidatePath('/browse');

  return { success: true };
}

export async function updateProfileSettings({
  language,
  maturityRating,
  isKids,
}: {
  language?: string;
  maturityRating?: string;
  isKids?: boolean;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const updateFields: Record<string, unknown> = { id: user.id };
  if (language !== undefined) updateFields.language = normalizeLocale(language);
  if (maturityRating !== undefined) updateFields.maturity_rating = maturityRating;
  if (isKids !== undefined) updateFields.is_kids = isKids;

  const { error } = await supabase
    .from('profiles')
    .upsert(updateFields, { onConflict: 'id' });

  if (error) throw error;
  return { success: true };
}

export async function getActiveProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error || !data) return null;
  return data;
}

