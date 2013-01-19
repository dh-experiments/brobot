// Declarations
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
	}
};

var ehow = {
	articleTypes : {
		how : "http://www.ehow.com/how_7796300_grant-sponsor-childrens-books.html",
		howdoes : "http://www.ehow.com/how-does_4564342_muscle-milk-work.html",
		about : "http://www.ehow.com/about_7796207_playground-slide-safety.html",
		facts : "http://www.ehow.com/facts_7796299_function-ksb-solenoid.html",
		howto : "http://www.ehow.com/how-to_5405827_avoid-common-writing-errors.html",
		way : "http://www.ehow.com/way_7547223_enterprise-planning-structure.html",
		feature : "http://www.ehow.com/feature_7673574_heal-heels.html",
		info : "http://www.ehow.com/info_7796296_whale-dolphin-habitat-descriptions.html",
		list : "http://www.ehow.com/list_6307355_tips-better-family-communication.html",
		decision : "http://www.ehow.com/decision_7926452_do-water-frozen-pipes.html",
		infotip : "http://www.ehow.com/info-tip_7960265_bai-makrud-seasoning.html",
		paginated : "http://www.ehow.com/how-to_4845322_ace-gre.html",
		steps : "http://www.ehow.com/how_2019_clean-stove.html",
		slideshow : "http://www.ehow.com/slideshow_12217485_quick-ways-save-1000-utility-bills.html",
		slidestep : "http://www.ehow.com/about_4572236_how-many-americans-drink-coffee.html"
	}
};

// Public Methods
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
	},

	getArticle: function(type) {
		if ( ehow['articleTypes'][type] ) {
			return ehow['articleTypes'][type];
		}
		return false;
	}

};