import React, { useContext, useState } from 'react'
import Modal from './Modal'
import './Modal.css'
import { GlobalContext } from '../context/GlobalState'
import { login } from './Profile'
import LoadingScreen from './LoadingScreen'


const SaveItModal = (props) => {
    const {state: { user, playlist } } = useContext(GlobalContext);
    const [saving, setSaving] = useState(false)
    const [name, setName] = useState("");
    const [desc, setDesc] = useState("");
    return (
        <Modal {...props} className="save-it">
            <LoadingScreen display={saving} setDisplay={(val)=>{}}/>
            <h1>SAVE IT TO SPOTIFY</h1>
            <p className="logIn">logged in as {user.name} (<span id="change" onClick={login}>change</span>)</p>
            
            <div className="fields">
                <p>Name</p>
                <input type="text" className="name" value={name} placeholder="Playlist name" onChange={(e)=>{setName(e.target.value)}}/>
                <p>Description</p>
                <textarea className="desc" value={desc} placeholder="Give your playlist a catchy description" onChange={(e)=>{setDesc(e.target.value)}}/>
            </div>
            
            <div className="container"><div className="btn" id="save" onClick={()=>{saveIt(playlist,user.id,name,desc,setSaving,props.setDisplay)}}>SAVE</div><p id='created'>(playlists will be created as private)</p></div>
            
        </Modal>
    )
}

export default SaveItModal

const saveIt = (playlist,userID,name,desc,setSaving,setDisplay) => {
    setSaving(true)
    fetch('/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({uris: playlist.map(song=> {
            return song.uri
            }),
            userID: userID,
            name: name,
            desc: desc
        })
    }).then(response => {
        console.log(response.status)
        setSaving(false)
        setDisplay(false)
    }).catch(e=>{setSaving(false)})
}