
CREATE POLICY "meeting-audio public read" ON storage.objects
  FOR SELECT TO anon, authenticated USING (bucket_id = 'meeting-audio');
CREATE POLICY "meeting-audio public insert" ON storage.objects
  FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'meeting-audio');
CREATE POLICY "meeting-audio public delete" ON storage.objects
  FOR DELETE TO anon, authenticated USING (bucket_id = 'meeting-audio');
