var shuffleArray = function (array) {
	var m = array.length, t, i;

	// While there remain elements to shuffle
	while (m) {
		// Pick a remaining element…
		i = Math.floor(Math.random() * m--);
		// And swap it with the current element.
		t = array[m];
		array[m] = array[i];
		array[i] = t;
	}
	return array;
}

var app = angular.module('qmethod', ['ui.router', 'dndLists', 'igTruncate', '720kb.tooltips']);

// ========== CONFIG
app.config(function ($stateProvider, $locationProvider) {

	$locationProvider.hashPrefix('');

	$stateProvider.state({
		name: 'step1',
		url: '/step1',
		templateUrl: 'templates/step1.html',
		controller: 'step1Ctrl',
		
	});

	$stateProvider.state({
		name: 'step2',
		url: '/step2',
		templateUrl: 'templates/step2.html',
		controller: 'step2Ctrl'
	});

	$stateProvider.state({
		name: 'step3',
		url: '/step3',
		templateUrl: 'templates/step3.html',
		controller: 'step3Ctrl',
		resolve: {
			'promisedata': ['$http', function($http){
				return $http.get('settings/statements.xml');
			}]
		}
	});

	$stateProvider.state({
		name: 'step4',
		url: '/step4',
		templateUrl: 'templates/step4.html',
		controller: 'step4Ctrl'
	});

	$stateProvider.state({
		name: 'step5',
		url: '/step5',
		templateUrl: 'templates/step5.html',
		controller: 'step5Ctrl'
	});

	$stateProvider.state({
		name: 'step6',
		url: '/step6',
		templateUrl: 'templates/step6.html',
		controller: 'step6Ctrl'
	});

	$stateProvider.state({
		name: 'step7',
		url: '/step7',
		templateUrl: 'templates/step7.html',
		controller: 'step7Ctrl'
	});
});

  var config = {
    apiKey: "AIzaSyCZKrox4RKsS9jnpxYXoVj982UdQ-4VUHk",
    authDomain: "qmethod-16120.firebaseapp.com",
    databaseURL: "https://qmethod-16120.firebaseio.com",
    projectId: "qmethod-16120",
    storageBucket: "qmethod-16120.appspot.com",
    messagingSenderId: "50670126791"
  };
  firebase.initializeApp(config);
  var rootRef = firebase.database().ref();

  
// ========== CONTROLLERS
app.controller("appCtrl", function ($scope, $rootScope, $state) {
	$state.go('step1');
});

app.controller("step1Ctrl", function ($scope, $rootScope, $state) {
	$scope.next = function () {
		$state.go('step2');
	}
});

app.controller("step2Ctrl", function ($scope, $rootScope, $state) {
	$scope.next = function () {
		$state.go('step3');
	}

	$scope.back = function () {
		$state.go('step1');
	}
});

app.controller("step3Ctrl",['promisedata','$scope', '$rootScope', '$state', function (promisedata, $scope, $rootScope, $state) {

	statements = [];
	if (typeof $rootScope.statements == "undefined") {
		parser = new DOMParser();
		xmlDoc = parser.parseFromString(promisedata.data,"application/xml");
		xmlDocStatementNodes = xmlDoc.getElementsByTagName("statement");
		for (i=0; i < xmlDocStatementNodes.length; i++) {
			el = xmlDocStatementNodes[i];
			el_id = el.getAttribute('id');
			el_value = el.childNodes[0].nodeValue;
			statements.push({id: el_id, statement: el_value});
		}
		//Pick how many statements we have so we can use it for checks
		$rootScope.numberOfStatements = 
			JSON.parse(JSON.stringify(statements.length));
		shuffleArray(statements);
		$rootScope.statements = JSON.parse(JSON.stringify(statements));
	}

	$scope.cards = {
		selected: null,
		first: 1,
		statements: $rootScope.statements,
	};

	$scope.classifications = {
		'AGREE': [],
		'NEUTRAL': [],
		'DISAGREE': [],
	};

	$('#helpModal').modal(show = true);

	/*Checks if $rootScope is already defined (the user had made his classifications)*/
	if (typeof $rootScope.classifications == "undefined") {
		$rootScope.classifications = $scope.classifications;
	} else {
		$scope.classifications = $rootScope.classifications;
	}

	$scope.hasNoCategory = function (statement) {
		return statement.category != "undefined";
	}


	$scope.done = function () {
		return $rootScope.statements.length == 0;
	};

	$scope.next = function () {
		$rootScope.classifications_step3 = JSON.parse(JSON.stringify($rootScope.classifications));
		$state.go('step4');
	}

	$scope.back = function () {
		$state.go('step2');
	}

	$scope.dropAgreeCallback = function (index, item, external, type) {

		if ($scope.cards.first == item.id) {
			$scope.cards.first = $scope.cards.first + 1;
		}
		item.category = "agree";
		$scope.classifications.AGREE.push(item);

		return true;
	};

	$scope.dropNeutralCallback = function (index, item, external, type) {
		if ($scope.cards.first == item.id) {
			$scope.cards.first = $scope.cards.first + 1;
		}

		item.category = "neutral";
		$scope.classifications.NEUTRAL.push(item);

		return true;
	};

	$scope.dropDisagreeCallback = function (index, item, external, type) {
		if ($scope.cards.first == item.id) {
			$scope.cards.first = $scope.cards.first + 1;
		}

		item.category = "disagree";
		$scope.classifications.DISAGREE.push(item);

		return true;
	};
}]);

