import React, { useContext, useState } from 'react'
import { GlobalContext } from '../context/GlobalState'
import SaveItModal from './SaveItModal';


const SaveIt = () => {
    const {state: { loggedIn } } = useContext(GlobalContext);
    const [display, setDisplay] = useState(false)
   
    return (
        <div className="save-it">
            <SaveItModal display={display} setDisplay={setDisplay}></SaveItModal>
            <p className={loggedIn ? "loggedIn" : ""}>log in to Spotify to</p>
            <div className={"btn"+(loggedIn ? " loggedIn" : "")} id="save-it" onClick={loggedIn ? ()=>{setDisplay(true)} : null}>SAVE IT</div>
        </div>
    )
}

export default SaveIt


