import React, { useContext } from 'react'
import { GlobalContext } from '../context/GlobalState'
import Song from './Song'

const Playlist = () => {
    const {state: { playlist, noFind } } = useContext(GlobalContext);

    return (
        <div className="playlist"> {
            !noFind ? (
                <>
                    <div className="header">
                        <span className="title">title</span>
                        <span className="artist">artist</span>
                        <span className="album">album</span>
                    </div>
                    <ul className="songs">
                        {playlist.map(({name, url, artists, album, id},i) => (
                            <Song name={name} url={url} artists={artists} album={album} id={id} key={i} />
                        ))}
                    </ul>
                </>
            ) : (
                <div className="nofind">
                    <h2>No results found</h2>
                    <p>Try changing the search settings or picking a slightly different phrase</p>
                </div>
            )
        }
        </div>
    )
}

export default Playlist
