
export function ImgPreview({keep}) {

    return (
        <React.Fragment>
        <img src={keep.content} />
        {keep.title ? <h1>{keep.title}</h1> : ""}
        </React.Fragment>
    )
}