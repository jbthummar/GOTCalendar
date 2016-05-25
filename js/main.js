( function() {
	'use strict';

	var inputYear = document.getElementsByClassName('js-year')[0],
		btnUpdate = document.getElementsByClassName('js-update')[0],
		elmCalender = document.getElementsByClassName('js-calendar')[0],
		inputYearValue,
		arrDays = [ 'sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat' ];

	function getJsonInput() {
		return eval(document.getElementById('json-input').value);
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
		updateView(mapDayToNames);
	};

	function fillSortedDataForDays(data, inputYearValue, mapDayToNames) {
		// TODO: Optimize for subsequent calculations after calculated for 1 year.

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
	}

	function updateView( mapDayToNames ) {

		arrDays.forEach( function( day) {

			var arrPersons = mapDayToNames[day],
				cntPersons = arrPersons.length,
				elmLiCalendarBox = elmCalender.querySelector('[data-day=' + day +']'),
				elmDaysContainer = elmLiCalendarBox.getElementsByClassName('day__people')[0],
				elmLiCalendarBoxClassName = elmLiCalendarBox.className;

			elmDaysContainer.innerHTML = '';


			if( cntPersons === 0 ) {
				elmLiCalendarBox.className = elmLiCalendarBoxClassName + ' day--empty';
			}
			else {
				var	width, height;
				width = height = getWidthFromCount(cntPersons);
				elmLiCalendarBox.className = elmLiCalendarBoxClassName.replace('day--empty', '');

				arrPersons.forEach( function( person ) {
					elmDaysContainer.appendChild( createPersonNode(person, width, height));
				});
			}

		});


		console.log(mapDayToNames);
	};

	function getWidthFromCount( count ) {
		return 100/Math.ceil( Math.sqrt(count))
	};

	function createPersonNode( name, width, height ) {
		var elmPerson = document.createElement('div');
		elmPerson.className = 'day__person';
		elmPerson.innerText = name;
		elmPerson.style.width = width + '%';
		elmPerson.style.height = height + '%';

		return elmPerson;
	};
})();
