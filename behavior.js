var mappings = require('./config/mappings.js');
var nlp = require('./nlp.js');
var http = require('http');
var natural = require('natural');

natural.PorterStemmer.attach();

var ng = natural.NGrams;

/////////////////////////////////////////////////////////////////
// Public Methods
/////////////////////////////////////////////////////////////////

module.exports = {

	// Check user is whitelisted
	interpretMessage: function(from, message, callback) {
		
		var first_name = mappings.handleToName(from);
		var command = (message.toLowerCase()).split(' ');
		var response = "";
		var usesCallback = false;

		var stems = message.tokenizeAndStem("words");
		console.log(stems);
		console.log(nlp.classify(message));

		// eHow
		if ( command[0]=="ehow" && command[1]=="article" && command.length>=3 ) {

			var result = mappings.getArticle(command[2]);
			
			if ( result ) {
				response = "Here's a "+command[2]+" article: \n"+result;
			} else {
				response = "Sorry I don't understand what you're looking for yet.";
			}

		// Greeting
		} else if ( command[0]=="hi" || command[0]=="hey" || command[0]=="yo" ) {

			response = "Sup "+first_name+", you ready for some Hackathon excitement?!!";

		// Hug
		} else if ( message.toLowerCase()=="i need a hug" ) {

			response = "*gives you a BIG hug*";

		// Stock Quotes
		} else if ( command[0]=="stock" ) {

			usesCallback = true;
			
			stockQuote('DMD', function(response){
				callback(response);
			});

		// 8-ball
		} else if ( command[0]=="8ball" || command[0]=="will" || command[0]=="do" || command[0]=="does" || command[0]+command[1]=="cani" ) {

			response = eightball();

		// Don't understand
		} else {

			switch(Math.floor(Math.random()*7)) {
				case 0:
					response = "Hey "+first_name+", I know I'm just a little robot right now but when I learn to be smarter will you go out with me?";
				break;

				case 1:
					response = "I have a robot crush on you.  What's your number?";
				break;

				case 2:
					response = "Hold on, my master is teaching me pickup lines.";
				break;

				default:
					response = "I got your message but my master is still teaching me what to do!";
				break;				
			}

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

var stockQuote = function(ticker, callback) {

	var symbol = ticker || 'DMD',
		dataPath = ['query','results','quote','LastTradePriceOnly'],
		options = {
			host: 'query.yahooapis.com',
			port: 80,
			path: '/v1/public/yql?q=select%20*%20from%20yahoo.finance.quotes%20where%20symbol%20in%20(%22'+symbol+'%22)%0A%09%09&format=json&diagnostics=true&env=http%3A%2F%2Fdatatables.org%2Falltables.env'
		};

	var replyFormat = "Current "+symbol+" [ http://finance.yahoo.com/q?s="+symbol+" ] price per share: $%@";

	getData(options, replyFormat, dataPath, callback);
}

var getData = function(params, response, dataPath, callback) {

	var options = {
		host: params.host || 'query.yahooapis.com',
		port: params.port || 80,
		path: params.path || '/v1/public/yql?q=select%20*%20from%20yahoo.finance.quotes%20where%20symbol%20in%20(%22DMD%22)%0A%09%09&format=json&diagnostics=true&env=http%3A%2F%2Fdatatables.org%2Falltables.env'
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
			var data = JSON.parse(holder),
				result = fetchDataPoint(data, dataPath);

			if ( result ) {
				callback(response.replace('%@',result));
			} else {
				return false;
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