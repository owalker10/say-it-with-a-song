import React, { createContext, useReducer, useEffect } from 'react'

/*
{
        track:"i love you",
        artist:"Billie Eilish",
        album: "WHEN WE ALL FALL ASLEEP WHERE DO WE GO"
    },
    {
        track:"More Than Words",
        artist: "Extreme",
        album:"Extreme II - Pornograffitti"
    }
}
*/

// Initial global state
const initialState = {
    loggedIn: false,
    noFind: false,
    playlist: [],
    shareurl: "",
    settings: {
        case:false,
        punctuation:false,
        advanced: {
            length: "minimum",
            explicit:true
        }
    },
    user: {} 
}

const reducer = (state, action) => {
    switch(action.type){
        case 'NEW_PLAYLIST':
            return {
                ...state,
                playlist: action.payload || [],
                noFind: !action.payload
            }
        case 'CREATE_USER':
            return {
                ...state,
                user: {
                    id: action.payload.id,
                    name: action.payload.display_name,
                    image: action.payload.images[0].url 
                },
                loggedIn: true
            }
        case 'LOGOUT':
            return {
                ...state,
                loggedIn: false,
                user: {}
            }
        case 'SHARE':
            return state
        default:
            return state;
    }
    
}


export const GlobalContext = createContext(initialState);

export const GlobalProvider = ({ children }) => {
    const [state, dispatch] = useReducer(reducer,initialState);
    useEffect(() => {
        fetch('/sethost').then(res=>res.json()).then(data=> {
            sessionStorage.setItem('dev',data.dev)
            sessionStorage.setItem('hostURL',data.url)})
        let playlist = JSON.parse(sessionStorage.getItem("playlist"))
        if (playlist)
            dispatch({type: 'NEW_PLAYLIST', payload: playlist})
        let cachedUser = JSON.parse(sessionStorage.getItem("user"))
        if (cachedUser)
            dispatch({type: 'CREATE_USER', payload: cachedUser})
        else {
            fetch('/check-auth').then(
                (res)=>{
                    if (res.status === 200)
                        res.json().then((user) => {
                            dispatch({type: 'CREATE_USER', payload: user})
                            sessionStorage.setItem("user",JSON.stringify({id: user.id, display_name: user.display_name, images: user.images}))})
                    else if (res.status !== 204)
                        console.log("Authentication error: "+res.status)
                }
            )
        }
    },[])
    return (<GlobalContext.Provider value={{
        state,
        dispatch
    }}>
        {children}
    </GlobalContext.Provider>);
}

export const useStateSession = (key, defaultValue) => {
    const [value, setValue] = React.useState(
        JSON.parse(sessionStorage.getItem(key)) || defaultValue
    );
    
    React.useEffect(() => {
        sessionStorage.setItem(key, JSON.stringify(value));
    }, [key,value]);
    
    return [value, setValue];
}
