/**
 * @file	sample.js
 * @author	nr913 <scorpion_nr913@yahoo.com>
 * @version	1.0
 */

var bot = require('./YBot.js');
var mappings = require('./config/mappings.js');

// Initialize out bot
var Bot = new bot.YBot('dmbrobot', 'thisisatest');

// Register event callbacks
Bot.on('error', OnError);
Bot.on('login', OnLogin);
Bot.on('logout', OnLogout);
Bot.on('allowTransfer', OnTransferAllowed);
Bot.on('denyTransfer', OnTransferDenyed);
Bot.on('progressTransfer', OnTransferProgress);
Bot.on('requestTransfer', OnTransferRequested);
Bot.on('cancelTransfer', OnTransferCanceled);
Bot.on('finishedTransfer', OnTransferFinished);
Bot.on('ding', OnBuzz);
Bot.on('message', OnInstantMessage);
Bot.on('typing', OnTypingNotify);
Bot.on('addRequest', OnBuddyRequest);
Bot.on('keepAlive', OnKeepAlive);
Bot.on('ping', OnPing);

console.log(mappings);


// Declare callback functions
function OnError(errorCode) {
	console.log('An error occured [error code ' + errorCode + ']');
}

function OnLogin() {
	console.log('Logged in');
}

function OnLogout() {
	console.log('Logged out');
}

function OnTransferAllowed(id) {
	console.log('File transfer with ID ' + id + ' allowed');
}

function OnTransferDenyed(id) {
	console.log('File transfer with ID ' + id + ' denyed');
}

function OnTransferProgress(id, filename, progress) {
	console.log('Transfer progress (' + filename + ') ' + parseInt(progress * 100) + '%');
}

function OnTransferRequested(from, id, files) {
	console.log('File transfer requested');
	this.DenyTransfer(id);
}

function OnTransferCanceled(id) {
	console.log('Transfer with ID ' + id + ' canceled by user');
}

function OnTransferFinished(id, filename) {
	console.log('Transfer with ID ' + id + ' (' + filename + ') finished');
}

function OnBuzz(from) {
	console.log(from + ' buzzed');
	this.SendMessage(from, "What's the rush?");
}

function OnInstantMessage(from, message) {
	console.log(from + ' sent a message');

	var first_name = mappings.handleToName(from)
	var command = (message.toLowerCase()).split(' ');
	var response = "";
	console.log(command);

	if ( from=="vivsloo" ) {
		switch(Math.floor(Math.random()*3)) {
			case 0:
			response = "Hey "+first_name+", I know I'm just a little robot right now but when I learn to be smarter will you go out with me?";
			break;
			case 1:
			response = "I have a robot crush on you.  What's your number?";
			break;
			case 2:
			response = "Hold on, my master is teaching me pickup lines.";
			break;
		}
	// ehow article howto
	} else {		
		if ( command[0]=="ehow" && command[1]=="article" && command.length>=3 ) {
			var result = mappings.getArticle(command[2]);
			if ( result ) {
				response = "Hey "+first_name+", here's a "+command[2]+" article: \n"+result;
			} else {
				response = "Sorry I don't understand what you're looking for yet.";
			}
		} else if ( command[0]=="hi" || command[0]=="hey" ) {
			response = "Sup "+first_name+", you ready for some Hackathon excitement?!!";
		} else {
			response = "I got your message but my master is still teaching me what to do!";
		}
	}
	console.log("Reply: "+response);
	this.SendMessage(from, response);
}

function OnTypingNotify(from, typing) {
	if (typing)
		console.log(from + ' is typing');
	else
		console.log(from + ' stopped typing');
}

function OnBuddyRequest(from, fname, lname, message) {
	console.log('Buddy request from ' + fname + ' ' + lname + ' (' + from + ') [' + message + ']');
	// Use
	if ( mappings.validUser(from) ) {
		console.log(from+" approved.");
		this.ConfirmBuddy(from);
	} else {
		this.SendMessage(from, "Sorry "+from+", you are not on the approved list.");
		// this.RejectBuddy(from);
	}
	// or
	// nothing
}

function OnKeepAlive() {
	// This function is called every minute, I don't even know why I implemented it
}

function OnPing() {
	// This function is called every hour, I don't even know why I implemented it
}



// Start the bot process
Bot.Start();