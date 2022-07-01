import { keepService } from "../services/note.service.js"
import { KeepAdd } from "../cmps/keep-add.jsx"
import { KeepPreview } from "../cmps/keep-preview.jsx"
import { eventBusService } from "../../../services/event-bus-service.js"
const { Route } = ReactRouterDOM

export class AppKeep extends React.Component {
  state = {
    keeps: [],
  };

  componentDidMount() {
    
    eventBusService.on("filter-chng", (filterBy) => {
      this.loadKeeps(filterBy)
    })

    eventBusService.on('add-keep', (keep) => {
      this.onAddKeep(keep)
    })
    this.loadKeeps();
  }

  loadKeeps = (filterBy = null) => {
    keepService.query(filterBy).then((keeps) => {
      this.setState({ keeps })
    })
  };

  onAddKeep = (newKeep) => {
    keepService.saveKeep(newKeep).then(() => {
      this.loadKeeps();
      eventBusService.emit("keep-added", newKeep)
    });
  };

  onDeleteKeeps = (id) => {
    keepService.remove(id).then(() => this.loadKeeps())
  };

  onBgcColorChange = (color, id) => {
    keepService.bgcColor(color, id).then(() => this.loadKeeps())
  };

  render() {
    const { keeps } = this.state
    if (!keeps) return <img src="../../../assets/img/loader.gif" />
    return (
      <section className="keep-app main-layout">
        <Route path="/keep" component={KeepAdd}/>
        <section className="keep-container">
          {keeps.map((keep, idx) => (
            <KeepPreview
              key={idx}
              keep={keep}
              onColor={this.onBgcColorChange}
              onDelete={this.onDeleteKeeps}
            />
          ))}
        </section>
      </section>
    )
  }
}
