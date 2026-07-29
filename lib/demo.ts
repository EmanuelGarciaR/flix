import { cookies } from 'next/headers';

export async function getDemoMode(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get('demo_mode')?.value === 'true';
}
