import React from 'react'
import './Spinner.css'


const Spinner = () => {
    let bars = []
    for (let i = 0; i < 5; i++){
        bars.push(<div className='bar' style={barStyle(i)} key={i}/>)
    }
    return (
        <div id='bars' style={containerStyle}>
            {bars}
        </div>
    )
}

export default Spinner


const [width, height] = [15,6]
const barStyle = (i) => {
    
    return {
        display: 'block',
        background: '#877D23',
        borderRadius: width+'px',
        bottom: '0px',
        height: height+'px',
        width: width+'px',
        animation: 'wave 1.3s infinite ease-in-out',
        animationDelay: .2*i+'s',
        alignSelf: 'center',
        margin: '0 3px'
    }
}

const containerStyle = {
    position: "relative",
    display: "flex",
    height: '60px'
}
