var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');

var mongoose = require('mongoose');
var Donor = require('./models/donor');
var config = require('./config');
var ObjectId = mongoose.Types.ObjectId;

// Babel ES6/JSX Compiler
require('babel-register');

var swig  = require('swig');
var React = require('react');
var ReactDOM = require('react-dom/server');
var Router = require('react-router');
var routes = require('./app/routes');

var async = require('async');
var request = require('request');
var xml2js = require('xml2js');
var _ = require('underscore');

var app = express();

mongoose.connect(config.database, function (error) {  
    if (error) {  
        console.error(error);  
    } else{
      console.log("Connected MongoDB successfully");
    }
});  

app.set('port', process.env.PORT || 5000);
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

/**
 * POST /api/donors
 * Adds new donor to the database.
 */
app.post('/api/donors', function(req, res, next) {
  let donorObj = req.body;
  let donorObjId = donorObj._id
  if(donorObjId){
    delete donorObj._id;
    delete donorObj.emailAddress;
    console.log("POST Request: Update", donorObj);
    Donor.update({_id: ObjectId(donorObjId)}, donorObj, function(err, donor) {
      if (err) return next(err);
      console.log("donor", donor);
      var message = [donorObj.firstName, donorObj.lastName, 'has been updated successfully!'].join(" ");
      res.send({ message: message, donorAdded: donor});
    });
  } else{
    console.log("POST Request: Create", donorObj);
    var donor = new Donor(donorObj);
    donor.save(function(err, donor) {
      if (err) return next(err);
      console.log("donor", donor);
      var message = [donorObj.firstName, donorObj.lastName, 'has been added successfully!'].join(" ");
      res.send({ message: message, donorAdded: donor});
    });
  }
});

/**
 * GET /api/characters
 * Returns all the donors present in the databases.
 */
app.get('/api/donors', function(req, res, next) {
  console.log("GET /api/donors")
  Donor.find({}, function(err, donors) {
    if (err) return next(err);

    if (donors) {
      res.json(donors);
    }
  });
});

/**
 * GET /api/characters/:id
 * id: Parameter used for finding particular donor from the database. 
 * Returns a particular donor present in the databases.
 */
app.get('/api/donors/:id', function(req, res, next) {
  Donor.findOne({_id: ObjectId(req.params.id)}, function(err, donorObj) {
    if (err) return next(err);

    if (donorObj) {
      res.json(donorObj);
    }
  });
});

app.use(function(req, res) {
  Router.match({ routes: routes.default, location: req.url }, function(err, redirectLocation, renderProps) {
    if (err) {
      res.status(500).send(err.message)
    } else if (redirectLocation) {
      res.status(302).redirect(redirectLocation.pathname + redirectLocation.search)
    } else if (renderProps) {
      var html = ReactDOM.renderToString(React.createElement(Router.RoutingContext, renderProps));
      var page = swig.renderFile('views/index.html', { html: html });
      res.status(200).send(page);
    } else {
      res.status(404).send('Page Not Found')
    }
  });
});

/**
 * Socket.io stuff.
 */
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var onlineUsers = 0;

io.sockets.on('connection', function(socket) {
  onlineUsers++;

  io.sockets.emit('onlineUsers', { onlineUsers: onlineUsers });

  socket.on('donorAdded', (data) => {
    console.log("Socket donorAdded", data);
    io.sockets.emit('donorAddedBroadcast', data.donorAdded);
    console.log("Socket donorAddedBroadcast invoked");
  });

  socket.on('disconnect', function() {
    onlineUsers--;
    io.sockets.emit('onlineUsers', { onlineUsers: onlineUsers });
  });
});

server.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});