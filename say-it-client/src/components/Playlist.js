import React, { useContext } from 'react'
import { GlobalContext } from '../context/GlobalState'

const Playlist = () => {
    const {state: { playlist } } = useContext(GlobalContext);

    return (
        <div className="playlist">
            <div className="header">
                <span className="title">title</span>
                <span className="artist">artist</span>
                <span className="album">album</span>
            </div>
            <ul className="songs">
                {playlist.map(({track, artist, album}) => (
                    <li className="song">
                        <span className="track">{track}</span>
                        <span className="artist">{artist}</span>
                        <span className="album">{album}</span>
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default Playlist
