import test from 'node:test'
import assert from 'node:assert/strict'
import { scheduledJobs, runScheduledJobs } from '../scripts/railway-scheduler.mjs'

test('campaign, mailbox, and birthday schedules retain their Vercel UTC times', () => {
  assert.deepEqual(scheduledJobs(new Date('2026-11-05T06:59:00Z')), ['/api/campaigns/send'])
  assert.deepEqual(scheduledJobs(new Date('2026-11-05T07:10:00Z')), ['/api/campaigns/send', '/api/gmail/sync'])
  assert.deepEqual(scheduledJobs(new Date('2026-11-05T07:00:00Z')), ['/api/campaigns/send', '/api/gmail/sync', '/api/reminders/birthdays'])
  assert.deepEqual(scheduledJobs(new Date('2026-11-05T08:00:00Z')), ['/api/campaigns/send', '/api/gmail/sync'])
})

test('a disabled Railway scheduler cannot trigger live scheduled work', async () => {
  const oldValue = process.env.RAILWAY_SCHEDULER_ENABLED
  const originalFetch = globalThis.fetch
  let called = false
  process.env.RAILWAY_SCHEDULER_ENABLED = 'false'
  globalThis.fetch = async () => { called = true; throw new Error('Must not send a request') }
  try {
    await runScheduledJobs()
    assert.equal(called, false)
  } finally {
    globalThis.fetch = originalFetch
    if (oldValue === undefined) delete process.env.RAILWAY_SCHEDULER_ENABLED
    else process.env.RAILWAY_SCHEDULER_ENABLED = oldValue
  }
})
