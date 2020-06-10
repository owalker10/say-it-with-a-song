import React from 'react'
import './Radio.css'

// custom radio buttom

const Radio = ({ name, checked, children, onChange }) => {
    return (
        <label className="radio-container">
            <input type="radio" defaultChecked={checked ? "checked" : ""} name={name} value={children} onChange={onChange}></input>
            <span className="checkmark"></span>
            <span className="label">{children}</span>
        </label>
    )
}

export default Radio
