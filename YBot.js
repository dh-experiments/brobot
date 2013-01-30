/**
 * @file	YBot.js
 * @author	nr913 <scorpion_nr913@yahoo.com>
 * @version	1.0
 *
 * Events
 *		[error]
 *			Fired when an error occured
 *
 *		[login]
 *			Fired when bot logs in
 *
 *		[logout]
 *			Fired when bot logs out
 *
 *		[allowTransfer]
 *			Fired when receiver allow file transfer
 *			@param $id
 *				Transfer ID
 *
 *		[denyTransfer]
 *			Fired when receiver deny file transfer
 *			@param $id
 *				Transfer ID
 *
 *		[progressTransfer]
 *			Fired when file transfer progress
 *			@param id
 *				Transfer ID
 *
 *			@param filename
 *				Filename of file being transferred
 *
 *			@param progress
 *				Progress percent (from 0.0 to 1.0)
 *
 *		[requestTransfer]
 *			Fired when file transfer for receiving requested
 *			@param from
 *				Buddy ID
 *
 *			@param id
 *				Transfer ID
 *
 *			@param files
 *				An associative array of filenames and sizes (filename, size)
 *
 *		[cancelTransfer]
 *			Fired when a file transfer is canceled
 *			@param id
 *				Transfer ID
 *
 *		[finishedTransfer]
 *			Fired when a file transfer is finished
 *			@param id
 *				Transfer ID
 *
 *		[ding]
 *			Fired when someone sent a buzz
 *			@param from
 *				Buddy ID
 *
 *		[message]
 *			Fired when someone sent a message
 *			@param from
 *				Buddy ID
 *
 *			@param $message
 *				Message text
 *
 *		[typing]
 *			Fired when someone starts or stops typing
 *			@param from
 *				Buddy ID
 *
 *			@param typing
 *				true if typing, false if not
 *
 *		[addRequest]
 *			Fired when someone sent a request to add you on his/her contact list
 *			@param from
 *				Buddy ID
 *
 *			@param fname
 *				Buddy's first name
 *
 *			@param lname
 *				Buddy's last name
 *
 *			@param message
 *				Message for request
 *
 *		[keepAlive]
 *			Fired when keep alive packet is sent (every minute)
 *
 *		[ping]
 *			Fired when ping packet is sent (every hour)
 */
 
var util = require('util');
var events = require('events');
var http = require('http');
var https = require('https');
var qs = require('querystring');
var net = require('net');
var crypto = require('crypto');
var fs = require('fs');


Object.prototype.clone = function(recursive) {
	var a = {};
	for (var i in this) {
		if (i == 'clone') continue;
		if (recursive && typeof this[i] == 'object')
			a[i] = this[i].clone(true);
		else
			a[i] = this[i];
	}
	return a;
};

Buffer.prototype.split = function(separator) {
	var ret = [];
	var start = 0;
	var found = 0;
	for (var i = 0; i < this.length; ++i) {
		found = 1;
		for (var j = 0; j < separator.length; ++j) {
			if (this[i + j] != separator[j]) {
				found = 0;
				break;
			}
		}
		if (found) {
			ret.push(this.slice(start, i));
			i += separator.length;
			start = i;
			--i;
		}
	}
	return ret;
};

function file_exists(file) {
	try {
		var stats = fs.lstatSync(file);
		if (stats.isFile())
			return true;
	} catch (e) {
		return false;
	}
	return false;
}

function dir_exists(path) {
	try {
		var stats = fs.lstatSync(path);
		if (stats.isDirectory())
			return true;
	} catch (e) {
		return false;
	}
	return false;
}

function file_size(file) {
	try {
		var stats = fs.lstatSync(file);
		if (!stats.isFile())
			return 0;
		return parseInt(util.inspect(stats).match(/size: ([0-9]+),/)[1]);
	} catch (e) {
		return 0;
	}
	return 0;
}

function md5(string) {
	var md5sum = crypto.createHash('md5');
	md5sum.update(string);
	return md5sum.digest('binary');
}


var YBotHeader = {
	protocol:		'YMSG',
	version:		16,
	flag:			0,
	length:			0,
	service:		0,
	status:			0,
	session_id:		0
};

var YBotTransfer = {
	filename:		'',
	size:			0,
	readStream:		null,
	writeStream:	null,
	bytes:			0,
	path:			'',
	transfer:		false,
	queue:			[],
	host:			'',
	userid:			''
};

