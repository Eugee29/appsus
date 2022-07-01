import { eventBusService } from "../services/event-bus-service.js"

export class UserMsg extends React.Component {

  state = {
    msg: null
  }

  removeEvent
  timeoutId

  componentDidMount() {
    this.removeEvent = eventBusService.on('user-msg', (msg) => {
      this.setState({ msg })
      if (this.timeoutId) clearTimeout(this.timeoutId)
      this.timeoutId = setTimeout(this.onCloseMsg, 3000)
    })
  }

  componentWillUnmount() {
    this.removeEvent()
  }

  onCloseMsg = () => {
    this.setState({ msg: null })
    clearTimeout(this.timeoutId)
  }

  render() {
    const { msg } = this.state
    if (!msg) return <React.Fragment />
    return <div className={`user-msg ${msg.type}`}>
      <h1 className="msg">{msg.txt}</h1>
      <button className="close" onClick={this.onCloseMsg}></button>
    </div>
  }
}