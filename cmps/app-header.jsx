import { EmailFilter } from '../apps/mail/cmps/email-filter.jsx'

const { NavLink, Route, Link } = ReactRouterDOM

export class AppHeader extends React.Component {
  render() {
    return <header className="app-header">
      <div className="header-container">
        <Link className="logo" to="/">
          <img src="./assets/img/logo.svg" alt="logo" className="icon" />
          <h1 className="name">Appsus</h1>
        </Link>
      </div>
      <Route path="/email" component={EmailFilter} />
      <div className="drop-down">
        <nav className="drop-down-content">
          <NavLink className="home-link" to="/" exact></NavLink>
          <NavLink className="email-link" to="/email/inbox"></NavLink>
          <NavLink className="keep-link" to="/keep/all"> </NavLink>
          <NavLink className="book-link" to="/book"> </NavLink>
        </nav>
      </div>
    </header>
  }
}