var YBotError = {
	NoError:			0,
	Connect:			-4,
	InvalidProtocol:	-2
};

var YBotService = {
	Auth:			87,
	AuthResp:		84,
	AddRequest:		214,
	Message:		6,
	Notify:			75,
	Visibility:		197,
	Logoff:			2,
	KeepAlive:		138,
	List:			241,
	Status:			198,
	AddBuddy:		131,
	RemBuddy:		132,
	Details:		85,
	Transfer:		220,
	TransferAccept:	222,
	TransferInfo:	221
};

var YBotStatus = {
	Available:		0,
	BRB:			1,
	Custom:			99,
	Typing:			22
};

/**
 * Bot constructor.
 *
 * @param userid
 *		Bot's ID to login
 *
 * @param password
 *		Bot's password to login
 */
function YBot(userid, password) {

	this.userid = userid;
	this.password = password;
	this.header = YBotHeader.clone();
	this.server 	= 'scs.msg.yahoo.com';
	this.serverTr	= 'relay.msg.yahoo.com';
	this.port 		= 5050;
	this.challenge	= '';
	this.packets	= [];
	this.data		= [];
	this.packlen	= 0;
	this.logged		= false;
	this.pack		= new Buffer(40960);
	this.moreData	= false;
	this.decoded	= true;
	this.Contacts	= [];
	this.transfers	= [];
	this.servers	= [];
	this.sock		= null;
	
	var self = this;
	this.on('login', function() {
		self.keepAliveTimer = setInterval(function() {
			self.keepAlive();
		}, 60000);
		self.pingTimer = setInterval(function() {
			self.ping();
		}, 3600000);
	});
	this.on('logout', function() {
		clearInterval(self.keepAliveTimer);
		clearInterval(self.pingTimer);
	});
	this.on('error', function() { this.Stop(); });
	var dns = require('dns');
	dns.resolve4(this.serverTr, function(e, adresses) {
		self.servers = adresses;
	});
}
util.inherits(YBot, events.EventEmitter);

/**
 * Transfers a file
 *
 * @param to
 *		Receiver's ID
 *
 * @param file
 *		File to transfer
 *
 * @return
 *		Transfer ID or FALSE if file does not exists
 */
YBot.prototype.TransferFile = function(to, file) {
	if (!file_exists(file)) return false;
	var size = file_size(file);
	var parts = file.match(/^(.*[\\\/]{1}?)([^\\\/]+)$/);
	var filename = parts[2];
	var path = parts[1];
	var id = this.generateTransferID();
	var host = this.getRandomTransferServer();
	if (host == false)
		return false;
	this.transfers[id] = YBotTransfer.clone();
	this.transfers[id].filename	= filename;
	this.transfers[id].size		= size;
	this.transfers[id].path		= path;
	this.transfers[id].host		= host;
	this.transfers[id].userid	= to;
	this.sendData(YBotService.Transfer, YBotStatus.Available, [
		[1,		this.userid],
		[5,		to],
		[265,	id],
		[222,	1],
		[266,	1],
		[302,	268],
		[300,	268],
		[27,	filename],
		[28,	size],
		[301,	268],
		[303,	268]
	]);
	return id;
}

/**
 * Accept a transfer request
 *
 * @param id
 *		Transfer ID
 *
 * @param path
 *		Path for saving
 */
YBot.prototype.AcceptTransfer = function(id, path) {
	if (!this.transferExists(id)) return false;
	if (!dir_exists(path)) return false;
	if (!/[\\\/]{1}$/.test(path))
		path += '/';
	this.transfers[id].path = path;
	this.sendData(YBotService.Transfer, YBotStatus.Available, [
		[1,		this.userid],
		[5,		this.transfers[id].userid],
		[265,	id],
		[222,	3]
	]);
	return true;
}

/**
 * Deny a transfer request
 *
 * @param id
 *		Transfer ID
 */
YBot.prototype.DenyTransfer = function(id) {
	if (!this.transferExists(id)) return false;
	this.sendData(YBotService.Transfer, YBotStatus.Available, [
		[1,		this.userid],
		[5,		this.transfers[id].userid],
		[265,	id],
		[222,	4]
	]);
	this.removeTransfer(id);
}

