import { eventBusService } from "../../../services/event-bus-service.js"

const { NavLink } = ReactRouterDOM

export class KeepNavList extends React.Component {
  state = {
    filterBy: null,

  };

  onSetFilterBy = (filterBy) => {

    eventBusService.emit('filter-chng', filterBy)
  };

  render() {
    const { activeBtn } = this.state
    return (
      <aside className="keep-nav">
        <div className="space-container"></div>

        <nav className="folder-nav">
          <NavLink to="/keep/all" 
          onClick={() => this.onSetFilterBy('all')}>
            All Keeps</NavLink>
          <NavLink to="/keep/note-txt" 
          onClick={() => this.onSetFilterBy('note-txt')}>
            Note</NavLink>
          <NavLink to="/keep/note-img" 
          onClick={() => this.onSetFilterBy('note-img')}>
            Pictures</NavLink>
          <NavLink to="/keep/note-vid" 
          onClick={() => this.onSetFilterBy('note-vid')}>
            Videos</NavLink>
          <NavLink to="/keep/note-todos" 
          onClick={() => this.onSetFilterBy('note-todos')}>
            Todo-Lists</NavLink>
        </nav>
      </aside>
    )
  }
}
