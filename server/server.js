let fs = require('fs')
let express = require('express')
let request = require('request')
let querystring = require('querystring')
let http = require('http');
let cookieParser = require('cookie-parser');
let bodyParser = require('body-parser')
let path = require('path')
let dns = require('dns')

/*
TO DEPLOY

"npm run build" in client dir
move build dir into server dir
"cd .."
"heroku login"
"heroku git:remote -a say-it"
"git subtree push --prefix server heroku master"
*/

let app = express()
console.log(process.env.DEV==='1')
var {"client-id": SPOTIFY_CLIENT_ID, "client-secret": SPOTIFY_CLIENT_SECRET, "cookie-secret": COOKIE_SECRET}
  = (process.env.DEV) ? 
  JSON.parse(fs.readFileSync('secret.json')) : 
  {"client-id": process.env.SPOTIFY_CLIENT_ID, "client-secret": process.env.SPOTIFY_CLIENT_SECRET, "cookie-secret": process.env.COOKIE_SECRET}

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(cookieParser(COOKIE_SECRET))
app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())


const tokenCookieOptions = {
  signed: true,
  httpOnly: true,
  maxAge: 100 * 24 * 60 * 60 * 1000 // 100 days
} 

if (process.env.DEV!=='1')
  app.use(express.static(path.join(__dirname, 'build')))

app.get('/sethost', (req,res) => { 
  if (!app.get('hostURL')) {
    if (process.env.DEV==='1')
      app.set('hostURL','http://localhost:3000')
    else
      app.set('hostURL','https' + '://' + req.get('host'))
  }
  return res.send({dev: process.env.DEV==='1' ? 1 : 0, url: app.get('hostURL')})

})

// AUTHORIZATION ////////////////////////////////////////

const callbackURL = () => {
  if (process.env.DEV==='1')
    return 'http://localhost:8888/callback'
  else
    return app.get('hostURL')+'/callback'
}

app.get('/login', function(req, res) {
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: SPOTIFY_CLIENT_ID,
      scope: 'playlist-modify-private',
      show_dialog: true,
      redirect_uri: callbackURL()
    }))
})

app.post('/logout', function(req,res) {
  res.set('Access-Control-Allow-Origin', app.get('hostURL'))
  res.set('Access-Control-Allow-Credentials',true)
  res.clearCookie('tokens')
  res.end()
})

// where Spotify redirects after login
app.get('/callback', function(req, res) {
  if (req.query.error){
    console.log("Error in authentication: " + req.query.error)
    res.redirect(app.get('hostURL'))
  }
  else {
    let code = req.query.code || null
    let authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: callbackURL(),
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (Buffer.from(
          SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET
        ).toString('base64'))
      },
      json: true
    }
    request.post(authOptions, function(error, response, body) {
      res.cookie('tokens', JSON.stringify({ // send the tokens to the browser as a signed cookie
        access: body.access_token,
        refresh: body.refresh_token
      }),
      tokenCookieOptions)
      res.redirect(app.get('hostURL'))
    })
  }
})

// get the client auth token used for searching
var authorize_client = () => {return new Promise(function(resolve, reject) {
  let client_token = app.get('client_token')
  if (client_token)
    return resolve(client_token);
  else {
    let authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        grant_type: 'client_credentials'
      },
      headers: {
        'Authorization': 'Basic ' + (Buffer.from(
          SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET
        ).toString('base64'))
      },
      json: true
    }

    request.post(authOptions, function(error, response, body) {
      if (error || body.error) {
        console.log("Error in client authorization: "+(error || body.error))
        return reject(error || body.error)
      }
      else {
        app.set('client_token',body.access_token)
        return resolve(body.access_token)
      }
    })
  }  
})}

// check browser's cookies to see if we remember a user
app.get('/check-auth',(req,res) => {
  if (req.signedCookies.tokens) {
    let { access, refresh } = JSON.parse(req.signedCookies.tokens)
    let authOptions = {
      url: 'https://api.spotify.com/v1/me',
      headers: {Authorization: 'Bearer '+access},
      json: true
    }
    request.get(authOptions, function(error, response, body){
      if (response.statusCode == 401) {
        refresh_access(refresh).then(
          (access_token) => {
            authOptions.headers = {Authorization: 'Bearer '+access_token}
            request.get(authOptions, function(err, resp, bod){
              res.cookie('tokens', JSON.stringify({ // send the tokens to the browser as a signed cookie
                access: access_token,
                refresh: refresh
              }),{
                signed: true,
                httpOnly: true,
                maxAge: 14 * 24 * 60 * 60 * 1000 // 14 days
              })
              res.status(200).json(bod)
            })
          },
          (error) => {res.sendStatus(401)}
        )
      }
      else {
        if (response.statusCode !== 200)
          res.sendStatus(response.statusCode)
        else 
        res.status(200).json(body)
      }
    })
  }
  else
    res.sendStatus(204)
})