/**
 * Sets the status text
 *
 * @param message
 *		Status text
 *
 * @param busy
 *		true for busy icon. Default to false
 */
YBot.prototype.SetStatus = function(message, busy) {
	if (!this.logged) return;
	this.sendData(YBotService.AddRequest, YBotStatus.Available, [
		[10,	YBotStatus.Custom],
		[19,	message],
		[97,	1],
		[47,	(busy ? 1 : 0)],
		[187,	0]
	]);
}

/**
 * Adds a buddy to contact list
 *
 * @param id
 *		Buddy ID to add
 *
 * @param group
 *		Group to add buddy in. Default to 'friends'
 *
 * @param message
 *		Message displayed on buddy's request dialog. Default to null
 */
YBot.prototype.AddBuddy = function(id, group, message) {
	if (!this.logged) return;
	group = group || 'friends';
	message = message || '';
	this.sendData(YBotService.AddRequest, YBotStatus.Available, [
		[14,	message],
		[65,	group],
		[97,	1],
		[1,		this.userid],
		[302,	319],
		[300,	319],
		[7,		id],
		[334,	0],
		[301,	319],
		[303,	319]
	]);
}

/**
 * Removes a buddy from contact list
 *
 * @param id
 *		Buddy ID to remove
 *
 * @param group
 *		The buddy's group. Default to 'friends'
 */
YBot.prototype.RemoveBuddy = function(id, group) {
	if (!this.logged) return;
	group = group || 'friends';
	this.sendData(YBotService.AddRequest, YBotStatus.Available, [
		[1,		this.userid],
		[7,		id],
		[65,	group]
	]);
}

/**
 * Confirm a buddy add request
 *
 * @param id
 *		Buddy ID
 */
YBot.prototype.ConfirmBuddy = function(id) {
	if (!this.logged) return;
	this.sendData(YBotService.AddRequest, YBotStatus.Available, [
		[1,		this.userid],
		[5,		id],
		[241,	0],
		[13,	1],
		[334,	0]
	]);
}

/**
 * Rejects a buddy add request
 *
 * @param id
 *		Buddy ID
 *
 * @param message
 *		Message displayed on buddy's reject dialog. Default to null
 */
YBot.prototype.RejectBuddy = function(id, message) {
	if (!this.logged) return;
	message = message || '';
	this.sendData(YBotService.AddRequest, YBotStatus.Available, [
		[1,		this.userid],
		[5,		id],
		[13,	2],
		[334,	0],
		[14,	message],
		[97,	1]
	]);
}

/**
 * Sends a message to a buddy
 *
 * @param id
 *		Buddy ID
 *
 * @param message
 *		Message to send
 */
YBot.prototype.SendMessage = function(id, message) {
	if (!this.logged) return;
	this.sendData(YBotService.Message, YBotStatus.Available, [
		[0,		this.userid],
		[1,		this.userid],
		[5,		id],
		[14,	message]
	]);
}

/**
 * Sends a typing notify to a buddy
 *
 * @param id
 *		Buddy ID
 *
 * @param typing
 *		true or false
 */
YBot.prototype.SendNotify = function(id, typing) {
	if (!this.logged) return;
	typing = !(!typing);
	this.sendData(YBotService.Notify, YBotStatus.Typing, [
		[4,		this.userid],
		[5,		id],
		[13,	typing],
		[14,	' '],
		[49,	'TYPING']
	]);
}

/**
 * Sets the visibility
 *
 * @param status
 *		true for available, false for invisible. Default to true
 */
YBot.prototype.SetVisibility = function(status) {
	if (!this.logged) return;
	status = status ? 1 : 2;
	this.sendData(YBotService.Visibility, YBotStatus.BRB, [
		[13,	status]
	]);
}

/**
 * Starts the bot process
 */
YBot.prototype.Start = function() {
	this.lastError = YBotError.NoError;
	this.sock = new net.Socket({type: 'tcp4', allowHalfOpen: true});
	var self = this;
	this.sock.on('error', function() {
		self.lastError = YBotError.Connect;
		self.emit('error', self.lastError);
	});
	this.sock.connect(this.port, this.server, function() {
		self.botLogin(1);
	});
	this.sock.on('data', function(d) { self.dataArrived(d); });
}

/**
 * Stops the bot process
 */
