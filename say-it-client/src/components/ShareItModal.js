import React, { useEffect } from 'react'
import Modal from './Modal'
import './Modal.css'

const ShareItModal = (props) => {

    useEffect(() => {selectText("url-box")})

    return (
        <Modal {...props} className="share-it">
             <h1>SHARE IT</h1>
            <div className="wrapper">
                <input type='text' className="url-box" id="url-box" readOnly={true} value='aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaabbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'></input>
                <div id="copy">
                    <div className="btn" onClick={()=>{copyURL("url-box")}}>COPY</div>
                    <div id="copied">copied!</div>
                </div>
            </div>
            <p className="desc">
                Share this link with someone to give them access to this playlist directly within our app
            </p>
        </Modal>
    )
}


export default ShareItModal


function copyURL(node) {
    selectText(node);
    document.execCommand("copy");
    document.getElementById("copied").classList.add("active")
}

function selectText(node) {

    node = document.getElementById(node);
    if (node) {
        node.focus()
        node.select()
    }
}