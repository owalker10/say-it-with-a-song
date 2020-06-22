import React from 'react'

const Song = ({name,url,artists,album,id}) => {
    return (
        <li className="song" key={id}>
            <span className="track">
                <a href={url} target="_blank" rel="noopener noreferrer">
                    {name}
                </a>
            </span>
            <span className="artist">
                {artists.map((artist,index)=>
                    <React.Fragment key={index}>
                        <>{index ? ', ' : ''}</>
                        <a href={artist.external_urls['spotify']} target="_blank" rel="noopener noreferrer">
                            {artist.name}
                        </a>
                    
                    </React.Fragment>
                )}
            </span>
            <span className="album">
                <a href={album.external_urls['spotify']} target="_blank" rel="noopener noreferrer">
                    {album.name}
                </a>  
            </span>
        </li>
    )
}

export default Song
