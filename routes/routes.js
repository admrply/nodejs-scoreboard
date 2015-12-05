// app/routes.js

var Team = require('../app/models/team.js');
var Flag = require('../app/models/flag.js');

module.exports = function(app, passport, io) {

	// HOME PAGE
    // ---------
	app.get('/', function(req, res) {
		res.sendFile('./public/index.html');
	});

	// LOGIN
	// -----
	app.get('/login', function(req, res) {

		// render the page and pass in any flash data if it exists
		res.render('login.ejs', { message: req.flash('loginMessage') });
	});

	// process the login form
	app.post('/login', passport.authenticate('local-login', {
		successRedirect : '/dashboard', // redirect to the secure profile section
		failureRedirect : '/login', // redirect back to the signup page if there is an error
		failureFlash : true // allow flash messages
	}));

	// SIGNUP
	// ------
	app.get('/signup', function(req, res) {

		// render the page and pass in any flash data if it exists
		res.render('signup.ejs', { message: req.flash('signupMessage') });
	});

	// process the signup form
	app.post('/signup', passport.authenticate('local-signup', {
		successRedirect : '/dashboard', // redirect to the secure profile section
		failureRedirect : '/signup', // redirect back to the signup page if there is an error
		failureFlash : true // allow flash messages
	}));

	// DASHBOARD
	// ---------
	// we will want this protected so you have to be logged in to visit
	// we will use route middleware to verify this (the isLoggedIn function)
    app.get('/dashboard', function(req, res) {
        if(req.isAuthenticated() && req.user.local.admin){
            res.render('ctfadmin.ejs', { user : req.user, flagCheck: "", flagStatus: "", flags: ["",""] });
        }
        else if(req.isAuthenticated()) {
            res.render('dashboard.ejs', { user : req.user, flagCheck: "", flagStatus: "" });
        }
        else {
            res.redirect('/login');
        };
    });
    
    // ADD FLAG
    // --------
    app.post('/flagman', isAdmin, function(req, res) {
        Flag.findOne({ 'flag' :  req.body.flag }, function(err, flag) {
            // if there are any errors, return the error
            if (err)
                return done(err);

            // check to see if theres already a user with that email
            if (flag) {
                return res.json({error: "That flag exists"});
//                return done(null, false, req.flash('signupMessage', 'That flag already exists.'));
            } else {

                // if there is no user with that email
                // create the user
                var newFlag = new Flag();

                // set the user's local credentials
                newFlag.flag = req.body.flag;

                // save the user
                newFlag.save(function(err) {
                    if (err)
                        throw err;
                    return res.json(newFlag);
                });
            }

        }); 
    })
    
    // DELETE FLAG
    // -----------
    app.delete('/flagman/:game_id', function(req, res) {
        Flag.remove({
            _id : req.params.flag_id
        }, function(err, flag) {
            if (err)
                res.send(err);

            // get and return all the games after you create another
            Flag.find(function(err, flag) {
                if (err)
                    res.send(err)
                res.json(flags);
            });
        });
    });
    
    // FLAGCHECK
    // ---------
    app.post('/flagcheck', isLoggedIn, function(req, res) {
        
        Flag.findOne({ flag : req.body.flag }, function(err, flag) {
            // if there are any errors, return the error
            if (err)
                return done(err);

            // If the flag exists
            if (flag) {
                Team.findOne({'local.name' : req.user.local.name}, 'local.flags', function(err, user) {
//                    console.log(user.local.flags); //Users flags
//                    console.log(flag.flag);        //Flag being checked
                    if(user.local.flags.indexOf(flag.flag) > -1) {
//                        console.log("You have this flag!");
                        res.render('dashboard.ejs', {user: req.user, flagCheck: "Um, you... You do realise you already got this flag... Right?", flagStatus: false})
                    }
                    else {
                        Team.findOneAndUpdate(
                            {'local.name': req.user.local.name},
                            {$push: {"local.flags": flag.flag}},
                            {safe: true, new : true},
                            function(err, model) {
                                console.log(err);
                            }
                        )
                        res.render('dashboard.ejs', {user: req.user, flagCheck: "Do you have a flag? I claim this challenge in the name of ", flagStatus: true});
                        io.emit('listChange');
                    }
                });
                
            } else {
                res.render('dashboard.ejs', {user: req.user, flagCheck: "You can't claim us! We live here! Plus you don't have a flag!", flagStatus: false});
            }
        }); 
        
    });
    
    // GET TEAM LIST
    // -------------
    app.get('/ranking', function(req, res) {
        Team.find({}, 'local.name local.flags', function(err, docs) {
            console.log(docs);
            if (!err){ 
                var response = docs;
                for (var i=0; i<response.length; i++) {
                    response[i].local.flags = response[i].local.flags.length;
                };
                res.json(response);
            } else {throw err;}
        });
    })

	// LOGOUT
	// ------
	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});
};

function isAdmin(req, res, next){
    if(req.isAuthenticated() && req.user.local.admin){
        console.log('cool you are an admin, carry on your way');
        next();
    } else {
        console.log('You are not an admin');
        res.redirect('/dashboard');
    }
}

// route middleware to make sure
function isLoggedIn(req, res, next) {

	// if user is authenticated in the session, carry on
	if (req.isAuthenticated())
		return next();

	// if they aren't redirect them to the home page
	res.redirect('/login');
}