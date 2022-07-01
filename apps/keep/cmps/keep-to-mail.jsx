const { Link } = ReactRouterDOM;

export function KeepToMail({ keep }) {
  return (
    <Link to={`/email/inbox?subject=${keep.title}&body=${keep.content}`}>
        <button className="email-keep"
        title="Email To..."></button>
    </Link>
  );
}
