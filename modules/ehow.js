/////////////////////////////////////////////////////////////////
// Declarations
/////////////////////////////////////////////////////////////////

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
	},
	categories : {
		1 : '/relationships-and-family/',
		2 : '/pets-and-animals/',
		3 : '/careers/',
		4 : '/sports/',
		5 : '/computers/',
		6 : '/fashion-and-style/',
		7 : '/cars/',
		8 : '/business/',
		9 : '/food-and-drink/',
		10 : '/healthy-living/',
		11 : '/hobbies-and-science/',
		12 : '/home-design-and-decorating/',
		14 : '/vacations-and-travel-planning/',
		15 : '/holidays-and-celebrations/',
		16 : '/electronics/',
		17 : '/arts-and-entertainment/',
		18 : '/culture-and-society/',
		19 : '/education/',
		20 : '/internet/',
		21 : '/legal/',
		22 : '/parenting/',
		23 : '/weddings-and-parties/',
		24 : '/personal-finance/',
		25 : '/weddings-and-parties/'
	}
};

/////////////////////////////////////////////////////////////////
// Public Methods
/////////////////////////////////////////////////////////////////

module.exports = {

	getArticle: function(type) {
		if ( ehow['articleTypes'][type] ) {
			return ehow['articleTypes'][type];
		}
		return false;
	},

	getCategory: function(cat) {
		if ( ehow['categories'][cat] ) {
			return ehow['categories'][cat];
		}
		return false;
	}

};