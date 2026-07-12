export default function handler(req, res) {
  const env = {
    UFAQTECH_SUPABASE_URL: process.env.UFAQTECH_SUPABASE_URL || '',
    UFAQTECH_SUPABASE_ANON_KEY: process.env.UFAQTECH_SUPABASE_ANON_KEY || '',
  };

  if (!env.UFAQTECH_SUPABASE_URL || !env.UFAQTECH_SUPABASE_ANON_KEY) {
    return res.status(500).json({
      error: 'Missing environment variables for Supabase configuration.',
    });
  }

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
  return res.status(200).json(env);
}
