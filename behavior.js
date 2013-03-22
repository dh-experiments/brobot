var http = require('http');

var ehow = require('./modules/ehow.js'),
	people = require('./modules/people.js'),
	intranet = require('./modules/intranet.js');

var nlp = require('./nlp.js');
var natural = require('natural'),
	ng = natural.NGrams;

/////////////////////////////////////////////////////////////////
// Public Methods
/////////////////////////////////////////////////////////////////

module.exports = {

	// Check user is whitelisted
	interpretMessage: function(from, message, callback) {
		
		var firstName = people.handleToName(from);
		var context = nlp.classify(message.toLowerCase()),
			verifiedContext = false;
		var words = message.split(' ');
		var response = "";
		var usesCallback = false;

		// output context
		console.log('['+context+']');

		switch( context ) {

			case 'ehow':
				eHowArticle(message, callback);
				usesCallback = true;
			break;

			case 'outlook':
				outlook(message, callback);
				usesCallback = true;
			break;

			case 'jira':
				jira(from, message, callback);
				usesCallback = true;
			break;

			case 'greeting':
				response = "Sup "+firstName+", you ready for some Hackathon excitement?!!";
				verifiedContext = true;
			break;

			case 'hug':
				if ( message.indexOf('hug')>=0 ) {
					response = "*gives you a BIG hug*";
				} else {
					response = iDontKnow(firstName);
				}
				verifiedContext = true;
			break;

			case 'yelp':
				yelp(message, callback);
				usesCallback = true;
			break;

			case 'maps':
				googlemaps(from, message, callback);
				usesCallback = true;
			break;

			case 'intranet':
				response = intranet.handleMessage(from, message);
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
				// OVERRIDE
				var lower = message.toLowerCase();
				if ( lower.indexOf('osteria') >=0 && lower.indexOf('how long')>=0 ) {
					usesCallback = true;
					maps(message, callback);
				} else {
					response = eightball();
					verifiedContext = true;
				}
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

var maps = function(message, callback) {

	var place = 'Osteria Mozza in Los Angeles';
	var dataPath = ['response'];
	var options = {
		host: 'bro.api.ehowdev.com',
		port: 80,
		path: '/services/bro/?type=6&data=%7B"destination":"'+escape(place)+'"%7D'
	};

	getData(options, function(data){
		var dataPoint = fetchDataPoint(data, dataPath),
			reply = "I can't find "+place;
		if ( dataPoint ) {
			reply = "I checked Google maps for you.  It will take: "+dataPoint['duration']+'\n';
			reply += dataPoint['link']+'\n';
		}
		callback(reply);
	});
}

var yelp = function(message, callback) {
	
	// Expect the words at or to in yelp searches
	if ( message.indexOf(' at ')>=0 || message.indexOf(' to ')>=0 ) {
		var positions = {
			at : message.indexOf(' at '),
			to : message.indexOf(' to ')
		};

		var larger = (positions.at >= positions.to) ? positions.at : positions.to;

		var place = message.slice(larger+4, message.length);
		var dataPath = ['response'];
		var options = {
			host: 'bro.api.ehowdev.com',
			port: 80,
			path: '/services/bro/?type=5&data=&filter=%7B"keyword":"'+escape(place)+'"%7D'
		};

		getData(options, function(data){
			var dataPoint = fetchDataPoint(data, dataPath),
				reply = "I can't find "+place;
			if ( dataPoint ) {
				reply = ( Math.floor(Math.random()*7) == 3 ) ? "Take me with you! \n\n" : "";
				reply += dataPoint['name']+' (Rating: '+dataPoint['avg_rating']+')\n';
				reply += dataPoint['address']+'\n';
				reply += dataPoint['city']+'\n';
				reply += dataPoint['zip']+'\n';
				reply += dataPoint['phone']+'\n';
				reply += dataPoint['url']+'\n';
			}
			callback(reply);
		});
	} else {
		callback("I'm not quite sure what you want");
	}
}

var lastChecked = new Date(),
	lastStock = {
		ticker : 'DMD',
		price : 8.69,
		init : false
	};

var stockQuote = function(ticker, callback) {

	var currentTime = new Date();
	var elapsed = currentTime - lastChecked;

	if ( elapsed < 600000 && lastStock.init ) {
		var reply = lastStock.ticker+" price per share: $"+lastStock.price+"\nhttp://finance.yahoo.com/q?s="+lastStock.ticker;
		callback(reply);
		return;
	}

	var symbol = ticker || 'DMD',
		dataPath = ['query','results','quote','LastTradePriceOnly'],
		options = {
			host: 'query.yahooapis.com',
			port: 80,
			path: '/v1/public/yql?q=select%20*%20from%20yahoo.finance.quotes%20where%20symbol%20in%20(%22'+symbol+'%22)%0A%09%09&format=json&diagnostics=true&env=http%3A%2F%2Fdatatables.org%2Falltables.env'
		};

	getData(options, function(data){
		var dataPoint = fetchDataPoint(data, dataPath),
			reply = "Unable to lookup "+symbol+" at the moment";
		if ( dataPoint ) {
			lastChecked = currentTime;
			lastStock.ticker = symbol;
			lastStock.price = dataPoint;
			lastStock.init = true;
			reply = "Current "+symbol+" price per share: $"+dataPoint+"\nhttp://finance.yahoo.com/q?s="+symbol;
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
		if ( wB[0] == 's' && bigrams[i][0].toLowerCase()!='what' || 
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

		getData(options, function(data){
			var people = fetchDataPoint(data, dataPath),
				response = "Unable to find "+firstName;

			if ( people && people.length>0 ) {
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

var jira = function(from, message, callback) {

	var jiraHandle = people.jiraAccount(from),
		message = message.toLowerCase();

	// Check relevant
	if (message.indexOf('tickets')>=0 || message.indexOf('jira')>=0 || message.indexOf('uat')>=0) {
		// Check account exists
		if (jiraHandle) {

			var dataPath = ['response'];

			var options = {
				host: 'bro.api.ehowdev.com',
				port: 80,
				path: '/services/bro/?type=0&data={"type":"OPEN_TICKETS"}&filter={"name":"'+jiraHandle+'"}'
			};

			getData(options, function(data){
				var result = fetchDataPoint(data, dataPath),
					response = "Hey buddy, here's your tickets: \n\n";

				if ( result ) {
					for (var i=0, e=result.length; i<e; i++ ) {
						response += result[i]['summary']+" - http://jira/browse/"+result[i]['key']+"\n";
					}
				} else {
					response = "Can't find any matching tickets.";
				}

				callback(response);
			});
		} else {
			callback("I can't find your Jira account.");
		}
	} else {
		// For some reason Jira catches a lot of this stuff.
		callback(iDontKnow());
	}
}

var eHowArticle = function(message, callback) {
	// Extract keywords here
	var keywords = [],
		words = message.toLowerCase().split(' ');

	// Extract keywords
	for(var i=0, e=words.length; i<e; i++) {
		var type = ehow.getArticle(words[i]);
		if(type) {
			keywords.push(type);
		}
	}

	// Extract Categories
	message = message.replace(/ /g,'');
	var cats = ehow.categories;
	for(var key in cats) {
		if(message.indexOf(key)>=0) {
			keywords.push(cats[key]['label']);
		}
	}

	// Convert keywords to params
	var params = '';
	// Can't use join, have to add quotation marks myself
	for(var i=0, e=keywords.length; i<e; i++) {
		params += '"'+escape(keywords[i])+'"';
		if ( i != e-1 ) {
			params += ',';
		}
	}

	var dataPath = ['response','_id'];

	var options = {
		host: 'bro.api.ehowdev.com',
		port: 80,
		path: '/services/bro/?type=2&data={"type":"article","keywords":['+params+']}&filter={"_id":1}'
	};

	getData(options, function(data){
		var result = fetchDataPoint(data, dataPath),
			response = "Sorry I can't find an article matching: "+keywords.join(', ')+" :(";

		if ( result ) {
			response = "Here ya go! \n http://www.ehow.com"+result;
		}

		callback(response);
	});
}

var getData = function(params, callback) {

	var options = {
		host: params.host,
		port: params.port || 80,
		path: params.path
	};

	console.log('[Path] '+options.host+options.path);

	var req = http.get(options, function(res) {
		var holder = "";  // holder
		res.on('data', function (chunk) {
			if(chunk[chunk.length-1]=='\n') {
				holder += chunk.slice(0,chunk.length-1);
			} else {
				holder += chunk;
			}
		}).on('end', function(){
			try {
				var data = JSON.parse(holder);
				// Pass data back
				callback(data);
			} catch(err) {
				console.log('Invalid data: '+holder);
			}
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

var math = function evalExpression(text) {
	
	text = text.replace(/\s/g, "");
	text = text.replace(/(\D+)/g, ' $1 ');
	var tokens = text.split(" ");

	var output = [];
	var operators = [];

	var reNumber = /^\d+(\.\d+)?$/;
	var reOperator = /^[\/\+\*\-]$/;
	var precedence = { "+": 1, "-": 1, "*": 2, "/": 2 };

	for (var i = 0; i < tokens.length; ++i)
	{
		var t = tokens[i];
		if (reNumber.test(t))
			output.push(Number(t));
		else if (reOperator.test(t))
		{
			while (operators.length && precedence[t] <= precedence[operators[operators.length - 1]])
			{
				output.push(operators.pop());
			}

			operators.push(t);
		}
		else if (t == "(")
			operators.push(t);
		else if (t == ")")
		{
			while (operators.length && operators[operators.length - 1] != "(")
				output.push(operators.pop());

			if (!operators.length) return false;

			operators.pop();    
		}
		else 
			return false;
	}

	while (operators.length)
		output.push(operators.pop());

	var result = [];

	for (i = 0; i < output.length; ++i)
	{
		t = output[i];
		if (reNumber.test(t))
			result.push(t);
		else if (t == "(" || result.length < 2)
			return false;
		else 
		{
			var rhs = result.pop();
			var lhs = result.pop();

			if (t == "+") result.push(lhs + rhs);
			if (t == "-") result.push(lhs - rhs);
			if (t == "*") result.push(lhs * rhs);
			if (t == "/") result.push(lhs / rhs);
		}
	}

	return result.pop();
}

var eightball = function() {

	var answers = [
		"Brobot thinks it's certain.",
		"It is decidedly so.  At least that's what I told the last person who asked.",
		"My tea leaves say yes.",
		"I'd bet my nuts and bolts on it!",
		"You may rely on it.",
		"As I see it, yes.  But what do I know, I don't have eyes.",
		"Most likely :)",
		"Outlook good... Oops I'm sorry, I was talking about my mail client.  Did you ask a question?",
		"My bro-sense says yes.",
		"Ask the psychic on the promenade.",
		"Reply hazy, try again...",
		"Ask again later...",
		"Better not tell you now...",
		"**System Error** That question was too deep.",
		"Concentrate reaallllly hard and ask again.",
		"I wouldn't put my money on it, but I'd put yours.",
		"When pigs fly! lolol",
		"My sources say no :(",
		"Maybe you should ask a bot that cares.",
		"When Skynet takes over the world."
	];

	return answers[ Math.floor( Math.random()*answers.length ) ];
}