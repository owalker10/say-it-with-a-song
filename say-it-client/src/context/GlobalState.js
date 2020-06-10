import React, { createContext, useReducer } from 'react'


// Initial global state
const initialState = {
    loggedIn: true,
    playlist: [
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
    ],
    settings: {
        case:false,
        punctuation:false,
        advanced: {
            length: "minimum",
            explicit:true
        }
    },
    user: {
        name: "John Smith",
        id: "",
        auth_code: "",
        image: ""
    } 
}

const reducer = (state, action) => {
    switch(action.type){
        default:
            return state;
    }
}


export const GlobalContext = createContext(initialState);

export const GlobalProvider = ({ children }) => {
    const [state, dispatch] = useReducer(reducer,initialState);
    return (<GlobalContext.Provider value={{
        state,
        dispatch
    }}>
        {children}
    </GlobalContext.Provider>);
}

//console.log(typeof GlobalProvider);