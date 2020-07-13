import React from 'react'

const Song = ({name,url,artists,album,id,mobile}) => {
    return (
        <li className="song" key={id}>
            {
                !mobile ? (<>
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
                </>) :
                <>
                    <div className="track-mobile">
                        <a href={url} target="_blank" rel="noopener noreferrer">
                            {name}
                        </a>
                    </div>
                    <div className="artist-album-mobile">
                        {artists.map((artist,index)=>
                            <React.Fragment key={index}>
                                <>{index ? ', ' : ''}</>
                                <a href={artist.external_urls['spotify']} target="_blank" rel="noopener noreferrer">
                                    {artist.name}
                                </a>
                            
                            </React.Fragment>
                        )}
                        {
                            album.name ? (<>
                                <span>&nbsp;<span style={{fontSize: '0.5em', display:'table-caption'}}>●</span>&nbsp;</span>
                                <a href={album.external_urls['spotify']} target="_blank" rel="noopener noreferrer">
                                    {album.name}
                                </a>
                            </>):null
                        }
                    </div>
                </>
            }
            
        </li>
    )
}

export default Song
