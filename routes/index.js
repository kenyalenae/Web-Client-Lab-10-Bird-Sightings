var express = require('express');
var router = express.Router();
var Bird = require('../models/bird');

/* GET home page. */
router.get('/', function(req, res, next) {
// query to fetch all documents, just get the name fields, sort by name
    Bird.find().select( {name: 1, description: 1} ).sort( {name: 1} )
        .then( (birdDoc) => {
            console.log('All birds', birdDoc); // for debugging
            res.render('index', { title: 'All Birds', birds: birdDoc } )
        }).catch( (err) => {
        next(err);
    })

});

/* POST create new bird document */
router.post('/addBird', function(req, res, next){

// use form data in req.body to create a new Bird
    var bird = Bird(req.body);

// nest the nest attributes to match the Bird schema
bird.nest = {
    location: req.body.nestLocation,
    materials: req.body.nestMaterials
};

// save the Bird object to DB as new Bird document
    bird.save().then( (birdDoc) => {
        console.log(birdDoc); // not required but this helps to see whats happening)
        res.redirect('/');   // create a request to / to load the home page
    }).catch((err) => {

        if(err.name == 'ValidationError') {
            req.flash('error', err.message);
            res.redirect('/');
        }

// TODO remove seperate check for 11000 error code but first find out why this doesnt work
        else if (err.code === 11000) {
            req.flash('error', `${req.body.name} is already in the database`);
            res.redirect('/');
        }
        next(err); // send errors to the error handlers
    });
});



/* GET info about one bird */
router.get('/bird/:_id', function(req, res, next){
// get the _id of the bird from req.params
// query DB to get this bird's document
    Bird.findOne( {_id: req.params._id} )
        .then( (birdDoc) => {
            if (birdDoc) { // if a bird with this id is found
                console.log(birdDoc); res.render('birdinfo', {title: birdDoc.name, bird:birdDoc} );
            } else {    // else, if bird not found, bordDoc will be undefined
                var err = Error('Bird not found'); // create a new error
                err.status = 404; // set its status to 404
                throw err; // causes the chained catch function to run
            }
        })
        .catch( (err) => {
            next(err); // 404 and database errors
        });
});

/* POST a new sighting for a bird */
router.post('/addSighting', function(req, res, next){

    Bird.findOneAndUpdate(
        { _id: req.body._id },
        { $push: {datesSeen: { $each: [req.body.date], $sort: -1 } } },
        { runValidators:true } )
        .then( (updatedBirdDoc) => {
            if (updatedBirdDoc) {   // if no document matching this query, updatedBirdDoc will be undefined
                res.redirect(`/bird/${req.body._id}`); // redirect to this bird's info page
            } else {
                var err = Error('Adding sighting error, bird not found');
                err.status = 404;
                throw err;
            }
        })
        .catch( (err) => {

            if (err.name === 'CastError') {
                req.flash('error', 'Date must be in a valid format');
                res.redirect(`/bird/${req.body._id}`);
            }
            else if (err.name === 'ValidationError') {
                req.flash('error', err.message);
                res.redirect(`/bird/${req.body._id}`);
            }
            else {
                next(err);
            }

        });
});

router.post('/updateBird', function(req, res, next){

    if (req.body.description || req.body.averageEggs || req.body.endangered ||
        req.body.nest.location || req.body.nest.materials || req.body.height) { // if any fields have been updated
        // add to the req.bird object
        req.bird.description = req.body.description || req.bird.description;
        req.bird.averageEggs = req.body.averageEggs || req.bird.averageEggs;
        req.bird.endangered = req.body.endangered || req.bird.endangered;
        req.bird.nest.location = req.body.nest.location || req.bird.nest.location;
        req.bird.nest.materials = req.body.nest.materials || req.bird.nest.materials;
        req.bird.height = req.body.height || req.bird.height;

        // save the modified bird, to save to the database
        req.bird.save()
            .then( () => {
                req.flash('updateMsg', 'Your data was updated')
                res.redirect('/birdinfo');
            })
            .catch ( (err) => {
                if (err.name === 'ValidationError') {
                    req.flash('updateMsg', 'Your data is not valid')
                    res.redirect('/birdinfo');
                } else {
                    next(err);
                }
            });
    } else {
        req.flash('updateMsg', 'Please enter some data');
        res.redirect('/birdinfo');
    }
});

/* POST to delete a bird */
router.post('/delete', function(req, res, next){

    Bird.findByIdAndRemove(req.body._id)
        .then( (deletedTask) => {
            if (deletedTask) {
                res.redirect('/');
            } else {
                var error = new Error('Bird Not Found')
                error.status = 404;
                next(error);
            }
        })
        .catch( (err) => {
            next(err)
        })
});

module.exports = router;
