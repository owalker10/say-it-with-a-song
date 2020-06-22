import React from 'react'
import Spinner from './Spinner'
import Modal from './Modal'

const LoadingModal = (props) => {
    let songNum = props.depth*(props.count * (props.count+1))/2
    let comboNum = Math.pow(2,props.count-1)
    return (
        <Modal {...props} className="load">
            <div className="searching">
                <h3>SEARCHING...</h3>
                <Spinner/>
            </div>
            <p>hang on, we’re looking through <span className='bold'>{songNum}</span> songs and <span className='bold'>{comboNum}</span> possible word combinations</p>
            <div className="btn" id="cancel" onClick={props.cancel}>CANCEL</div>
                
        </Modal>
    )
}

export default LoadingModal
