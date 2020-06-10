import React from 'react'
import './Switch.css'

// custom toggle switch UI element

const Switch = ({ checked, id, onChange }) => {
    return (
        <label className="switch">
            <input type="checkbox" id={id} defaultChecked={checked?"checked":""} onChange={onChange}></input>
            <span className="slider round"></span>
        </label>
    )
}

export default Switch
