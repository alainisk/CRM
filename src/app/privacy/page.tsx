import Link from 'next/link'

export const metadata = { title: 'Privacy · FLO CRM' }

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl space-y-6 px-6 py-12 text-slate-700">
      <h1 className="text-3xl font-semibold text-slate-900">FLO CRM privacy notice</h1>
      <p>Updated November 5, 2026. FLO CRM is a private customer relationship management application for authorized organization members.</p>
      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900">Google account connections</h2>
        <p>Connecting a mailbox lets CRM identify its email address and read Gmail messages and Google Calendar events. CRM uses this information to match communications and meetings to CRM contacts and record activity for the authorized organization. The connection cannot send, delete, or relabel Gmail messages, or change Calendar events.</p>
        <p>CRM stores encrypted connection credentials and synchronization information in its database. Imported activity can include message or event details and remains part of the organization’s CRM records after a mailbox is disconnected.</p>
      </section>
      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900">Access and service providers</h2>
        <p>CRM records are available to authorized organization members according to their permissions. The application uses Supabase for authentication and stored records, Railway for hosting, Google for connected mailboxes and calendars, and Resend for separately configured outgoing CRM email. A Google mailbox connection does not grant Resend access to that mailbox.</p>
        <p>Google user data is used for the CRM features described here, not for advertising or training generalized AI models. FLO CRM’s use and transfer of information received from Google APIs follows the <a className="underline" href="https://developers.google.com/terms/api-services-user-data-policy">Google API Services User Data Policy</a>, including its Limited Use requirements.</p>
      </section>
      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900">Disconnecting and contacting the administrator</h2>
        <p>You can disconnect a mailbox in CRM’s mailbox settings, which removes its stored connection credentials. You can also revoke CRM’s access in your <a className="underline" href="https://myaccount.google.com/connections">Google account connections</a>. Disconnecting stops future access; it does not automatically delete activity already imported into CRM.</p>
        <p>For questions about access, retained CRM records, or deletion requests, contact your organization administrator or <a className="underline" href="mailto:alainisk@gmail.com">alainisk@gmail.com</a>.</p>
      </section>
      <Link className="inline-block underline" href="/login">Return to CRM</Link>
    </main>
  )
}
