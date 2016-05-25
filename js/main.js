( function() {
	'use strict';

	var inputYear = document.getElementsByClassName('js-year')[0],
		btnUpdate = document.getElementsByClassName('js-update')[0],
		inputYearValue /*= inputYear.value*/,
		arrDays = [ 'sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat' ];

	function getJsonInput() {
		return eval(document.getElementById('json-input').innerHTML);
	}

	btnUpdate.onclick = function() {
		var inputData = getJsonInput();
		if( inputYearValue !== inputYear.value ) {
			inputYearValue = inputYear.value;
			onUpdateYear(inputData, inputYearValue);
		}
	};

	function onUpdateYear(inputData, inputYearValue ) {
		var mapDayToNames = {};

		arrDays.forEach( function( day ) {
			mapDayToNames[day] = [];
		}); ;

	 	fillSortedDataForDays(inputData, inputYearValue, mapDayToNames); 
	};

	function fillSortedDataForDays(data, inputYearValue, mapDayToNames) {
		var personData = JSON.parse( JSON.stringify( data ));
		personData.forEach( function(person) {
			var arrDate = person.birthday.split('/'),
				objDOB = new Date( arrDate[2], arrDate[0], arrDate[1] ),
				objDateToday = new Date( inputYearValue, arrDate[0], arrDate[1] ),
				oneDay = 24 * 60 * 60 * 1000;

			person.day = arrDays[ objDateToday.getDay() ];
			person.age = Math.round(( new Date() - objDOB )/ oneDay );
		});

		personData.sort( function( a, b ) {
			return a.age - b.age;
		});

		personData.forEach( function( person ) {
			mapDayToNames[person.day].push( person.name );
		});


		console.log(mapDayToNames);
	}
})();
