/**
 * Created by championswimmer on 08/03/17.
 */
const express = require('express')
    , bodyParser = require('body-parser')
    , session = require('express-session')
    , passport = require('./passport/passporthandler')
    , path = require('path')
    , cookieParser = require('cookie-parser')
    , exphbs = require('express-hbs')
    , cors = require('cors');

const secrets = require('./secrets.json')
    , config = require('./config')
    , loginrouter = require('./routers/login')
    , connectrouter = require('./routers/connect')
    , logoutrouter = require('./routers/logoutrouter')
    , signuprouter = require('./routers/signup')
    , apirouter = require('./routers/api')
    , oauthrouter = require('./routers/oauthrouter')
    , pagerouter = require('./routers/pagerouter')
    , Client = require('./db/models').models.Client;

const app = express();

function getHostName(url) {
    var match = url.match(/:\/\/(www[0-9]?\.)?(.[^/:]+)/i);
    if (match != null && match.length > 2 && typeof match[2] === 'string' && match[2].length > 0) {
    return match[2];
    }
    else {
        return null;
    }
}

var corsOptionsDelegate = function (req, callback) {
  var corsOptions;
  Client.findById(req.query.client_id).then(data=>{
    var domain = data.dataValues.domain;
    console.log(domain)
    var found = false;
    if(domain.map(function(url){return getHostName(url)}).indexOf(getHostName(req.header('Origin')))!==-1){
        found = true;
    }
    if(found){
        corsOptions = { origin: true }
    }
    else{
        corsOptions = { origin: false }
    }
    callback(null, corsOptions)
});
};


const redirectToHome = function (req, res, next) {

    if (req.path == '/') {
        return res.redirect('/users/me');
    }

    next();

};

app.engine('hbs', exphbs.express4({
    partialsDir: path.join(__dirname, 'views/partials'),
    layoutsDir: path.join(__dirname, 'views/layouts'),
    defaultLayout: 'views/layouts/main.hbs',
}));
app.set('views', path.join(__dirname, 'views'));
app.set("view engine", "hbs");


app.use(express.static(path.join(__dirname, 'public_static')));
app.use(cookieParser(secrets.EXPRESS_SESSION_SECRET));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(session({
    secret: secrets.EXPRESS_SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    name: 'oneauth'
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(redirectToHome);
app.use('/login', loginrouter);
app.use('/connect', connectrouter);
app.use('/logout', logoutrouter);
app.use('/signup', signuprouter);
app.use('/api', cors(), apirouter);
app.use('/oauth', cors(corsOptionsDelegate), oauthrouter);
app.use('/', pagerouter);

app.listen(3838, function () {
    console.log("Listening on " + config.SERVER_URL );
});



