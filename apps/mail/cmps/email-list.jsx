import { EmailPreview } from './email-preview.jsx'

export function EmailList({ emails, onStarEmail, onDeleteEmail, onReadEmail }) {
  return <section className="email-list">
    {emails.map(email => <EmailPreview key={email.id} email={email} onDeleteEmail={onDeleteEmail} onReadEmail={onReadEmail} onStarEmail={onStarEmail} />)}
  </section>
}