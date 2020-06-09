import React from 'react'
import ReactDOM from "react-dom"
import './Modal.css'
import '../App.css'

const Modal = ({ children, display, setDisplay, className }) => {
    //const [display, setDisplay] = useState(false)

    if (display) {

        return (
            ReactDOM.createPortal(
                <div className="modal-wrapper">
                    <div className="modal-background" onClick={()=>{setDisplay(false)}}></div>
                    <div className={"modal-box "+className}>
                        {children}
                    </div>
                </div>
            , document.getElementById("modal-root"))
        )
    }
    return null
}

export default Modal
