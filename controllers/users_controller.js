// users_controllers.js

var crypto = require('crypto');
var mongoose = require('mongoose');
var scraper = require('./scraper');
    
tvpUserSchema = mongoose.model('tvpUserSchema');

function myHash(s){
        
    return crypto.createHmac('sha256', 'records!@#$%^&*tapes').update(s).digest('base64').toString();
        
}
    
// SIGN UP
exports.signup = function(req, res) {
        
    var user = new tvpUserSchema({ uid: myHash(req.ip) });
     
    user.save(function(err){
            
        if(err){
                
            req.session.msg = "INVALID USER INFO";
            console.log('COULD NOT SAVE USER');    
            res.render('index');
                
        } else {
                
            // SUCCESS
                
            req.session.user = user.uid;
            req.session.msg = 'USER IN SESSION';

            console.log('NEW USER COOKIED');   
            res.cookie('tvpTest', user.uid, { maxAge: 60*60*60*24*90 });    
            res.render('index');
                
        }
            
    });
        
}; // END SIGN UP
    
    
// LOGIN
exports.login = function(req, res) {
           
    tvpUserSchema.findOne({ uid: req.cookies.tvpTest })
        
    .exec(function(err, user){
            
        // NOT FOUND 
        if(!user) {
                
            // ERROR | NO USER FOUND IN DB
            console.log('USER NOT FOUND BY COOKIE: ' + req.cookies.tvpTest);    
            err = 'user not found';
                
        } else {
                
            // ****** SUCCESS ******
                
            req.session.regenerate(function(){
                    
                req.session.user = user.uid;      
    
                console.log('USER AUTHENTICATED by COOKIE: ' + user.uid);

                res.cookie('tvpTest', user.uid, { maxAge: 60*60*60*24*90 });
                res.render('index');

            });
        }

        if(err) {
            
            console.log('LOGIN FAIL routing to SIGNUP: ' + req.ip);
	    exports.signup(req, res);

        }

    }); // END exec()
        
}; // END LOGIN
    
// UPDATE USER 
exports.updateUser = function(req, res) {
 
    var url = req.body.myURL;
 
    tvpUserSchema.findOne({ uid: req.session.user })
        
    .exec(function(err, user){
            
        if(req.body.myURL && user){
                
            user.searches.push(req.body.myURL);
            user.set('modified', Date.now());

        }    

        // SAVE()
            
        user.save(function(err){
                
           if(err){

               console.log('ANONYMOUS USER ROUTED TO SCRAPER ' + req.ip);     
               scraper.scrape(url, req, res);
                    
           } else {

               req.session.msg = 'USER UPDATED';

               console.log('ADDING SEARCH QUERY to USER HISTORY: ' + req.body.myURL);
               console.log('SENDING USER to SCRAPER: ' + user.uid);

               scraper.scrape(url, req, res);
                
            }
                      
        }); // END save()
            
    });
        
}; // END UPDATE USER

//RECENT SEARCHES
exports.recentSearches = function(req, res) {
    
    console.log("LAST FIVE SEARCHES FOR: " + req.session.user);
    
    if(req.session.user) {

        tvpUserSchema.findOne({ uid: req.session.user })

        .exec(function(err, user){

            // NOT FOUND 
            if(!user) {

                // ERROR | NO USERNAME FOUND IN DB
                console.log('USER NOT FOUND: ' + req.body.lookup);
                err = 'user not found';

            } else {

                // ****** SUCCESS  ******
                res.json(user.searches.slice(-5));

            }

            if(err) {
                res.json({found: -1});
            }

        }); // END exec()

    } else { // END if COOKIE

       return;

    }
};
