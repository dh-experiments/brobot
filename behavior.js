var mappings = require('./config/mappings.js');
var http = require('http');
var nlp = require('./nlp.js');
var natural = require('natural'),
	ng = natural.NGrams;

/////////////////////////////////////////////////////////////////
// Public Methods
/////////////////////////////////////////////////////////////////

module.exports = {

	// Check user is whitelisted
	interpretMessage: function(from, message, callback) {
		
		var firstName = mappings.handleToName(from);
		var context = nlp.classify(message),
			verifiedContext = false;
		var words = message.split(' ');
		var response = "";
		var usesCallback = false;

		console.log(context);

		switch( context ) {

			case 'ehow':
				var result = mappings.getArticle(words[2]);
			
				if ( result ) {
					response = "Here's a "+words[2]+" article: \n"+result;
				} else {
					response = "Sorry I don't understand what you're looking for yet.";
				}

				// eHowArticle({ type : 'About', category : 'Food and Drink' }, callback);
			break;

			case 'outlook':
				outlook(message, callback);
				usesCallback = true;
			break;

			case 'jira':
			break;

			case 'greeting':
				response = "Sup "+firstName+", you ready for some Hackathon excitement?!!";
				verifiedContext = true;
			break;

			case 'hug':
				response = "*gives you a BIG hug*";
				verifiedContext = true;
			break;

			case 'stock':
				// response = "Temporarily disabled, but context is STOCK";
				usesCallback = true;
				stockQuote('DMD', function(response){
					callback(response);
				});
			break;

			case 'eightball':
				response = eightball();
				verifiedContext = true;
			break;

			default:
				response = iDontKnow(firstName);
				verifiedContext = true;
			break;
		}

		// Unverified context
		if(!verifiedContext) {
			response = iDontKnow(firstName);
		}

		// Regular responses that don't require callback
		if(!usesCallback) {
			callback(response);
		}
	}

};

/////////////////////////////////////////////////////////////////
// Private Methods
/////////////////////////////////////////////////////////////////


var iDontKnow = function(name) {

	var response = "I got your message but my master is still teaching me what to do!";

	switch(Math.floor(Math.random()*7)) {
		case 0:
			response = "Hey "+name+", I know I'm just a little robot right now but when I learn to be smarter will you go out with me?";
		break;

		case 1:
			response = "I have a robot crush on you.  What's your number?";
		break;

		case 2:
			response = "Hold on, my master is teaching me pickup lines.";
		break;			
	}

	return response;
}

var stockQuote = function(ticker, callback) {

	var symbol = ticker || 'DMD',
		dataPath = ['query','results','quote','LastTradePriceOnly'],
		options = {
			host: 'query.yahooapis.com',
			port: 80,
			path: '/v1/public/yql?q=select%20*%20from%20yahoo.finance.quotes%20where%20symbol%20in%20(%22'+symbol+'%22)%0A%09%09&format=json&diagnostics=true&env=http%3A%2F%2Fdatatables.org%2Falltables.env'
		};

	getData(options, dataPath, function(data){
		var dataPoint = fetchDataPoint(data, dataPath),
			reply = "Unable to lookup "+symbol+" at the moment";
		if ( dataPoint ) {
			reply = "Current "+symbol+" [ http://finance.yahoo.com/q?s="+symbol+" ] price per share: "+dataPoint;
		}
		callback(reply);
	});
}

var outlook = function(message, callback) {

	var validName = false,
		bigrams = ng.bigrams(message),
		firstName;

	// Recognize name from bigrams
	for(var i=0, e=bigrams.length; i<e; i++) {
		// Get first and last characters of bigrams
		var wA = [ bigrams[i][0].slice(0,1), bigrams[i][0].slice(-1) ],
			wB = [ bigrams[i][1].slice(0,1), bigrams[i][1].slice(-1) ];

		// Name conditions
		if ( wB[0] == 's' || 
			( wA[0] == wA[0].toUpperCase() && i != 0 ) || 
				( wA[0] == wA[0].toUpperCase() && wB[0] == wB[0].toUpperCase() ) 
		) {
			firstName = bigrams[i][0];
			validName = true;

			break;
		}
	}

	if(validName) {
		var dataPath = ['response'];

		var options = {
			host: 'bro.api.ehowdev.com',
			port: 80,
			path: '/services/bro/?type=1&data={"First%20Name":"'+firstName+'"}'
		};

		getData(options, dataPath, function(data){
			var people = fetchDataPoint(data, dataPath),
				response = "Unable to find "+firstName;

			if ( people ) {
				response = "";
				for(var i=0, e=people.length; i<e; i++) {
					response += people[i]['First Name']+" "+people[i]['Last Name']+"'s phone: "+people[i]['Business Phone']+"\n";
				}
			}
			callback(response);
		});
	} else {
		callback("Sorry I can't tell who you're looking for.  Can you ask differently?");
	}
}

var eHowArticle = function(params, callback) {

	var dataPath = ['response','_id'],
		path = '/services/bro/?type=2&data={"type":"article"',
		replyFormat = "Here's a";

	if ( params.type ) {
		path += ',"content_type":"'+params.type+'"';
		replyFormat += " "+params.type;
	}

	replyFormat += " article";

	if ( params.category ) {
		path += ',"category":"'+escape(params.category)+'"';
		replyFormat += " in "+params.category;
	}

	path += '}&filter={"_id":1}';
	replyFormat += ":\n http://www.ehow.com%@";

	var options = {
		host: 'bro.api.ehowdev.com',
		port: 80,
		path: path
	};

	getData(options, dataPath, callback);
}

var getData = function(params, dataPath, callback) {

	var options = {
		host: params.host,
		port: params.port || 80,
		path: params.path
	};

	var req = http.get(options, function(res) {
		var holder = "";  // holder
		res.on('data', function (chunk) {
			if(chunk[chunk.length-1]=='\n') {
				holder += chunk.slice(0,chunk.length-1);
			} else {
				holder += chunk;
			}
		}).on('end', function(){
			var data = JSON.parse(holder);
			// Pass data back
			callback(data);
		});

	}).on('error', function(e) {
		console.log("Got error: " + e.message);
	});
}

var fetchDataPoint = function(data, levels) {
	
	var result = data;
	
	for(var i=0, e=levels.length; i<e; i++) {
		// data point exists
		if ( result[ levels[i] ] ) {
			result = result[levels[i]];
		} else {
			return false;
		}
	}

	return result;
}

var eightball = function() {

	var answers = [
		"Brobot thinks it's certain.",
		"It is decidedly so.  At least that's what I told the last person who asked.",
		"Without a doubt!",
		"I'd bet my nuts and bolts on it!",
		"You may rely on it.",
		"As I see it, yes.  But what do I know, I don't have eyes.",
		"Most likely :)",
		"Outlook good... Oops I'm sorry, I was talking about my mail client.  Did you ask a question?",
		"My bro-sense says yes.",
		"Ask the tea leaf reader who blocks our door.",
		"Reply hazy, try again...",
		"Ask again later...",
		"Better not tell you now...",
		"Cannot predict now.",
		"Concentrate and ask again (don't give yourself an aneurism)",
		"I wouldn't put my money on it, but I'd put yours.",
		"When pigs fly! lolol",
		"My sources say no :(",
		"Outlook not so good.  Maybe you should ask a bot that cares.",
		"Maybe when Skynet takes over the world."
	];

	return answers[ Math.floor( Math.random()*answers.length ) ];
}