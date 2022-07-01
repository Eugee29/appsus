import { ImgPreview } from "./sub-comps/img-preview.jsx"

export class KeepExpend extends React.Component {


    modalRef = React.createRef()
    
    onCloseModal = () => {
        this.modalRef.current.style.display ='none';
    }

    render() {
        const {keep} = this.props

        return <div className="keep-modal" ref={this.modalRef}>
        {keep.title ? <h1>{keep.title}</h1> : ''}
        {keep.content}
        <span onClick={this.onCloseModal}></span>
    </div>
    }
}