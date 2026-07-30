INSERT INTO public.playable_content (tmdb_id, mux_playback_id, available_regions)
VALUES 
  (1368337, 'qxb01i6T202018GGSNzgwtm00hzV02M4FbdQ344Xw2bU6I', '{US,CA,GB}'),
  (1081003, 'qxb01i6T202018GGSNzgwtm00hzV02M4FbdQ344Xw2bU6I', '{MX,ES,AR,CO,BR}'),
  (454639, 'qxb01i6T202018GGSNzgwtm00hzV02M4FbdQ344Xw2bU6I', '{US,BR}')
ON CONFLICT (tmdb_id) DO UPDATE SET 
  mux_playback_id = EXCLUDED.mux_playback_id,
  available_regions = EXCLUDED.available_regions;
