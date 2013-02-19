var mappings = require('./config/mappings.js');

module.exports = {

	// Check user is whitelisted
	interpretMessage: function(from, message) {
		
		var first_name = mappings.handleToName(from);
		var command = (message.toLowerCase()).split(' ');
		var response = "";

		// eHow
		if ( command[0]=="ehow" && command[1]=="article" && command.length>=3 ) {

			var result = mappings.getArticle(command[2]);
			
			if ( result ) {
				response = "Hey "+first_name+", here's a "+command[2]+" article: \n"+result;
			} else {
				response = "Sorry I don't understand what you're looking for yet.";
			}

		// Greeting
		} else if ( command[0]=="hi" || command[0]=="hey" || command[0]=="yo" ) {

			response = "Sup "+first_name+", you ready for some Hackathon excitement?!!";

		// Hug
		} else if ( message.toLowerCase()=="i need a hug" ) {

			response = "*gives you a BIG hug*";

		// 8-ball
		} else if ( command[0]=="8ball" || command[0]=="will" || command[0]+command[1]=="cani" ) {

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

		return response;

	}

};

var eightball = function() {

	var answers = [
		"Brobot thinks it's certain.",
		"It is decidedly so.",
		"Without a doubt!",
		"I'd bet my nuts and bolts on it!",
		"You may rely on it.",
		"As I see it, yes.",
		"Most likely :)",
		"Outlook good :)",
		"Yes.",
		"I tried asking the tea leaf reader who blocks our door.  She said I'm violating her restraining order.  Try again later.",
		"Reply hazy, try again...",
		"Ask again later...",
		"Better not tell you now...",
		"Cannot predict now.",
		"Concentrate and ask again :p",
		"I wouldn't put money on it.",
		"My reply is no :(",
		"My sources say no :(",
		"Outlook not so good.  Maybe you should ask another bot.",
		"Very doubtful."
	];

	return answers[ Math.floor( Math.random()*answers.length ) ];
}