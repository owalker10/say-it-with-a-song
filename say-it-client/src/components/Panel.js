import React from 'react'
import logo from './../img/Spotify_Logo.svg'

const Panel = () => {
    return (
        <div className="panel">
            <div className="container">
                <div className="title-div">
                    <h1>SAY IT WITH A SONG</h1>
                    <p>a <a href="https://www.spotify.com/" target="_blank" rel="noopener noreferrer"><img id="logo" src={logo} alt="Spotify logo"/></a> web app</p>
                </div>
                <div className="desc-div">
                    <hr/>
                    <p>create custom Spotify playlists from <span className="bold">personalized messages</span></p>
                </div>
                <p style={{display:'none'}}className="about-contact">about | contact</p>
            </div>
        </div>
    )
}

export default Panel
