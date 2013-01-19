/**
 * @file	sample_support.js
 * @author	nr913 <scorpion_nr913@yahoo.com>
 * @version	1.0
 */

var bot = require('./Ybot.js');

// Initialize our bot
Bot = new bot.YBot('yahoo_id', 'password');

// Register event callbacks
Bot.on('message', OnInstantMessage);


// This are the IDs of support members
SupportTeam = {
	'support_id1':	false,
	'support_id2':	false,
	'support_id3':	false,
	'...':			false
};

// This is the queue of clients
ClientList = {};


// Our callback that will handle all instant messages
function OnInstantMessage(from, message) {
	
	// Is the sender a member?
	if (typeof SupportTeam[from] != 'undefined') {

		// Is the message a command?
		if (message[0] == '!') {

			// Break the command in words
			args = message.split(' ');

			// Handle the command
			switch (args[0]) {

				case '!chat': // !chat <ClientID> - Start a chat session with Client.
				
					// Is the member already in a chat session?
					if (SupportTeam[from] !== false)
						Bot.SendMessage(from, "You can't start a new chat session. To end this session, type \"!end\".");

					else {

						// The command take one parameter, the client ID
						if (args.length < 2)
							Bot.SendMessage(from, "USAGE: !chat <ClientID> - Start a chat session with Client.");

						// Are you sure the clint is in queue?
						else if (typeof ClientList[args[1]] == 'undefined'))
							Bot.SendMessage(from, "Client with ID \"{args[1]}\" does not exists.");

						// Is the client assigned to somebody else?
						else if (ClientList[args[1]] !== false)
							Bot.SendMessage(from, "Client with ID \"{args[1]}\" already assigned.");

						// Assign the client to support member, start the chat session
						else {
							SupportTeam[from] = args[1];
							ClientList[args[1]] = from;
							Bot.SendMessage(from, "You are now talking to \"{args[1]}\". Type \"!end\" to end this session.");
							Bot.SendMessage(args[1], "You are now talking to \"from\".");
						}
					}
					break;

				case '!end':	// !end - End the chat session.

					// Are you sure you are in a chat session?
					if (SupportTeam[from] === false)
						Bot.SendMessage(from, "No session started. Type \"!list\" to list waiting clients. Type \"!chat <ClientID>\" to start a chat session.");

					// End the chat session. Inform the client about this.
					else {
						Bot.SendMessage(SupportTeam[from], "Chat session ended.");
						Bot.SendMessage(from, "Chat session ended.");
						delete ClientList[SupportTeam[from]];
						SupportTeam[from] = false;
					}
					break;

				case '!list': // !list - List the clients that are currently waiting.

					var ids = '';
					// Loop through the client queue
					for (var client in ClientList) {
						var member = ClientList[client];
					
						// If the client is unassigned, print him
						if (member === false)
							ids += "\n" + client;
					}

					// Are there no clients waiting?
					if (ids == '')
						Bot.SendMessage(from, "No clients waiting.");

					// There's clients in queue
					else
						Bot.SendMessage(from, "Clients waiting:" + ids);
					break;

				case '!help': // !help - List the commands available.
					Bot.SendMessage(from, "Available commands:\n!help - Print this message.\n!list - List the clients that are currently waiting.\n!chat <ClientID> - Start a chat session with Client.\n!end - End the chat session.");
					break;

				default: // Unknown command
					Bot.SendMessage(from, "Unknown command. Type \"!help\" to list available commands.");
					break;
			}

		// This is not a command, this should be a chat message
		} else {

			// Are you sure the member is in a session?
			if (SupportTeam[from] === false)
				Bot.SendMessage(from, "No session started. Type \"!list\" to list waiting clients. Type \"!chat <ClientID>\" to start a chat session.");

			// Yes, lets send the message to client
			else
				Bot.SendMessage(SupportTeam[from], message);
		}

	// This is a client, but is he assigned?
	} else if (typeof ClientList[from] == 'undefined') {

		// Are there any support members available?
		if (ClientList.length == SupportTeam.length)
			Bot.SendMessage(from, "Currently, no support members are available. Please try again in a few minutes.");

		// Yes, add him in queue
		else {

			// Loop through the support members available and inferm them that a client is waiting
			for (var member in SupportTeam) {
				var client = SupportTeam[member];
				
				if (client !== false)
					continue;
				Bot.SendMessage(member, "Client from is waiting. Type \"!chat from\" to start chat session with from.");
			}

			// Inform the client that he is waiting queue
			Bot.SendMessage(from, "We will assign you a support member soon. Please be patient.");
			ClientList[from] = false;
		}

	// Yes, this sure is a client, and he is in a session, so send the message to support member
	} else
		Bot.SendMessage(ClientList[from], message);
}


// Start the bot process
Bot.Start();