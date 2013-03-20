/////////////////////////////////////////////////////////////////
// Intranet
/////////////////////////////////////////////////////////////////

var intranet = {
	'companyholiday' : 'The next holiday is Memorial Day on Monday, May 27th.',
	'dental' : {
		info : 'Assurant. Click here for more info - http://intranet/benefits/dental-vision/',
		policy : 'The Dental Group Policy Number is 5447486',
		number : 'The Assurant Number is (800) 733-7879',
	},
	'vision' : {
		info : 'VSP. Click here for more info - http://intranet/benefits/dental-vision/',
		number : 'The VSP Number is  (800) 877-7195'
	},
	'medical' : {
		info : 'Anthem Blue Cross. Click here for more info - http://intranet/benefits/medical/',
		number : 'HMO 800-227-3613 and PPO is 888-657-9677'
	},
	'help' : 'servicedesk@demandmedia.com'

};

var contains = function(needles, haystack) {
	var count = 0,
		num = needles.length;
	for(var i=0; i<num; i++) {
		if( haystack.indexOf(needles[i])>=0 ) {
			count++;
		}
	}
	
	return (count==num) ? true : false;
}

/////////////////////////////////////////////////////////////////
// Public Methods
/////////////////////////////////////////////////////////////////

module.exports = {

	// Check user is whitelisted
	handleMessage: function(from, message) {
		
		var lower = message.toLowerCase(),
			response = "Sorry I can't seem to find the info.  Maybe ask a real person?";

		// when is the next company holiday?
		if ( contains(['next','holiday'], lower) || contains(['company','holiday'], lower) ) {
			response = intranet.companyholiday;
		// dental
		} else if ( lower.indexOf('dental')>=0 || lower.indexOf('assurant')>=0 ) {
			response = (lower.indexOf('number')>=0) ? intranet.dental.number : intranet.dental.info;
		// medical
		} else if ( lower.indexOf('medical')>=0 || lower.indexOf('blue cross')>=0 ) {
			response = intranet.medical.info;
		// help and problems
		} else if ( contains(['problems','computer'],lower) || contains(['issues','computer'],lower) || lower.indexOf('helpdesk')>=0 ) {
			response = "Here is the helpdesk: "+intranet.help;
		}

		return response;
	}

};