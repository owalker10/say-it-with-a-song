import React, { useContext, useState } from 'react'
import Modal from './Modal'
import './Modal.css'
import { GlobalContext } from '../context/GlobalState'


const SaveItModal = (props) => {
    const {state: { user } } = useContext(GlobalContext);
    const [name, setName] = useState("");
    const [desc, setDesc] = useState("");

    return (
        <Modal {...props} className="save-it">
            <h1>SAVE IT TO SPOTIFY</h1>
            <p className="logIn">logged in as {user.name} (<span id="change">change</span>)</p>
            <div className="fields">
                <p>Name</p>
                <input type="text" className="name" value={name} placeholder="Playlist name" onChange={(e)=>{setName(e.target.value)}}/>
                <p>Description</p>
                <textarea className="desc" value={desc} placeholder="Give your playlist a catchy description" onChange={(e)=>{setDesc(e.target.value)}}/>
            </div>
            <div className="container"><div className="btn" id="save">SAVE</div></div>
            
            
        </Modal>
    )
}


export default SaveItModal