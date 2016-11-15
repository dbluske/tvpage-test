// routes.js
var crypto = require('crypto');
var express = require('express');

module.exports = function(app) {

    var users = require('./controllers/users_controller');
    var scraper = require('./controllers/scraper');

    app.use('/static', express.static('./static')).use('./lib', express.static('../lib'));

    app.get('/tvpage-test', function(req, res){
        
        if(req.session.user) {
            console.log('USER ' + req.session.user + ' RETURNS'); 
            res.render('index');
        } else {
            console.log('UNKNOWN USER LOGGING IN');
            users.login(req, res);
        }

    });

    app.post('/tvpage-test/url-query', function(req, res){
        
        console.log('POSTING NEW QUERY: ' + req.body.myURL);
        users.updateUser(req, res);
        
    });

    app.post('/tvpage-test/recent-searches', function(req, res){

        console.log('GETTING RECENT SEARCHES: ' + req.body.lookup);
        users.recentSearches(req, res);

    });

}
