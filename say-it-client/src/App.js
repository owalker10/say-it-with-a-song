import React from 'react';
import './App.css';
import Panel from './components/Panel'
import Profile from './components/Profile'
import SayIt from './components/SayIt'
import Playlist from './components/Playlist'
import ShareIt from './components/ShareIt'
import SaveIt from './components/SaveIt'
import Modal from './components/Modal'
import { GlobalProvider } from './context/GlobalState'
import { BrowserRouter as Router } from 'react-router-dom'

function App() {

  return (
    <Router>
      <GlobalProvider>
        <div className="App">
          <Modal />
            <Panel />
            <div className="main">
              <Profile />
              <div className="container">
                <SayIt />
                <div className="lower">
                  <Playlist />
                  <div className="buttons">
                    <ShareIt />
                    <SaveIt />
                  </div>
                </div>
              </div>
            </div>
        </div>
      </GlobalProvider>
    </Router>
    
  );
}

export default App;
