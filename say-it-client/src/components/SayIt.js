import React, {useState, useContext} from 'react'
import Switch from './Switch'
import AdvancedModal from './AdvancedModal'
import LoadingModal from './LoadingModal'
import querystring from 'querystring'
import { GlobalContext, useStateSession } from '../context/GlobalState'

var controller;

const SayIt = () => {
    const { dispatch } = useContext(GlobalContext)

    const [loading,setLoading] = useState(false)
    const [text, setText] = useStateSession('user-input','')
    const [display, setDisplay] = useStateSession('advanced-display',false)
    const [punctuation, setPunctuation] = useStateSession('matchPunctuation',false)
    const [case_, setCase] = useStateSession('matchCase',false)
    const [advanced, setAdvanced] = useStateSession('advanced-settings',{
        length: "minimum",
        explicit: true,
        depth: 10
    })

    const setLength = () => {
        setAdvanced({...advanced, length: document.querySelector('input[name="length"]:checked').value})
    }
    const setExplicit = (value) => {
        setAdvanced({...advanced, explicit: value})
    }
    const setDepth = (value) => {
        setAdvanced({...advanced, depth: value})
    }


    const sayIt = () => {
        controller = new AbortController()
        let qs = querystring.stringify({
            sentence: text,
            matchCase: case_,
            matchPunctuation: punctuation,
            length: advanced.length,
            explicit: advanced.explicit,
            depth: advanced.depth
        })
        setLoading(true)
        fetch("/search?"+qs,{signal: controller.signal})
        .then(res => {if (res.status === 404){
                return null
            }
            else
                return res.json()
        })
        .then(data => {
            setLoading(false)
            console.log(data)
            sessionStorage.setItem("playlist",JSON.stringify(data))
            dispatch({
                type: "NEW_PLAYLIST",
                payload: data
            })
        }).catch(err => {
            if (err !== 'abort')
                setLoading(false)
        })
    }

    return (
        <div className="say-it">
            <AdvancedModal display={display} setDisplay={setDisplay} handleChange={[setLength, setExplicit, setDepth]} depth={advanced.depth} explicit={advanced.explicit}></AdvancedModal>
            <LoadingModal display={loading} setDisplay={(val)=>{}} count={text.split(' ').length} depth={advanced.depth} cancel={()=>{controller.abort()}}/>
            <div className="left">
                <p className="desc">
                    type a message and we'll find songs that write it out
                </p>
                <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="say it here..."></textarea>
                <div className="settings">
                    <label><Switch id="case" checked={case_} onChange={setCase}/>match case</label>
                    <label><Switch id="punctuation" checked={punctuation} onChange={setPunctuation}/>match punctuation</label>
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

