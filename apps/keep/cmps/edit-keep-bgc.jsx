

export class KeepEditBgc extends React.Component{

    


    render() {
        const {keep} = this.props
        if(!keep) return <img src="../../../assets/img/loader.gif" />;

        return <label className="bgc-edit" >
         <input type="color" 
        onChange={this.props.onColor}
        value={keep.style.backgroundColor}
        name="backgroundColor"
        className="bgc-edit-input"
        title="Change Background"
        />
        </label>
    }
}