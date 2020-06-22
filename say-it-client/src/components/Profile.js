import React, { useContext} from 'react'
import { GlobalContext } from '../context/GlobalState'
import placeholder from './../img/placeholder.jpg'

const Profile = () => {
    const {dispatch, state: { user, loggedIn } } = useContext(GlobalContext);

    
    const logout = () => {
        dispatch({ type: 'LOGOUT' })
        sessionStorage.removeItem("user")
        fetch('/logout', { method: 'POST', credentials: 'include'}).then(window.location.reload())
    }

    return (
        <>
        <div className="profile">
            <p className="user-name" onClick={()=>{openDropdown("profile-dropdown")}}>{loggedIn ? user.name : ''}</p>
            <img src={loggedIn ? user.image : placeholder } alt='profile' className="profile-image" onClick={()=>{openDropdown("profile-dropdown")}}></img>
            <div className="dropdown" id="profile-dropdown" onClick={loggedIn ? logout : login}>
                <span>{loggedIn ? "Log Out" : "Log In"}</span>
            </div>       
        </div>
         
        </>
    )
}

export default Profile

export const login = () => {
    window.location.href = sessionStorage.getItem('production')==1 ? "http://localhost:8888/login" : '/login'
}


function openDropdown(id) {
    const hideOnClickAway = (element) => {
        const outsideClickListener = event => {
            element.style.display="none"
            removeClickListener()
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