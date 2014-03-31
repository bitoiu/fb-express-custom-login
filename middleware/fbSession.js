var request = require('request')

exports.validSession = function (req,res,next) {

  console.log("Validating fb session")

   if(req.session.fbToken) {

    console.log("Token found")

    debugFacebookToken(req.session.fbToken, function(error) {

      /* The fb API most likelly didn't have peer review. The only way to detect
      if the user didn't accept the permissions you asked for is to query user/permissions.
      This means you might be asking a token (which will still be valid) for the user although
      he clicked skip. However when you try to do a query, if it needs additional privileges
      it will fail. */
      if(!error) {
        console.log("Valid token")
        next()
      }

    })

   } else if (isFBGetCodeResponse(req)) {

    console.log("Processing CODE response from Facebook")

    var accessTokenReq = app.get('fb-graph-url') + "/oauth/access_token"
      + '?client_id=' + app.get('fb-id')
      + '&client_secret=' + app.get('fb-secret')
      + '&code=' + req.query.code
      + '&redirect_uri=' + app.get('fb-redirect')

    request(accessTokenReq, function (error, response, body) {
      if (!error && response.statusCode == 200) {

        var accessToken = body.match(/access_token=([^&]*)/)[1]

        console.log("Got access token: %s", accessToken)
        req.session.fbToken = accessToken

        next()
      } else {
        res.send(body)
      }
    })

  } else {

    console.log('No facebook session token, redirecting')

    res.redirect('https://www.facebook.com/dialog/oauth?client_id=' + app.get('fb-id')
      + '&redirect_uri=' + app.get('fb-redirect')
      + '&scope=' + app.get('fb-scope'))
  }
}

var isFBGetCodeResponse = function(req) {

  return !!req.query.code
}

var debugFacebookToken = function(accessToken, callback) {

  console.log("Checking with facebook token validity")

  var validTokenRequest = app.get('fb-graph-url') + "/debug_token"
    + '?input_token=' + accessToken
    + '&access_token=' + accessToken

  request(validTokenRequest, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      callback(null)
    } else {
      callback(error)
    }
  })
}