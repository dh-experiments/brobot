/**
 * @file	sample_remote.js
 * @author	nr913 <scorpion_nr913@yahoo.com>
 * @version	1.0
 */

var bot = require('./YBot.js');
var exec = require('child_process').exec;

// Initialize our bot
Bot = new bot.YBot('yahoo_id', 'password');

// Register event callbacks
Bot.on('message', OnInstantMessage);


// Authorized IDs
var Authorized = ['auth_id1', 'auth_id2', '...'];


// Our callback that will handle all instant messages
function OnInstantMessage(from, message) {

	// Check if sender is authorized
	if (Authorized.indexOf(from) < 0) {
		Bot.SendMessage(from, "You are not authorized.");
		return;
	}

	// Break command in words
	var arg = message.split(' ');

	// Handle the commands
	switch (arg[0]) {

		case 'shell': // shell <command>

			if (arg.length < 2)
				Bot.SendMessage(from, "USAGE: shell <command>");
			else {
				arg.shift();
				arg = arg.join(' ');
				exec(arg, function(e, o, r) {
					Bot.SendMessage(from, "Output from shell command:\n" + o.toString('ascii'));
				});
			}
			break;

		case 'transfer': // transfer <file>
			if (arg.length < 2)
				Bot.SendMessage(from, "USAGE: transfer <file>");
			else {
				arg.shift();
				arg = arg.join(' ');
				if (!Bot.TransferFile(from, arg))
					Bot.SendMessage(from, "No such file or directory.");
			}
			break;
	}
}


// Start the bot process
Bot.Start();