YBot.prototype.Stop = function() {
	if (!this.logged) {
		if (this.sock.end)
			this.sock.end();
		return;
	}
	this.botLogout();
}


YBot.prototype.sendData = function(service, status, data) {
	this.header.service = service;
	this.header.status = status;
	this.header.version = 16;
	this.header.flag = 0;
	this.data = data;
	var packet = this.encodePack();
	this.sock.write(packet, 'ascii');
	this.packlen = 0;
}

YBot.prototype.botLogin = function(step) {
	if (step == 1) {
		this.sendData(YBotService.Auth, YBotStatus.Available, [
			[1,		this.userid]
		]);
	} else {
		var self = this;
		this.once('cookies', function() {
			self.sendData(YBotService.AuthResp, YBotStatus.Available, [
				[1,		self.userid],
				[0,		self.userid],
				[277,	self.cookieY],
				[278,	self.cookieT],
				[307,	self.key307],
				[244,	4194239],
				[2,		self.userid],
				[2,		1],
				[98,	'us'],
				[135,	'9.0.0.2162']
			]);
			self.logged = true;
			self.emit('login');
		});
		this.getCookiesAndKey307();
	}
}

YBot.prototype.botLogout = function() {
	this.sendData(YBotService.Logoff, YBotStatus.Available, []);
	this.logged = false;
	this.emit('logout');
}

YBot.prototype.getDataArrayFromKey = function(key) {
	var ret = [];
	for (var i = 0; i < this.data.length; ++i)
		if (this.data[i][0] == key)
			ret.push(this.data[i][1]);
	return ret;
}

YBot.prototype.keepAlive = function() {
	this.sendData(YBotService.KeepAlive, YBotStatus.Available, [
		[0,		this.userid]
	]);
	this.emit('keepAlive');
}

YBot.prototype.ping = function() {
	this.sendData(YBotService.KeepAlive, YBotStatus.Available, []);
	this.emit('ping');
}

YBot.prototype.getDataLength = function() {
	var len = 0;
	for (var i = 0; i < this.data.length; ++i)
		len += ('' + this.data[i][0]).length + ('' + this.data[i][1]).length + 4;
	this.header.length = len;
}

YBot.prototype.getDataFromKey = function(key) {
	for (var i = 0; i < this.data.length; ++i)
		if (this.data[i][0] == key)
			return this.data[i][1];
	return '';
}

YBot.prototype.havePackets = function() {
	return this.packets.length > 0;
}

YBot.prototype.getCookiesAndKey307 = function() {
	var self = this;
	https.get({
		host:	'login.yahoo.com',
		path:	'/config/pwtoken_get?' +
			qs.stringify({
				src:	'ymsgr',
				ts:		'',
				login:	this.userid,
				passwd:	this.password,
				chal:	this.challenge
			})
	}, function(res) {
		res.on('data', function(d) {
			var token = d.toString('ascii').split('\r\n');
			if (token[0] != '0') {
				self.lastError = parseInt(token[0]);
				self.emit('error', self.lastError);
				return;
			}
			token = token[1].split('=')[1];
			https.get({
				host:	'login.yahoo.com',
				path:	'/config/pwtoken_login?' +
					qs.stringify({
						src:	'ymsgr',
						token:	token
					})
			}, function(res) {
				res.on('data', function(d) {
					d = d.toString('ascii').split('\r\n');
					if (d[0] != '0') {
						self.lastError = parseInt(d[0]);
						self.emit('error', self.lastError);
						return;
					}
					var crumb = d[1].split('=')[1];
					var y = d[2].split('=');
					y.shift();
					self.cookieY = y.join('=');
					var t = d[3].split('=');
					t.shift();
					self.cookieT = t.join('=');
					self.key307 = self.y64(md5(crumb + self.challenge));
					self.emit('cookies');
				});
			});
		});
	});
}

