import { OpenModal } from "./open-modal.jsx";

export class NotePreview extends React.Component {
  
    state = {
        isLngTxtShown: false,
    }


  
    render() {
    const { keep } = this.props;
    return (
      <React.Fragment>
        {keep.title ? <h1>{keep.title}</h1> : ""}
        <OpenModal keep={keep} length={20}/>
      </React.Fragment>
    );
  }
}
