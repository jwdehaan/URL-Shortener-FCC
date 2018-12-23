'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var bodyparser = require('body-parser');

var cors = require('cors');

var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
mongoose.connect(process.env.MONGO_URI);

var Schema = mongoose.Schema;
var shortUrls = new Schema({
    originalurl:  String,
    shorturl: String
  });
var shortModel = mongoose.model('shortUrl', shortUrls);

module.exports = shortModel;


app.use(cors()); 

/** this project needs to parse POST bodies **/
// you should mount the body-parser here
app.use(bodyparser.urlencoded({ extended: false }));

//for the HTML
app.use('/public', express.static(process.cwd() + '/public'));
app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

//POST HANDLER
app.post('/api/shorturl/new', function(req, res) {
  
  var expression = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
  var regex = new RegExp(expression);
  
  if(regex.test(req.body.url)) {
  
  var ranDom = Math.floor(Math.random() * 1000);
  var data = new shortModel(
    {
    originalurl: req.body.url,
    shorturl: ranDom
    }
  );
  
  data.save(err => {
  if(err) {return res.send('Error saving to database')};
  });
  
res.json(data);
    
  } else {
    
    res.json({"error":"invalid URL"});
  }
  
  
});

app.get('/api/shorturl/:shorturl', function(req, res) { 
  var toDirect = req.params.shorturl.toString();
    
  shortModel.find({shorturl: toDirect}, function(err, data) {
   if (err) {
      return res.send('FAIL');
    }
    res.redirect(data[0].originalurl);
});

  
});
  
app.listen(port, function () {
  console.log('Node.js listening ...');
});