app.controller("step4Ctrl", function ($scope, $rootScope, $state) {
	//Copies $rootScope.classifications instead of getting the reference
	$scope.classifications = JSON.parse(JSON.stringify($rootScope.classifications));

	if (typeof $rootScope.ratings == "undefined") {
		$rootScope.ratings = {
			rating_3size: 0,
			rating_3: [],
			rating_2size: 0,
			rating_2: [],
			rating_1size: 0,
			rating_1: [],
			rating0size: 0,
			rating0: [],
			rating1size: 0,
			rating1: [],
			rating2size: 0,
			rating2: [],
			rating3size: 0,
			rating3: [],
		};
	}
	$scope.ratings = $rootScope.ratings;

	$scope.dropAgreeCallback = function (index, item, external, type) {
		var ret = item.category == "agree";
		if (ret) {
			$scope.classifications.AGREE.push(item);
		}
		return ret;
	};

	$scope.dropNeutralCallback = function (index, item, external, type) {
		var ret = item.category == "neutral";
		if (ret) {
			$scope.classifications.NEUTRAL.push(item);
		}
		return ret;
	};

	$scope.dropDisagreeCallback = function (index, item, external, type) {
		var ret = item.category == "disagree";
		if (ret) {
			$scope.classifications.DISAGREE.push(item);
		}
		return ret;
	};

	$scope.done = function () {
		var numberOfStatements = 0;
		$.map($scope.ratings, function(value,index){
			if (value instanceof Array) {
				numberOfStatements += value.length;
			}
		});
		return numberOfStatements == $rootScope.numberOfStatements;
	};

	$('#helpModal').modal(show = true);

	$scope.getStyle = function(statement) {
		if(statement.category == "agree") {
			return {"background-color":"#00A848"};
		} else if (statement.category == "neutral") {
			return {"background-color":"#BAB9B9"};
		} else {
			return {"background-color":"#FF6666"};
		}
	}

	$scope.next = function () {

		$rootScope.classifications = $scope.classifications;
		$state.go('step5');
	}

	$scope.back = function () {
		$rootScope.classifications = JSON.parse(JSON.stringify($rootScope.classifications_step3));
		$rootScope.ratings = {
			rating_3: [],
			rating_2: [],
			rating_1: [],
			rating0: [],
			rating1: [],
			rating2: [],
			rating3: []
		};
		$state.go('step3');
	}

	$scope.dropRating_3Callback = function (index, item, external, type) {
		return item;
	}

	$scope.dropRating_2Callback = function (index, item, external, type) {
		return item;
	}

	$scope.dropRating_1Callback = function (index, item, external, type) {
		return item;
	}

	$scope.dropRating0Callback = function (index, item, external, type) {
		return item;
	}

	$scope.dropRating1Callback = function (index, item, external, type) {
		return item;
	}

	$scope.dropRating2Callback = function (index, item, external, type) {
		return item;
	}

	$scope.dropRating3Callback = function (index, item, external, type) {
		return item;
	}
});

