# ufaqtech-socialhub
A centralized social hub platform for seamless community engagement, content sharing, and real-time networking.

## Deployment & Environment Variables

1. Set these environment variables in your Vercel project settings (Production and Preview as needed):

	- `UFAQTECH_SUPABASE_URL` (e.g. `https://<project>.supabase.co`)
	- `UFAQTECH_SUPABASE_ANON_KEY` (your Supabase anon/public key)

2. After setting the variables, redeploy the project on Vercel.

3. Test the server endpoint once deployed:

```bash
curl -i https://<your-deployment-url>/api/env
```

Expected result: a JSON response with `UFAQTECH_SUPABASE_URL` and `UFAQTECH_SUPABASE_ANON_KEY`.

4. If you see a 500 error, confirm the env var names are exactly as listed above and redeploy.

5. If the endpoint returns the envs correctly but the app still fails to sign in, open the browser DevTools network tab and confirm the `/api/env` request succeeds and that `assets/js/config.js` is fetching `/api/env` before creating the Supabase client.

If you want, I can also add a debug page that prints the current window-config for easier troubleshooting (only for local/dev use).
