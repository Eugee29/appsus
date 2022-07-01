const { NavLink } = ReactRouterDOM

export function AppHeader() {
  return (
    <header className="app-header">
      <NavLink to="/"><h1>Miss Book</h1></NavLink>
      <nav>
        <NavLink to="/" exact>Home</NavLink>
        <NavLink to="/about">About</NavLink>
        <NavLink to="/book">Books</NavLink>

      </nav>
    </header>
  )
}
