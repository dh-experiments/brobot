/////////////////////////////////////////////////////////////////
// Demand Employees
/////////////////////////////////////////////////////////////////

var users = {
	'nikedunks10' : { 
		first_name : 'Alex',
		last_name : 'Lea'
	},
	'durkbag2' : {
		first_name : 'Derek',
		last_name : 'Chang'
	},
	'brock_meltzer' : {
		first_name : 'Brock',
		last_name : 'Meltzer'
	},
	'vivsloo' : {
		first_name : 'Vivian',
		last_name : 'Loo'
	},
	'dklademand' : {
		first_name : 'David',
		last_name : 'Kim'
	}
};

/////////////////////////////////////////////////////////////////
// Public Methods
/////////////////////////////////////////////////////////////////

module.exports = {

	// Check user is whitelisted
	validUser: function(handle) {
		if ( users[handle] )
			return true;
		return false;
	},

	// Return the user's real first name
	handleToName: function(handle) {
		if ( users[handle] ) {
			return users[handle].first_name;
		}

		return handle;
	}

};