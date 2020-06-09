import React, {useState} from 'react'
import Switch from './Switch'

const SayIt = () => {
    const [text, setText] = useState('');



    return (
        <div className="say-it">
            <div className="left">
                <p className="desc">
                    type a message and we'll find songs that write it out
                </p>
                <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="say it here..."></textarea>
                <div className="settings">
                    <label><Switch name="case"/>match case</label>
                    <label><Switch name="punctuation"/>match punctuation</label>
                    <span className="advanced">advanced</span>
                </div>

            </div>
            <div className="btn-container">
                <div className="btn">SAY IT</div>
            </div>
            
        </div>
    )
}

export default SayIt
