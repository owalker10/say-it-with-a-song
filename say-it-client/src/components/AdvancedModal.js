import React from 'react'
import Modal from './Modal'
import './Modal.css'
import Radio from './Radio'
import Switch from './Switch'
import MaterialSlider from './MaterialSlider'


const AdvancedModal = (props) => {
    let {depth,explicit} = props
    const [setLength, setExplicit, setDepth] = props.handleChange
    

    const handleSliderChange = (e,val) => {
        setDepth(Math.round(val))
    }
    const handleSliderInputChange = (event) => {
        setDepth(isNaN(event.target.value) ? depth : Math.min(Math.max(Math.round(Number(event.target.value)), 1), 50))
    }


    return (
        <Modal {...props} className="advanced">
            <h1>ADVANCED SEARCH SETTINGS</h1>
            <h4>Spotify search depth</h4>
            <div className="slider-and-input">
                <div className="slider-container">
                    <MaterialSlider value={depth} defaultValue={10} min={1} max={50} onChange={handleSliderChange}/>
                </div>
                <input type="text" className="slider-input" value={depth} onChange={handleSliderInputChange} onClick={(e)=>{e.target.setSelectionRange(0, e.target.value.length)}}/>
            </div>
            <p>Number of songs returned in each Spotify query. Keep this small if you want a faster search time or high if you aren't getting the search result you want.</p>
            <hr/>
            <label className="switch-label"><Switch id="explicit" checked={explicit} onChange={setExplicit}/>Allow explicit songs</label>
            <hr/>
        </Modal>
    )
}



export default AdvancedModal
/*
<h4>Length of playlist</h4>
            <Radio name="length" id="minimum" checked="checked" onChange={setLength}>minimum</Radio>
            <Radio name="length" id="maximum" onChange={setLength}>maximum</Radio>
            */