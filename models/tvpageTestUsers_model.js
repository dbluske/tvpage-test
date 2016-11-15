// tvpageTestUsers_model.js

var mongoose = require('mongoose');

Schema = mongoose.Schema;

var tvpUserSchema = new Schema({

    uid: {type: String, index: 1},
    searches: [],
    created: { type: Date, default: Date.now },
    modified: { type: Date, default: Date.now },
    enabled: { type: Boolean, default: true }

}, {collection: 'tvpusers'});

mongoose.model('tvpUserSchema', tvpUserSchema);
