var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var birdSchema = new mongoose.Schema({
    name: {
        type: String, required: [true, 'Bird name is required'],
        unique: true,
        uniqueCaseInsensitive: true,
        validate: {
            validator: function (n) {
                return n.length >= 2;
            },
            message: '{VALUE} is not valid, bird name must be at least 2 letters'
        }
    },          // species name e.g. Great Horned Owl
    description: String, // description of what the bird looks like
    averageEggs: {
        type: Number,
        min: [1, 'Should  be at least 1 egg'],
        max: [50, 'Should not be more than 50 eggs.'] }, // average amount of eggs
    endangered: { type: Boolean, default: false }, // is this an endangered bird species?
    datesSeen: [ Date ] // array of dates a bird of this species was seen
});

var Bird = mongoose.model('Bird', birdSchema);
birdSchema.plugin(uniqueValidator);

module.exports = Bird;