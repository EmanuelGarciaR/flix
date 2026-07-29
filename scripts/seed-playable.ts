import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const TEST_MUX_PLAYBACK_ID = 'qxb01i6T202018GGSNzgwtm00hzV02M4FbdQ344Xw2bU6I';

const seedData = [
  {
    tmdb_id: 1368337,
    mux_playback_id: TEST_MUX_PLAYBACK_ID,
    available_regions: ['US', 'CA', 'GB']
  },
  {
    tmdb_id: 1081003,
    mux_playback_id: TEST_MUX_PLAYBACK_ID,
    available_regions: ['MX', 'ES', 'AR', 'CO', 'BR']
  },
  {
    tmdb_id: 454639,
    mux_playback_id: TEST_MUX_PLAYBACK_ID,
    available_regions: ['US', 'BR']
  }
];

async function run() {
  console.log("Seeding playable_content...");
  
  for (const item of seedData) {
    const { error } = await supabase
      .from('playable_content')
      .upsert(item, { onConflict: 'tmdb_id' });
      
    if (error) {
      console.error(Error inserting :, error.message);
    } else {
      console.log(Inserted TMDB ID:  for regions: );
    }
  }
  
  console.log("Seed complete.");
}

run();