app.controller("step5Ctrl", function ($scope, $rootScope, $state) {

	if (typeof $rootScope.explanations == "undefined") {
		$rootScope.explanations = {
			agree: [{ statement: $rootScope.ratings.rating3[0], explanation: null }, { statement: $rootScope.ratings.rating3[1], explanation: null }],
			disagree: [{ statement: $rootScope.ratings.rating_3[0], explanation: null }, { statement: $rootScope.ratings.rating_3[1], explanation: null }],
		};

	}
	
	$scope.explanations = $rootScope.explanations;

	$('#helpModal').modal(show = true);

	$scope.done = function () {
		if ($scope.explanations.agree[0].explanation === null || $scope.explanations.agree[1].explanation === null ||
			$scope.explanations.disagree[0].explanation === null || $scope.explanations.disagree[1].explanation === null) {
			return false;
		} else {
			return !$scope.explanations.agree[0].explanation.isEmpty() && !$scope.explanations.agree[1].explanation.isEmpty() &&
				!$scope.explanations.disagree[0].explanation.isEmpty() && !$scope.explanations.disagree[1].explanation.isEmpty();
		}
	}

	$scope.next = function () {
		$state.go('step6');
	}

	$scope.back = function () {
		$state.go('step4');
	}

	String.prototype.isEmpty = function () {
		return (this.length === 0 || !this.trim());
	};
});

