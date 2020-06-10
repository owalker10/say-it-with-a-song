import React, {useState} from 'react'
import Switch from './Switch'
import AdvancedModal from './AdvancedModal'
import querystring from 'querystring'

const SayIt = () => {
    const [text, setText] = useState('');
    const [display, setDisplay] = useState(false);
    const [advanced, setAdvanced] = useState({
        length: "minimum",
        explicit: true
    })

    const setLength = () => {
        setAdvanced({...advanced, length: document.querySelector('input[name="length"]:checked').value})
    }
    const setExplicit = () => {
        setAdvanced({...advanced, explicit: document.getElementById('explicit').checked})
    }

    const sayIt = () => {
        let qs = querystring.stringify({
            sentence: text,
            matchCase: document.getElementById("case").checked,
            matchPunctuation: document.getElementById("punctuation").checked,
            length: advanced.length,
            explicit: advanced.explicit
        })
        fetch("/search?"+qs)
        .then(res => {return res.json()})
        .then(data => {console.log(data)})
        
        
    }

    return (
        <div className="say-it">
            <AdvancedModal display={display} setDisplay={setDisplay} handleChange={[setLength, setExplicit]}></AdvancedModal>
            <div className="left">
                <p className="desc">
                    type a message and we'll find songs that write it out
                </p>
                <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="say it here..."></textarea>
                <div className="settings">
                    <label><Switch id="case"/>match case</label>
                    <label><Switch id="punctuation"/>match punctuation</label>
                    <span className="advanced" onClick={()=>setDisplay(true)}>advanced</span>
                </div>

            </div>
            <div className="btn-container">
                <div className="btn" onClick={sayIt}>SAY IT</div>
            </div>
            
        </div>
    )
}

export default SayIt

