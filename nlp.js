var natural = require('natural');
var classifier = new natural.BayesClassifier();
var trainers = require('./config/trainers.js'),
	trainer = trainers.contexts;

/////////////////////////////////////////////////////////////////
// Initialization
/////////////////////////////////////////////////////////////////

// Train Classifier
for(var key in trainer) {
	// Weird behavior in nodejs
	if ( key != 'clone' ) {
		var item = trainer[key];
		for(var i=0, e=item.length; i<e; i++) {
			classifier.addDocument(item[i], key);
		}
	}
}

classifier.train();

/////////////////////////////////////////////////////////////////
// Public Methods
/////////////////////////////////////////////////////////////////

module.exports = {

	// Check user is whitelisted
	classify: function(message) {
		return classifier.classify(message);
	}

};