// use the refresh token to get another auth token
var refresh_access = (refresh_token) => { return new Promise((resolve,reject) => {
  let authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    headers: {
      'Authorization': 'Basic ' + (Buffer.from(
        SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET
      ).toString('base64'))
    },
    json: true
  }

  request.post(authOptions, function(error, response, body) {
    if (body.access_token) {
      return resolve(body.access_token)
    }
    else {
      return reject(error)
    }
  })
})
}

// SONG SEARCHING //////////////////////////////////////

var cache = {}

// try to create a playlist from the input phrase and settings
app.get('/search', function(req, res, next) {
  res.connection.setTimeout(0);
  req.setTimeout(5 * 60 * 1000 + 100) // 5 minutes
  let end = false
  req.on('close', (err => {// happens if user clicks CANCEL or closes app
    end=true
    return res.end()
  }))
  authorize_client().then(
    token => {
      let { sentence, matchPunctuation, matchCase, explicit, depth } = req.query
      depth = parseInt(depth) 
      matchCase = matchCase == 'true'
      matchPunctuation = matchPunctuation == 'true'
      explicit = explicit == 'true'
      if (!matchPunctuation)
        sentence = sentence.replace(/[.,'\/#!$%\^&\*;:{}=\-_`~()]/g,"")
      if (!matchCase) {
        sentence = sentence.toLowerCase()
      }



      //https://stackoverflow.com/questions/25458879/algorithm-to-produce-all-partitions-of-a-list-in-order
      // iterate through every possible grouping of words and search for those as songs via Spotify API
      let partitionSearch = async () => { 
        var p;
        let word_arr = sentence.split(/\s+/)
        for (p = 0; p < Math.pow(2,word_arr.length - 1); p++){
          if (end) // happens if user clicks CANCEL or closes app
            break
          let groups = []
          let group = []

          var i;
          for (i = 0; i < word_arr.length; i++) {
            group.push(word_arr[i])
            if (((p >> i) & 1) || i === word_arr.length - 1) {
              groups.push(group)
              group = []
            }
          }
          try{
              let playlist = await Promise.all(groups.map(g => {
                return search(g.join(" "),token,[matchCase,matchPunctuation,explicit,depth])
              }))
            return playlist
          }
          catch(e){continue}
        }
        return null;
      }

      partitionSearch().then(songs => {
        cache = {}
        if (!songs) {
          res.sendStatus(404)
        }
        else {
          let playlist = songs.map(song => (
            {
              album: song.album,
              artists: song.artists,
              url: song.external_urls["spotify"],
              id: song.id,
              uri: song.uri,
              name: song.name
            }
          ))      
          res.send(playlist)
        }
      }).catch(e=> {
        if (!end)
          console.log('error in sending reponse: '+ e)
      })
    },
    error => {
      console.log("Error in client authentication: " + error)
      res.redirect(app.get('hostURL'))
    }
  )
})
  

// use the Spotify search endpoint to try to find a song that matches the phrase and settings
var search = (query,token,[matchCase, matchPunctuation, explicit, depth]) => {
  return new Promise(function(resolve,reject){
    let cached = cache[query]
    if (cached) {
      if (cached === 'none')
        return reject(null)
      else
        return resolve(cached)
    }
    let q = '"' + query.replace(/\s+/g,"+") + "'"
    let qstring = querystring.stringify({
      q: q,
      type: "track",
      limit: depth
    })
    let options = {
      url: "https://api.spotify.com/v1/search?"+qstring,
      json: true,
      headers: {'Authorization': 'Bearer '+token}
    }
    request.get(options, function(error, response, body){
      if (!response){ // Spotify timeout probably
        return reject(null)
      }
      if (response.statusCode===429){ // Spotify is making us wait
        setTimeout(()=>{
          console.log('waiting for '+(response.headers['retry-after'] || response.headers['Retry-After'])+' seconds')
          search(query,token,[matchCase, matchPunctuation, explicit, depth]).then(
            res=> { return resolve(res)},
            rej => { return reject(null) }
          )
        }, (response.headers['retry-after'] || response.headers['Retry-After'] || 1)*1000)
      }
      else if (response.statusCode===401) { // client auth token timed out
        app.set('client_token',null)
        authorize_client().then(
          newToken => {
          search(query,newToken,[matchCase, matchPunctuation, explicit, depth]).then(
            res => { return resolve(res) },
            rej => { return reject(null) }
          )},
          error => { console.log("Error in client authentication: " + error) }
        )
      }
      else if (response.statusCode!==200){
        console.log("Error in searching for tracks: "+response.statusCode,response.statusMessage)
        return reject(null)
      }
     else if (!body.tracks)
      {
        cache[query] = 'none'
        return reject(null)
      }
      else {  
        let songs = body.tracks.items
        for (const song of songs) {
          //console.log(song.name)
          let name = song.name.replace(/\s\(feat\..*\)/,"") // take out " (feat. [artist])"
          if (!matchPunctuation)
            {name = name.replace(/[.,'\/#!$%\^&\*;:{}=\-_`~()]/g,"")}
          if (!matchCase)
            {name = name.toLowerCase()}
          if ((name === query) && (!song.explicit || explicit)) {
            //console.log(song.name)
            cache[query] = song
            return resolve(song);
          }
        }
        cache[query] = 'none'
        return reject(null)
      }
    })
  })
}

app.get('/playlistByID',(req,res) => {
  authorize_client().then(
    token => {
      let ids = req.query.id
      if (!ids)
        res.sendStatus(404)
      searchByIDs(ids,token,songs=>{
        let playlist = songs.map(song => (
          {
            album: song.album,
            artists: song.artists,
            url: song.external_urls["spotify"],
            id: song.id,
            uri: song.uri,
            name: song.name
          }
        ))      
        res.send(playlist)
      })
      

    },
    error => { console.log("Error in client authentication: " + error) }
  )
})

var searchByIDs = (ids,token,callback) => {
  let options = {
    url: "https://api.spotify.com/v1/tracks?ids="+(typeof ids == 'string' ? ids : ids.join(',')),
    json: true,
    headers: {'Authorization': 'Bearer '+token}
  }
  request.get(options,(error,response,body)=>{
    if (response.statusCode === 401) { // client token expired
      app.set('client_token',null)
        authorize_client().then( newToken => {
          return searchByIDs(ids,newToken,callback)
        })
    }
    else if (response.statusCode !== 200){
      console.log('Error in id search: '+response.statusCode)
      return callback(null)
    }
    else {
      let songs = response.body.tracks
      if (!songs || songs.includes(null))
        return callback(null)
      return callback(songs)
    }
  })
}

// CREATE NEW SPOTIFY PLAYLIST //////////////////////////////

app.post('/save',(req,res) => {
  let {uris, userID, name, desc} = req.body
  if (!name)
    name="unnamed playlist from Save It With a Song"
  if (!(uris && userID))
    res.sendStatus(404)

  name = name.replace(/!|\*|'/g,'')
  desc = desc.replace(/!|\*|'/g,'')

  // options for playlist POST
  let { access, refresh } = JSON.parse(req.signedCookies.tokens)
  let options = {
    url: 'https://api.spotify.com/v1/users/'+ userID +'/playlists',
    headers: {Authorization: 'Bearer '+access},
    json: true,
    form: JSON.stringify({
      name: name,
      public: false,
      description: desc
    })
  }
  request.post(options, function(error, response, body){
    if (response.statusCode == 401) { // auth token expired
      refresh_access(refresh).then( // use refresh to get new one
        (access_token) => {
          options.headers = {Authorization: 'Bearer '+access_token}
          request.get(options, function(err, resp, bod){
            res.cookie('tokens', JSON.stringify({ // send the tokens to the browser as a signed cookie
              access: access_token,
              refresh: refresh
            }),{
              signed: true,
              httpOnly: true,
              maxAge: 14 * 24 * 60 * 60 * 1000 // 14 days
            })
            if (resp.statusCode !== 200 && resp.statusCode !== 201 || !resp.body.id)
              res.sendStatus(resp.statusCode)
            else { // now add the songs and send back the url to the playlist
              addSongs(uris,resp.body.id,access_token,(status) => {
                if (status !== 201) {
                  res.sendStatus(status)
                res.status(201).json(resp.body.external_urls.spotify)
                }
              })
            }
          })
        },
        (error) => {res.sendStatus(401)}
      )
    }
    else {
      if (response.statusCode !== 200 && response.statusCode !== 201 || !response.body.id)
        res.sendStatus(response.statusCode)
      else {
        addSongs(uris,response.body.id,access,(status) => {  // now add the songs and send back the url to the playlist
          if (status !== 201)
            res.sendStatus(status)
          res.status(201).json(response.body.external_urls.spotify)
        })
      }
    }
  })
  
})


const addSongs = (songURIs, playlistID, token, callback) => {
  let options = {
    url: 'https://api.spotify.com/v1/playlists/' + playlistID + '/tracks',
    headers: {Authorization: 'Bearer '+token},
    json: true,
    form: JSON.stringify({
      uris: songURIs
    })
  }
  request.post(options,(error, response, body)=>{
    callback(response.statusCode)
  })
}


///////////////////////////////////////////////

app.get('/test3', (req,res) => {
  console.log(res.url)
  res.end()
})


app.get('/auth', (req,res) => {
  res.send('You')
})

if (process.env.DEV!=='1')
  app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'))
  })


let port = process.env.PORT || 8888
console.log(`Listening on port ${port}`)

const server = app.listen(port)
server.setTimeout(5 * 60 * 1000)