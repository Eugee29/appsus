import { keepService } from "../../services/note.service.jsx"

export function VideoPreview({ keep }) {
  
  
    return (
    <React.Fragment>
      <iframe
        src={keepService.fixYoutubeUrl(keep.content)}
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
      {keep.title ? <h1>{keep.title}</h1> : ""}
    </React.Fragment>
  );
}
