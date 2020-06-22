import React, { useState, useContext, useEffect } from 'react'
import ShareItModal from './ShareItModal'
import { GlobalContext } from './../context/GlobalState'
import { Route, Redirect } from 'react-router-dom'

const ShareIt = () => {
    const [display, setDisplay] = useState(false)
    const { state: { playlist, noFind }, dispatch } = useContext(GlobalContext)
    const shareurl = sessionStorage.getItem('hostURL')+'/share?' + playlist.map(song=> {
        return 'id=' + song.id
    }).join('&')
    return (
        <>
            <Route path='/share' render={({location})=>{return <Share dispatch={dispatch} location={location}/>}}></Route>
            <ShareItModal display={display} setDisplay={setDisplay} url={shareurl}></ShareItModal>
            <div className={"btn" + (noFind || playlist.length===0 ? " gray":"")} onClick={()=>{setDisplay(true)}}>SHARE IT</div>
        </>
    )
}

export default ShareIt


const Share = ({location,dispatch}) => {
    useEffect(()=>{
        fetch('/playlistByID'+location.search)
        .then(res => {
            if (res.status===404)
                console.log('Invalid share link: unable to retrieve songs from Spotify')
            else {
                res.json().then(data => {
                    sessionStorage.setItem("playlist",JSON.stringify(data))
                    dispatch({
                        type: "NEW_PLAYLIST",
                        payload: data
                    })
                })
            }
        }, err => {
            console.log(err)
            console.log('Invalid share link: unable to retrieve songs from Spotify')
        })

    })
    return <Redirect to='/'/>
}