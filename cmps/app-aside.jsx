import { EmailCompose } from "../apps/mail/cmps/email-compose.jsx";
import { EmailFolderList } from "../apps/mail/cmps/email-folder-list.jsx";
import { KeepNavList } from "../apps/keep/cmps/keep-nav.jsx";
import { AppFooter } from "./app-footer.jsx";

const { Route, withRouter } = ReactRouterDOM;

class _AppAside extends React.Component {
  state = {
    isHidden: true,
  };

  toggleAside = () => {
    this.setState(({ isHidden }) => ({ isHidden: !isHidden }));
  };

  render() {
    const status = this.state.isHidden ? 'hidden' : 'visible'
    if (this.props.location.pathname === '/' || this.props.location.pathname === '/book') return <React.Fragment />
    return <aside className={`app-aside ${status}`}>
      <div className="page-cover" onClick={this.toggleAside}></div>
      <button className="menu-btn" onClick={this.toggleAside}></button>
      <Route path="/email" component={EmailCompose} />
      <Route path="/email" component={EmailFolderList} />
      <Route path="/keep" component={KeepNavList} />
      <AppFooter />
    </aside>
  }
}

export const AppAside = withRouter(_AppAside);
