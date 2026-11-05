# Railway deployment

The Docker image runs Next.js standalone on Railway's `PORT` and preserves the existing Supabase database, authentication, and storage. Set production variables in Railway; never commit `.env` files. Only the `NEXT_PUBLIC_*` variables are build arguments. `/api/health` reports process liveness.

The Railway service settings specify `Dockerfile`, `/api/health`, a 120-second health-check timeout, one replica, serverless sleeping, and an on-failure restart limit of three. These settings are saved directly in Railway. New Railway services no longer read `railway.json` or `railway.toml`; use the dashboard/API or Railway's current Infrastructure as Code workflow to change them.

Required production configuration: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SITE_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `MAILBOX_TOKEN_KEY`, `RESEND_API_KEY`, `RESEND_WEBHOOK_SECRET`, `CRON_SECRET`, and `SYNC_INGEST_SECRET`.

Preserve the original `MAILBOX_TOKEN_KEY`: stored Gmail refresh tokens are encrypted with it. Preserve the production site URL and verify Google OAuth, Supabase redirect URLs, and Resend callbacks before changing DNS.

## Scheduled work

Deploy the same repository as one separate worker, using the same `Dockerfile` with start command `node scripts/railway-scheduler.mjs --daemon`, one replica, no HTTP health check or domain, and serverless sleeping off. Provide `CRM_SCHEDULER_URL` (or `NEXT_PUBLIC_SITE_URL`) and the same scheduled-request secret as the web service. The worker preserves the existing UTC schedules: campaigns each minute, Gmail sync each ten minutes, and birthday reminders at 07:00 daily. Railway's native cron minimum is five minutes, so the worker uses a minute loop.

Keep `RAILWAY_SCHEDULER_ENABLED=false` until Vercel's cron jobs have been stopped during cutover. Then enable it only on the single worker replica. Never enable both schedulers together. `node scripts/railway-scheduler.mjs --dry-run` lists paths without sending requests.

Scheduled requests can keep the web service awake; estimate billing using actual Railway usage. Health checks alone do not verify database access, user login, Gmail, or email delivery. Verify those flows before retiring Vercel.
