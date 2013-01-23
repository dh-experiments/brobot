var mappings = require('./config/mappings.js');

module.exports = {

	// Check user is whitelisted
	interpretMessage: function(from, message) {
		
		var first_name = mappings.handleToName(from);
		var command = (message.toLowerCase()).split(' ');
		var response = "";

		if ( command[0]=="ehow" && command[1]=="article" && command.length>=3 ) {

			var result = mappings.getArticle(command[2]);
			
			if ( result ) {
				response = "Hey "+first_name+", here's a "+command[2]+" article: \n"+result;
			} else {
				response = "Sorry I don't understand what you're looking for yet.";
			}

		} else if ( command[0]=="hi" || command[0]=="hey" ) {

			response = "Sup "+first_name+", you ready for some Hackathon excitement?!!";

		} else if ( message.toLowerCase()=="i need a hug" ) {

			response = "*gives you a BIG hug*";

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

			// response = "I got your message but my master is still teaching me what to do!";
		}

		return response;

	}

};