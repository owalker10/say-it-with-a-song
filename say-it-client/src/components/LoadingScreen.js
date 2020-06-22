import React from 'react'
import Spinner from './Spinner'
import Modal from './Modal'

const LoadingScreen = (props) => {
    return (
        <Modal {...props} className="load-screen">
            <Spinner/>       
        </Modal>
    )
}

export default LoadingScreen