YBot.prototype.y64 = function(source) {
	var yahoo64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789._';
	var inlen = 16;
	var $in = 0;
	var dest = '';
	for (; inlen >= 3; inlen -= 3) {
		dest += yahoo64[source.charCodeAt($in) >> 2];
		dest += yahoo64[((source.charCodeAt($in) << 4) & 0x30) | (source.charCodeAt($in + 1) >> 4)];
		dest += yahoo64[((source.charCodeAt($in + 1) << 2) & 0x3C) | (source.charCodeAt($in + 2) >> 6)];
		dest += yahoo64[source.charCodeAt($in + 2) & 0x3F];
		$in += 3;
	}
	if (inlen > 0) {
		dest += yahoo64[source.charCodeAt($in) >> 2];
		var fragment = ((source.charCodeAt($in) << 4) & 0x30);
		if (inlen > 1)
			fragment |= (source.charCodeAt($in + 1) >> 4);
		dest += yahoo64[fragment];
		if (inlen < 2)
			dest += '-';
		else
			dest += yahoo64[((source.charCodeAt($in + 1) << 2) & 0x3C)];
		dest += '-';
		return dest;
	}
}

YBot.prototype.nextPacket = function() {
	var packet = this.packets.shift();
	this.header = packet.header;
	this.data = packet.data;
}

YBot.prototype.encodePack = function() {
	if (this.header.protocol != 'YMSG') {
		this.lastError = YBotError.InvalidProtocol;
		this.emit('error', this.lastError);
		return new Buffer(0);
	}
	this.getDataLength();
	var len = this.header.length + 20;
	var packet = new Buffer(len);
	packet.write(this.header.protocol, 0, 4, 'ascii');
	packet.writeUInt16BE(this.header.version, 4);
	packet.writeUInt16BE(this.header.flag, 6);
	packet.writeUInt16BE(this.header.length, 8);
	packet.writeUInt16BE(this.header.service, 10);
	packet.writeUInt32BE(this.header.status, 12);
	packet.writeUInt32BE(this.header.session_id, 16);
	var offset = 20;
	var str = '';
	var separator = new Buffer([192, 128]);
	for (var i = 0; i < this.data.length; ++i) {
		str = ('' + this.data[i][0]);
		packet.write(str, offset, str.length, 'ascii');
		offset += str.length;
		
		separator.copy(packet, offset, 0, 2);
		offset += 2;
		
		str = ('' + this.data[i][1]);
		packet.write(str, offset, str.length, 'ascii');
		offset += str.length;
		
		separator.copy(packet, offset, 0, 2);
		offset += 2;
	}
	return packet;
}

YBot.prototype.decodePack = function() {
	this.moreData = false;
	this.decoded = false;
	var offset = 0;
	while (offset < this.packlen) {
		var protocol = this.pack.toString('ascii', 0, 4);
		if (protocol != 'YMSG') {
			// skip large packets
			break;
		}
		var header = YBotHeader.clone();
		header.length = this.pack.readUInt16BE(offset + 8);
		header.service = this.pack.readUInt16BE(offset + 10);
		header.status = this.pack.readUInt32BE(offset + 12);
		header.session_id = this.pack.readUInt32BE(offset + 16);
		if (offset + header.length + 20 > this.packlen) {
			// skip large packets
			break;
		}
		var data = this.pack.slice(offset + 20, offset + header.length + 20);
		offset += header.length + 20;
		data = data.split(new Buffer([192, 128]));
		var newdata = [];
		for (var i = 0; i < data.length - 1; ++i) {
			newdata.push([data[i].toString('ascii'), data[i + 1].toString('ascii')]);
			++i;
		}
		this.packets.push({header: header, data: newdata});
	}
	this.pack.copy(this.pack, 0, offset, this.packlen);
	this.packlen -= offset;
	if (this.moreData)
		this.decodePack();
	this.decoded = true;
	return true;
}

YBot.prototype.dataArrived = function(d) {
	d.copy(this.pack, this.packlen, 0, d.length);
	this.packlen += d.length;
	this.moreData = true;
	if (!this.decoded) return;
	this.decodePack();
	while (this.havePackets()) {
		this.nextPacket();
		switch (this.header.service) {
			case YBotService.Auth:
				this.dataAuth();
				break;
			case YBotService.Message:
				this.dataMessage();
				break;
			case YBotService.Notify:
				this.dataNotify();
				break;
			case YBotService.List:
				this.dataList();
				break;
			case YBotService.AddRequest:
				this.dataAddRequest();
				break;
			case YBotService.Details:
				break;
			case YBotService.Transfer:
				this.dataTransfer();
				break;
			case YBotService.TransferAccept:
				this.dataTransferAccept();
				break;
			case YBotService.TransferInfo:
				this.dataTransferInfo();
				break;
			default:
				this.dataUnknown();
				break;
		}
	}
}

