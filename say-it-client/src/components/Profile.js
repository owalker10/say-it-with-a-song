import React, { useContext, useState } from 'react'
import { GlobalContext } from '../context/GlobalState'
import { Redirect } from 'react-router-dom'

const Profile = () => {
    const {state: { user, loggedIn } } = useContext(GlobalContext);
    const [redirected, redirect] = useState(false)

    return (
        <>
        <div className="profile">
            <p className="user-name" onClick={()=>{openDropdown("profile-dropdown")}}>{user.name}</p>
            <div className="placeholder" onClick={()=>{openDropdown("profile-dropdown")}}></div>
            <div className="dropdown" id="profile-dropdown" onClick={login}>
                <span>{loggedIn ? "Log Out" : "Log In"}</span>
            </div>       
        </div>
         
        </>
    )
}

export default Profile

const login = ()=> {
    window.location.href = "http://localhost:8888/login"
}

function openDropdown(id) {
    const hideOnClickAway = (element) => {
        const outsideClickListener = event => {
            if (!element.contains(event.target)) {
            element.style.display="none"
            removeClickListener()
            }
        }

        const removeClickListener = () => {
            document.removeEventListener('click', outsideClickListener)
        }

        document.addEventListener('click', outsideClickListener)
    }

    const dropdown = document.getElementById(id)
    if (dropdown.style.display === "none" || !dropdown.style.display) {
        dropdown.style.display = "flex"
        hideOnClickAway(dropdown)
    }
    
}