app.controller("step6Ctrl", function ($scope, $rootScope, $state) {
	$scope.questionnaire = {
		age: null,
		gender: null,
		country: null,
		education: null,
		occupation: null,
		heard_sr: null,
		read_sr: null,
		author_sr: null,
		heard_rr: null,
		comments: null,
		email: null,
	};

	$scope.back = function () {
		$state.go('step5');
	}

	$scope.done = function () {
		if ($scope.questionnaire.age === null || $scope.questionnaire.gender === null || $scope.questionnaire.country === null ||
			$scope.questionnaire.education === null || $scope.questionnaire.occupation === null || $scope.questionnaire.heard_sr === null ||
			$scope.questionnaire.read_sr === null || $scope.questionnaire.author_sr === null || $scope.questionnaire.heard_rr === null) {
			return false;
		} else {
			return !$scope.questionnaire.age.isEmpty() && !$scope.questionnaire.country.isEmpty();
		}
	}

	String.prototype.isEmpty = function () {
		return (this.length === 0 || !this.trim());
	};

	$scope.send = function () {
		$rootScope.questionnaire = $scope.questionnaire;

		var response = {
			classifications: {},
			ratings: {},
			explanations: {},
			questionnaire: {},
		}

		if (response.classifications === null || response.classifications === undefined){
			response.classifications = "no_response";
		} else {
			 response.classifications = parseClassifications($rootScope.classifications_step3);
		}

		if ($rootScope.ratings === null || $rootScope.ratings === undefined) {
			response.ratings = "no_response";
		} else {

			response.ratings.rating_3 = parseExplanations($rootScope.ratings.rating_3);
			response.ratings.rating_2 = parseExplanations($rootScope.ratings.rating_2);
			response.ratings.rating_1 = parseExplanations($rootScope.ratings.rating_1);
			response.ratings.rating0 = parseExplanations($rootScope.ratings.rating0);
			response.ratings.rating1 = parseExplanations($rootScope.ratings.rating1);
			response.ratings.rating2 = parseExplanations($rootScope.ratings.rating2);
			response.ratings.rating3 = parseExplanations($rootScope.ratings.rating3);
		}

		if ($rootScope.explanations === null || $rootScope.explanations === undefined) {
			response.explanations = "no_response";
		} else {
			response.explanations.agree = [];
			for (var i = 0; i < $rootScope.explanations.agree.length; i++) {
				var explanation = {};
				explanation.statementId = $rootScope.explanations.agree[i].statement.id;
				explanation.text = $rootScope.explanations.agree[i].explanation;
				response.explanations.agree.push(explanation);
			}

			response.explanations.disagree = [];
			for (var i = 0; i < $rootScope.explanations.disagree.length; i++) {
				var explanation = {};
				explanation.statementId = $rootScope.explanations.disagree[i].statement.id;
				explanation.text = $rootScope.explanations.disagree[i].explanation;
				response.explanations.disagree.push(explanation);
			}
		}

		if ($rootScope.questionnaire.age === null || $rootScope.questionnaire.age === undefined) {
			response.questionnaire.age = "no_response";
		} else {
			response.questionnaire.age = $rootScope.questionnaire.age;
		}

		if ($rootScope.questionnaire.gender === null || $rootScope.questionnaire.gender === undefined) {
			response.questionnaire.gender = "no_response";
		} else {
			response.questionnaire.gender = $rootScope.questionnaire.gender;
		}

		if ($rootScope.questionnaire.country === null || $rootScope.questionnaire.country === undefined) {
			response.questionnaire.country = "no_response";
		} else {
			response.questionnaire.country = $rootScope.questionnaire.country;
		}

		if ($rootScope.questionnaire.education === null || $rootScope.questionnaire.education === undefined) {
			response.questionnaire.education = "no_response";
		} else {
			response.questionnaire.education = $rootScope.questionnaire.education;
		}

		if ($rootScope.questionnaire.occupation === null || $rootScope.questionnaire.occupation === undefined) {
			response.questionnaire.occupation = "no_response";
		} else {
			response.questionnaire.occupation = $rootScope.questionnaire.occupation;
		}

		if ($rootScope.questionnaire.heard_sr === null || $rootScope.questionnaire.heard_sr === undefined) {
			response.questionnaire.heard_sr = "no_response";
		} else {
			response.questionnaire.heard_sr = $rootScope.questionnaire.heard_sr;
		}

		if ($rootScope.questionnaire.read_sr === null || $rootScope.questionnaire.read_sr === undefined) {
			response.questionnaire.read_sr = "no_response";
		} else {
			response.questionnaire.read_sr = $rootScope.questionnaire.read_sr;
		}

		if ($rootScope.questionnaire.author_sr === null || $rootScope.questionnaire.author_sr === undefined) {
			response.questionnaire.author_sr = "no_response";
		} else {
			response.questionnaire.author_sr = $rootScope.questionnaire.author_sr;
		}

		if ($rootScope.questionnaire.heard_rr === null || $rootScope.questionnaire.heard_rr === undefined) {
			response.questionnaire.heard_rr = "no_response";
		} else {
			response.questionnaire.heard_rr = $rootScope.questionnaire.heard_rr;
		}

		if ($rootScope.questionnaire.comments === null || $rootScope.questionnaire.comments === undefined) {
			response.questionnaire.comments = "no_response";
		} else {
			response.questionnaire.comments = $rootScope.questionnaire.comments;
		}

		if ($rootScope.questionnaire.email === null || $rootScope.questionnaire.email === undefined) {
			response.questionnaire.email = "no_response";
		} else {
			response.questionnaire.email = $rootScope.questionnaire.email;
		}

		rootRef.push(response, function (error) {
			if (error) {
				$scope.send();
				return;
			} else {
				$state.go('step7');
			}
		});

		function parseExplanations(arrayorig) {
			var arraydest = [];

			for (var i = 0; i < arrayorig.length; i++) {
				arraydest.push(arrayorig[i].id);
			}

			return arraydest;
		}
		
		function parseClassifications(classificationsOrig) {
			var parsedClassifications = {'AGREE': [],'NEUTRAL': [],'DISAGREE': [],};
			
			for(var i = 0; i < classificationsOrig.AGREE.length; i++) {
				parsedClassifications.AGREE.push(classificationsOrig.AGREE[i].id);
			}
			
			for(var i = 0; i < classificationsOrig.NEUTRAL.length; i++) {
				parsedClassifications.NEUTRAL.push(classificationsOrig.NEUTRAL[i].id);
			}
			
			for(var i = 0; i < classificationsOrig.DISAGREE.length; i++) {
				parsedClassifications.DISAGREE.push(classificationsOrig.DISAGREE[i].id);
			}
			
			return parsedClassifications;
		}
	}

});

app.controller("step7Ctrl", function ($scope, $rootScope, $state) {

});
