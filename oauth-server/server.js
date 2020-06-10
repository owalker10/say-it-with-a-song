let fs = require('fs')
let express = require('express')
let request = require('request')
let querystring = require('querystring')


let app = express()

var {"client-id": SPOTIFY_CLIENT_ID, "client-secret": SPOTIFY_CLIENT_SECRET}
  = JSON.parse(fs.readFileSync('secret.json'))

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

let redirect_uri = 
  process.env.REDIRECT_URI || 
  'http://localhost:8888/callback'

app.get('/login', function(req, res) {
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: SPOTIFY_CLIENT_ID,
      scope: 'user-read-private user-read-email',
      redirect_uri
    }))
})

app.get('/callback', function(req, res) {
  if (req.query.error){
    console.log("Error in authentication: " + req.query.error)
    res.redirect(process.env.FRONTEND_URI || 'http://localhost:3000')
  }
  else {
    let code = req.query.code || null
    let authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(
          SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET
        ).toString('base64'))
      },
      json: true
    }
    request.post(authOptions, function(error, response, body) {
      var access_token = body.access_token
      let uri = process.env.FRONTEND_URI || 'http://localhost:3000'
      res.redirect(uri + '?access_token=' + access_token)
    })
  }
})

var authorize_client = new Promise(function(resolve, reject) {
  let client_token = app.get('client_token')
  if (client_token)
    resolve(client_token);
  else {
    let authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        grant_type: 'client_credentials'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(
          SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET
        ).toString('base64'))
      },
      json: true
    }

    request.post(authOptions, function(error, response, body) {
      if (error) {
        console.log("Error in client authorization: "+error)
        reject(error)
      }
      else {
        app.set('client_token',client_token)
        resolve(body.access_token)
      }
    })
  }  
})

app.get('/search', function(req, res) {
  authorize_client.then(
    token => {
      let { sentence, matchPunctuation, matchCase, explicit } = req.query
      matchCase = matchCase == 'true'
      matchPunctuation = matchPunctuation == 'true'
      if (!matchPunctuation)
        sentence = sentence.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"")
      if (!matchCase) {
        sentence = sentence.toLowerCase()
      }

      let sequence = (words) => { // recursive algorithm to look for song combinations
        return new Promise(function(resolve, reject) {
          search(words,token,[matchCase, matchPunctuation, explicit]).then(
            song => {
              if (song)
                return resolve([song])
              let word_arr = words.split(/\s+/)
              for (let i = 1; i < word_arr.length; i++){
                Promise.all([
                  sequence(word_arr.splice(0,i).join(" ")),
                  sequence(word_arr.join(" "))])
                  .then(([left,right]) => {
                      if (left && right) {
                        resolve(left.concat(right))
                        return
                      }
                    }
                  )
              }
              resolve(null)
              return
          })
        })
      }  
      

      sequence(sentence).then(songs=>{
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
              name: song.name
            }
          ))      
          res.send(playlist)
        }
      })

    },
    error => {
      console.log("Error in authentication: " + error)
      res.redirect(process.env.FRONTEND_URI || 'http://localhost:3000')
    }
  )
})

var search = (query,token,[matchCase, matchPunctuation, explicit]) => {
  return new Promise(function(resolve,reject){
    let q = '"' + query.replace(/\s+/g,"+") + "'"
    let qstring = querystring.stringify({
      q: q,
      type: "track"
    })
    let options = {
      url: "https://api.spotify.com/v1/search?"+qstring,
      json: true,
      headers: {'Authorization': 'Bearer '+token}
    }
    request.get(options, function(error, response, body){
      if (error){
        console.log("Error in searching for tracks: "+error)
        res.redirect(process.env.FRONTEND_URI || 'http://localhost:3000')
      }
      let songs = body.tracks.items
      for (const song of songs) {
        let name = song.name.replace(/ \(feat\..*\)/,"") // take out (feat. [artist])
        if (!matchPunctuation)
          name = name.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"")
        if (!matchCase)
          name = name.toLowerCase()
        if (name == query && !(song.explicit && !explicit)) {
          resolve(song);
          return
        }
      }
      resolve(null)
      return
    })
  })
}

app.get('/test', (req,res) => {
  res.send("hello, "+req.query.text)
})

let port = process.env.PORT || 8888
console.log(`Listening on port ${port}. Go /login to initiate authentication flow.`)
app.listen(port)