export function EmailStar({ email, onStarEmail }) {
  const isActive = email.isStarred ? 'active' : ''

  return (
    <div
      className={`email-star ${isActive}`}
      onClick={(ev) => onStarEmail(ev, email.id)}
    ></div>
  )
}
