import { createClient } from '@/lib/supabase/server'
import { User } from '@supabase/supabase-js'
import { headers } from 'next/headers'

export async function getUser(): Promise<User | null> {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      return null
    }

    return user
  } catch (error) {
    console.error('Error fetching user:', error)
    return null
  }
}

export async function getProfile(userId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()   // returns null instead of PGRST116 when row is missing

    if (error) {
      console.error('Error fetching profile:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error fetching profile:', error)
    return null
  }
}

export async function getActiveProfile() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()   // returns null instead of PGRST116 when row is missing

    if (error || !data) return null
    return data
  } catch (error) {
    console.error('Error fetching active profile:', error)
    return null
  }
}


export async function getUserRegion(): Promise<string> {
  const profile = await getActiveProfile()
  
  if (profile && profile.region_source !== 'manual' && !profile.region) {
    const headersList = await headers();
    const vercelRegion = headersList.get('x-vercel-ip-country');
    const newRegion = vercelRegion || 'US';
    
    const supabase = await createClient();
    await supabase
      .from('profiles')
      .update({ region: newRegion, region_source: 'auto' })
      .eq('id', profile.id);
      
    return newRegion;
  }
  
  return profile?.region || 'US'
}
