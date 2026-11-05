import { fileURLToPath } from 'node:url'
import { setTimeout as delay } from 'node:timers/promises'

export function scheduledJobs(now = new Date()) {
  const jobs = ['/api/campaigns/send']
  if (now.getUTCMinutes() % 10 === 0) jobs.push('/api/gmail/sync')
  if (now.getUTCHours() === 7 && now.getUTCMinutes() === 0) jobs.push('/api/reminders/birthdays')
  return jobs
}

export async function runScheduledJobs() {
  const jobs = scheduledJobs()
  if (process.argv.includes('--dry-run')) {
    console.log(JSON.stringify({ jobs, dryRun: true }))
    return
  }
  // Enable only after Vercel's scheduler has been stopped during cutover.
  if (process.env.RAILWAY_SCHEDULER_ENABLED !== 'true') {
    console.log('Scheduler disabled; no jobs were called.')
    return
  }
  const origin = process.env.CRM_SCHEDULER_URL || process.env.NEXT_PUBLIC_SITE_URL
  const secret = process.env.CRON_SECRET || process.env.SYNC_INGEST_SECRET
  if (!origin || !secret) throw new Error('Scheduler URL and shared secret are required.')

  let failed = false
  for (const path of jobs) {
    try {
      const response = await fetch(new URL(path, origin), {
        method: 'POST',
        headers: { Authorization: `Bearer ${secret}` },
        signal: AbortSignal.timeout(120_000),
        redirect: 'error',
      })
      console.log(JSON.stringify({ path, status: response.status }))
      if (!response.ok) failed = true
    } catch {
      console.error(JSON.stringify({ path, error: 'Scheduled request failed' }))
      failed = true
    }
  }
  if (failed) process.exitCode = 1
}

async function main() {
  if (!process.argv.includes('--daemon') || process.argv.includes('--dry-run')) {
    await runScheduledJobs()
    return
  }
  if (process.env.RAILWAY_SCHEDULER_ENABLED !== 'true') throw new Error('Enable the scheduler only after stopping Vercel cron jobs.')
  // Railway cron has a five-minute minimum. A small worker preserves the
  // existing one-minute campaign cadence without changing application behavior.
  const stop = new AbortController()
  for (const signal of ['SIGTERM', 'SIGINT']) process.once(signal, () => stop.abort())
  while (!stop.signal.aborted) {
    try {
      await delay(60_000 - (Date.now() % 60_000), undefined, { signal: stop.signal })
      await runScheduledJobs()
      // An individual failed run is reported but should not poison later runs.
      process.exitCode = 0
    } catch (error) {
      if (stop.signal.aborted) break
      console.error(error.message)
    }
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((error) => { console.error(error.message); process.exitCode = 1 })
}
