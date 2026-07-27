import { tmdb } from '@/lib/tmdb';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const q = req.nextUrl.searchParams.get('q');
    if (!q || q.trim().length < 2) {
      return NextResponse.json({ results: [] });
    }
    
    const data = await tmdb.search(q.trim());
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Search API error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
