import React, { useState } from 'react'
import ShareItModal from './ShareItModal'

const ShareIt = () => {
    const [display, setDisplay] = useState(false)
    return (
        <>
            <ShareItModal display={display} setDisplay={setDisplay}></ShareItModal>
            <div className="btn" onClick={()=>{setDisplay(true)}}>SHARE IT</div>
        </>
    )
}

export default ShareIt


