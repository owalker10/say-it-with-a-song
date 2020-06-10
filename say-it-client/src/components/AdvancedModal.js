import React, { useContext, useState } from 'react'
import Modal from './Modal'
import './Modal.css'
import { GlobalContext } from '../context/GlobalState'
import Radio from './Radio'
import Switch from './Switch'


const AdvancedModal = (props) => {
    const [setLength, setExplicit] = props.handleChange

    return (
        <Modal {...props} className="advanced">
            <h1>ADVANCED SEARCH SETTINGS</h1>
            <h4>Length of playlist</h4>
            <Radio name="length" id="minimum" checked="checked" onChange={setLength}>minimum</Radio>
            <Radio name="length" id="maximum" onChange={setLength}>maximum</Radio>
            <hr/>
            <label className="switch-label"><Switch id="explicit" checked="checked" onChange={setExplicit}/>Allow explicit songs</label>
            <hr/>
        </Modal>
    )
}



export default AdvancedModal