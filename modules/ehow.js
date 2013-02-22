/////////////////////////////////////////////////////////////////
// Declarations
/////////////////////////////////////////////////////////////////

var ehow = {
	articleTypes : {
		how : {
			url: "http://www.ehow.com/how_7796300_grant-sponsor-childrens-books.html",
			label: "HowTo"
		},
		howdoes : {
			url: "http://www.ehow.com/how-does_4564342_muscle-milk-work.html",
			label: "HowDoes"
		},
		about : {
			url: "http://www.ehow.com/about_7796207_playground-slide-safety.html",
			label: "About"
		},
		facts : {
			url: "http://www.ehow.com/facts_7796299_function-ksb-solenoid.html",
			label: "Facts"
		},
		howto : {
			url: "http://www.ehow.com/how-to_5405827_avoid-common-writing-errors.html",
			label: "HowToPaged"
		},
		way : {
			url: "http://www.ehow.com/way_7547223_enterprise-planning-structure.html",
			label: "Way"
		},
		feature : {
			url: "http://www.ehow.com/feature_7673574_heal-heels.html",
			label: "Features"
		},
		info : {
			url: "http://www.ehow.com/info_7796296_whale-dolphin-habitat-descriptions.html",
			label: "Info"
		},
		list : {
			url: "http://www.ehow.com/list_6307355_tips-better-family-communication.html",
			label: "List"
		},
		decision : {
			url: "http://www.ehow.com/decision_7926452_do-water-frozen-pipes.html",
			label: "Decision"
		},
		infotip : {
			url: "http://www.ehow.com/info-tip_7960265_bai-makrud-seasoning.html",
			label: "InfoTip"
		},
		paginated : {
			url: "http://www.ehow.com/how-to_4845322_ace-gre.html",
			label: "HowToPaged"
		},
		steps : {
			url: "http://www.ehow.com/how_2019_clean-stove.html",
			label: "HowTo"
		},
		slideshow : {
			url: "http://www.ehow.com/slideshow_12217485_quick-ways-save-1000-utility-bills.html",
			label: "SlideShow"
		},
		slidestep : {
			url: "http://www.ehow.com/about_4572236_how-many-americans-drink-coffee.html",
			label: "StepByStep"
		}
	},
	categories : {
		relationshipsandfamily : {
			id : 1,
			label : 'Relationships and Family'
		},
		petsandanimals : { 
			id : 2,
			label : 'Pets and Animals'
		},
		careers : { 
			id : 3,
			label : 'Careers'
		},
		sports : { 
			id : 4,
			label : 'Sports'
		},
		computers : { 
			id : 5,
			label : 'Computers'
		},
		fashionandstyle : { 
			id : 6,
			label : 'Fashion and Style'
		},
		cars : { 
			id : 7,
			label : 'Cars'
		},
		business : { 
			id : 8,
			label : 'Business'
		},
		foodanddrink : { 
			id : 9,
			label : 'Food and Drink'
		},
		healthyliving : { 
			id : 10,
			label : 'Healthy Living'
		},
		hobbiesandscience : { 
			id : 11,
			label : 'Hobbies and Science'
		},
		homedesignanddecorating : { 
			id : 12,
			label : 'Home Design and Decorating'
		},
		vacationsandtravelplanning : { 
			id : 14,
			label : 'Vacations and Travel Planning'
		},
		holidaysandcelebrations : { 
			id : 15,
			label : 'Holidays and Celebrations'
		},
		electronics : { 
			id : 16,
			label : 'Electronics'
		},
		artsandentertainment : { 
			id : 17,
			label : 'Arts and Entertainment'
		},
		cultureandsociety : { 
			id : 18,
			label : 'Culture and Society'
		},
		education : { 
			id : 19,
			label : 'Education'
		},
		internet : { 
			id : 20,
			label : 'Internet'
		},
		legal : { 
			id : 21,
			label : 'Legal'
		},
		parenting : { 
			id : 22,
			label : 'Parenting'
		},
		partiesandentertaining : { 
			id : 23,
			label : 'Parties and Entertaining'
		},
		personalfinance : { 
			id : 24,
			label : 'Personal Finance'
		},
		weddings : { 
			id : 25,
			label : 'Weddings'
		}
	}
};

/////////////////////////////////////////////////////////////////
// Public Methods
/////////////////////////////////////////////////////////////////

module.exports = {

	getArticle: function(type) {
		if ( ehow['articleTypes'][type] ) {
			return ehow['articleTypes'][type]['label'];
		}
		return false;
	},

	getCategory: function(cat) {
		if ( ehow['categories'][cat] ) {
			return ehow['categories'][cat]['label'];
		}
		return false;
	},

	categories: ehow.categories

};