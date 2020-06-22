import React, { useContext} from 'react'
import { GlobalContext, useStateSession } from '../context/GlobalState'
import SaveItModal from './SaveItModal';
import {login} from './Profile'


const SaveIt = () => {
    const {state: { loggedIn, playlist } } = useContext(GlobalContext);
    const [display, setDisplay] = useStateSession('saveitDisplay',false)
   
    return (
        <div className="save-it">
            <SaveItModal display={display} setDisplay={setDisplay}></SaveItModal>
            <p className={(loggedIn || playlist.length === 0) ? "loggedIn" : ""} onClick={login}>log in to Spotify to</p>
            <div className={"btn"+((!loggedIn || playlist.length === 0) ? " gray" : " green")} id="save-it" onClick={loggedIn ? ()=>{setDisplay(true)} : null}>SAVE IT</div>
        </div>
    )
}

export default SaveIt


