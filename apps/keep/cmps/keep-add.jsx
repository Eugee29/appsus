import { eventBusService } from "../../../services/event-bus-service.js";
import { utilService } from "../../../services/util.service.js";

export class KeepAdd extends React.Component {
  state = {
    keep: {
      id: "",
      type: "note-txt",
      title: "",
      content: "",
      style: {
        backgroundColor: "#fff",
      },
    },
    isExpended: false,
  };

  componentDidMount() {
    console.log(this.props.location.search);
    if (!this.props.location.search) return;
    const urlSrcPrm = new URLSearchParams(this.props.location.search);
    this.setState((prevState) => ({
      keep: {
        ...prevState.keep,
        id: "",
        title: urlSrcPrm.get("title"),
        content: urlSrcPrm.get("content"),
      },
      isExpended: true,
    }));
  }

  handleChange = ({ target }) => {
    const { name, value } = target;

    this.setState((prevState) => ({
      keep: { ...prevState.keep, [name]: value },
    }));
  };


  handleExpended = () => {
    this.setState({ isExpended: true });
  };

  onSubmit = (ev) => {
    ev.preventDefault();
    const { type, title, content, style } = this.state.keep;
    if (!title) {
      alert("enter title");
      return;
    }
    const keep = {
      id: utilService.makeId(),
      type,
      title,
      content,
      style,
    };

    eventBusService.emit("add-keep", keep);
    this.setState({
      keep: {
        id: "",
        type: "keep-txt",
        title: "",
        content: "",
        style: {
          backgroundColor: "#ffffff",
        },
      },

      isExpended: false,
    });
  };

  render() {
    const { isExpended } = this.state;
    const { title, content, type } = this.state.keep;
    return (
      <section className="keep-add" >
        <form onSubmit={this.onSubmit} id="add-form" >
          {isExpended && (
            <input
              value={title}
              type="text"
              placeholder="Title..."
              name="title"
              onChange={this.handleChange}
            />
          )}

          <div className="btn-cont on-add">
            <p>
              <textarea
                value={content}
                onClick={this.handleExpended}
                name="content"
                placeholder={
                  type === "note-img"
                    ? "Enter URL..."
                    : type === "note-todos"
                    ? "Enter tasks seperated by commas"
                    : type === "note-vid"
                    ? "Enter a Youtube URL"
                    : "Make a keep..."
                }
                onChange={this.handleChange}
                rows={isExpended ? 3 : 1}
              ></textarea>
            </p>
            <button
              name="type"
              value="note-img"
              onClick={this.handleChange}
              type="button"
              className="add-pic"
              title="Add Pic"
            ></button>
            <button
              name="type"
              value="note-todos"
              onClick={this.handleChange}
              type="button"
              className="add-list"
              title="Add List"
            ></button>
            <button
              name="type"
              value="note-vid"
              onClick={this.handleChange}
              type="button"
              className="add-video"
              title="Add Video"
            ></button>
          </div>

          <button
            className="submit"
            type="submit"
            form="add-form"
            title="Submit"
          >
            Submit
          </button>
        </form>
      </section>
    );
  }
}