YBot.prototype.dataAuth = function() {
	this.challenge = this.getDataFromKey(94);
	this.botLogin(2);
}

YBot.prototype.dataMessage = function() {
	if (this.getDataFromKey(450) == 1) return;
	var from = this.getDataFromKey(4);
	if (from == this.userid) return;
	var msg = this.getDataFromKey(14);
	if (msg == '<ding>') {
		this.emit('ding', from);
		return;
	}
	msg = msg.replace(/\<[^\>]+\>/g, '').replace(/\x1b\[[0-9]+m/g, '').replace(/\x1b\[#[0-9a-fA-F]{6}m/g, '');
	if (msg.length > 0)
		this.emit('message', from, msg);
}

YBot.prototype.dataNotify = function() {
	var from = this.getDataFromKey(4);
	var typing = this.getDataFromKey(13) == '1' ? true : false;
	this.emit('typing', from, typing);
}

YBot.prototype.dataList = function() {
	this.Contacts = this.Contacts.concat(this.getDataArrayFromKey(7));
}

YBot.prototype.dataAddRequest = function() {
	var from = this.getDataFromKey(4);
	var fname = this.getDataFromKey(216);
	var lname = this.getDataFromKey(254);
	var message = this.getDataFromKey(14);
	this.emit('addRequest', from, fname, lname, message);
}
YBot.prototype.dataUnknown = function() { }

YBot.prototype.dataTransfer = function() {
	var status = parseInt(this.getDataFromKey(222));
	var id = this.getDataFromKey(265);
	switch (status) {
		case 1:
			var from = this.getDataFromKey(4);
			var filenames = this.getDataArrayFromKey(27);
			var sizes = this.getDataArrayFromKey(28);
			var queue = [];
			for (var i = 0; i < filenames.length; ++i)
				queue.push({filename: filenames[i], size: sizes[i]});
			this.transfers[id] = YBotTransfer.clone();
			this.transfers[id].filename = filenames.join(', ');
			this.transfers[id].userid = from;
			this.transfers[id].queue = queue;
			this.emit('requestTransfer', from, id, queue);
			break;
		case 2:
			this.emit('cancelTransfer', id);
			this.removeTransfer(id);
			break;
		case 3:
			if (!this.transferExists(id)) return;
			this.sendData(YBotService.TransferInfo, YBotStatus.Available, [
				[1,		this.userid],
				[5,		this.transfers[id].userid],
				[265,	id],
				[27,	this.transfers[id].filename],
				[249,	3],
				[250,	this.transfers[id].host]
			]);
			break;
		case 4:
			this.emit('cancelTransfer', id);
			this.removeTransfer(id);
			break;
	}
}

YBot.prototype.dataTransferAccept = function() {
	var id = this.getDataFromKey(265);
	if (!this.transferExists(id)) return;
	if (this.header.status == YBotStatus.BRB) {
		var token = this.getDataFromKey(251);
		this.emit('allowTransfer', id);
		this.transfers[id].writeStream = http.request({
			host:		this.transfers[id].host,
			port:		80,
			path:		'/relay?' +
				qs.stringify({
					token:	token,
					sender:	this.userid,
					recver:	this.transfers[id].userid
				}),
			headers:	{
				'Cache-Control':	'no-cache',
				'Cookie':			'T=' + this.cookieT + ';path=/;domain=.yahoo.com;Y=' + this.cookieY + ';path=/;domain=.yahoo.com;',
				'Content-Length':	this.transfers[id].size,
				'Connection':		'Close'
			},
			method:		'POST'
		}, function() { });
		this.transfers[id].readStream = fs.createReadStream(this.transfers[id].path + this.transfers[id].filename, {
			flags:		'r',
			encoding:	null,
			fd:			null,
			mode:		0666,
			bufferSize:	64 * 1024
		});
		this.startTransfer(id);
	} else if (this.getDataFromKey(66) == '-1') {
		this.emit('denyTransfer', id);
		this.removeTransfer(id);
	}
}

YBot.prototype.startTransfer = function(id) {
	if (!this.transferExists(id)) return;
	if (this.transfers[id].readStream == null || this.transfers[id].writeStream == null) return;
	this.transfers[id].transfer = true;
	this.transfer++;
	this.emit('progressTransfer', id, 0);
	var self = this;
	this.transfers[id].readStream.on('data', function(d) {
		self.transfers[id].writeStream.write(d);
		self.transfers[id].bytes += d;
	});
	this.transfers[id].readStream.on('end', function() {
		self.transfers[id].writeStream.end();
		self.emit('finishedTransfer', id);
		if (self.transfers[id].queue.length > 0) {
			self.sendData(YBotService.TransferAccept, YBotStatus.Available, [
				[1,		self.userid],
				[5,		self.transfers[id].userid],
				[265,	id],
				[271,	1]
			]);
		} else
			self.removeTransfer(id, true);
	});
	this.transfers[id].writeStream.on('drain', function() {
		self.emit('progressTransfer', id, self.transfers[id].bytes / self.transfers[id].size);
	});
}

YBot.prototype.dataTransferInfo = function() {
	var id = this.getDataFromKey(265);
	if (!this.transferExists(id)) return;
	var key66 = this.getDataFromKey(66);
	if (key66 == '-2' | key66 == '-1') {
		this.emit('cancelTransfer', id);
		this.removeTransfer(id);
		return;
	}
	var token = this.getDataFromKey(251);
	var host = this.getDataFromKey(250);
	var filename = this.getDataFromKey(27);
	
	for (var i = 0; i < this.transfers[id].queue.length; ++i) {
		if (this.transfers[id].queue[i].filename == filename) {
			this.transfers[id].filename = filename;
			this.transfers[id].size = this.transfers[id].queue[i].size;
			this.transfers[id].host = host;
			this.transfers[id].queue.splice(i, 1);
			break;
		}
	}
	
	this.sendData(YBotService.TransferAccept, YBotStatus.Available, [
		[1,		this.userid],
		[5,		this.transfers[id].userid],
		[265,	id],
		[27,	this.transfers[id].filename],
		[249,	3],
		[250,	host],
		[251,	token]
	]);
	
	this.transfers[id].writeStream = fs.createWriteStream(this.transfers[id].path + this.transfers[id].filename, {
		flags:		'w',
		encoding:	null,
		mode:		0666
	});
	var self = this;
	http.request({
		host:		this.transfers[id].host,
		port:		80,
		path:		'/relay?' +
			qs.stringify({
				token:	token,
				sender:	this.transfers[id].userid,
				recver:	this.userid
			}),
		headers:	{
			'Cache-Control':	'no-cache',
			'Cookie':			'T=' + this.cookieT + ';path=/;domain=.yahoo.com;Y=' + this.cookieY + ';path=/;domain=.yahoo.com;',
			'Content-Length':	this.transfers[id].size,
			'Connection':		'Close',
			'Host':				this.transfers[id].host
		},
		method:		'GET'
	}, function(res) {
		self.transfers[id].readStream = res;
		self.startTransfer(id);
	}).end();
}

YBot.prototype.transferExists = function(id) {
	return (typeof this.transfers[id] != 'undefined');
}

YBot.prototype.removeTransfer = function(id, finished) {
	if (this.transferExists(id)) {
		if (this.transfers[id].transfer)
			this.transfer--;
		if (!finished) {
			if (this.transfers[id].readStream)
				this.transfers[id].readStream.destroy();
			if (this.transfers[id].writeStream)
				this.transfers[id].writeStream.destroy();
		}
		delete this.transfers[id];
	}
}

YBot.prototype.getRandomTransferServer = function() {
	if (this.servers.length == 0) return false;
	var index = parseInt(Math.round(Math.random() * (this.servers.length - 1)));
	return this.servers[index];
}

YBot.prototype.generateTransferID = function() {
	var ans = '';
	for (var i = 0; i < 43; ++i) {
		var j = parseInt(Math.round(Math.random() * 61));
		if (j < 26)
			ans += String.fromCharCode(j + 'a'.charCodeAt(0));
		else if (j < 52)
			ans += String.fromCharCode(j - 26 + 'A'.charCodeAt(0));
		else
			ans += String.fromCharCode(j - 52 + '0'.charCodeAt(0));
	}
	ans += '=';
	return ans;
}


exports.YBot = YBot;

exports.inherits = function(ctor, superCtor) {
	ctor.super_ = superCtor;
	ctor.prototype = Object.create(superCtor.prototype, {
		constructor: { value: ctor, enumerable: false }
	});
};