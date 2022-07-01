import { KeepEditBgc } from "./edit-keep-bgc.jsx";
import { KeepToMail } from "./keep-to-mail.jsx";
import { eventBusService } from "../../../services/event-bus-service.js";
import { KeepExpend } from "./keep-expend.jsx";
import { ImgPreview} from "./sub-comps/img-preview.jsx";
import { VideoPreview } from "./sub-comps/video-preview.jsx";
import { TodoPreview } from "./sub-comps/todo-preview.jsx";
import { NotePreview } from "./sub-comps/note-preview.jsx";

export class KeepPreview extends React.Component {
  state = {
    keep: null,
  };

  componentDidMount() {
    this.loadKeep();

    eventBusService.on("keep-added", (keep) => {
      this.loadKeep(keep);
    });
  }

  loadKeep = (keep = this.props.keep) => {
    this.setState({ keep });
  };

  onColorChange = ({ target }) => {
    const { value, name } = target;
    const { id } = this.state.keep;
    this.props.onColor(value, id);
  };

  render() {
    const { keep } = this.props;

    return (
      <article className="keep" style={keep.style}>

        {keep.type === "note-img" ? (
          <ImgPreview keep={keep}/>
        ) : keep.type === "note-vid" ? (
          <VideoPreview keep={keep}/>
        ) : keep.type === "note-todos" ? (
         <TodoPreview keep={keep}/>
        ) : (
          <NotePreview keep={keep}/>
        )}

        <div className="edit-container">
          <button
            onClick={() => this.props.onDelete(keep.id)}
            className="del-keep"
            title="Delete Keep"
          ></button>
          <KeepToMail keep={keep} />
          <KeepEditBgc keep={keep} onColor={this.onColorChange} />
        </div>
        
      </article>
    );
  }
}
