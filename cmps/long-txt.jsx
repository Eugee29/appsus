export class LongTxt extends React.Component {

  state = {
    txtShown: false,
  }

  onToggleTxt = () => {
    this.setState(({ txtShown }) => ({ txtShown: !txtShown }))
  }

  render() {
    const { txtShown } = this.state
    const { text } = this.props
    const desc = txtShown ? text : text.substring(0, 100)

    return <div>
      <p>{desc}</p>
      {text.length > 100 &&
        <button onClick={this.onToggleTxt}>{txtShown ? 'Less...' : 'More...'}</button>}
    </div>
  }
}