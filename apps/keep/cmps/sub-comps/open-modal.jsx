import {KeepExpend} from "../keep-expend.jsx"

export class OpenModal extends React.Component {

 
  
    render() {
      const { keep } = this.props
      const { length } = this.props
      const desc = keep.content.substring(0, length)
  
      return <div>
        <p>{desc}</p>
        {keep.content.length > length &&
          <button onClick={this.onToggleTxt} className="more-less-btn">
             
              <label htmlFor="show-long-txt">
              More...
              </label>
              
              <input type="checkbox" id="show-long-txt"/>

              
              <KeepExpend keep={keep}/>

              </button>}
      </div>
    }
  }