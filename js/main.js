( function() {
	'use strict';

	var CONSTANTS = {
			DAY_TO_SECONDS:  24 * 60 * 60 * 1000,
			DAYS: [ 'sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat' ]
		};

	var Helper = {

		sortArrayOfObjects : function( array, key ) {
			array.sort( function( a, b ) {
				return a[key] - b[key];
			});
			return array;
		},

		getWidthFromCount : function( count ) {
			return 100/Math.ceil( Math.sqrt(count));
		}
	};

	var PersonNodeFactory = function( maxSize ) {
		this._nodeList = [];
		this._maxSize = maxSize;
	};
	
	PersonNodeFactory.prototype = {

		_createElement: function() {
			if( this._nodeList.length ) {
				return this._nodeList.pop();
			}
			var elmNode = document.createElement('div');
			elmNode.className = 'day__person';
			return elmNode;
		},

		createPersonNode : function( name,width, height ) {
			var elmPerson = this._createElement();
			// elmPerson.className = 'day__person';
			elmPerson.innerText = name;
			elmPerson.style.width = width + '%';
			elmPerson.style.height = height + '%';

			return elmPerson;
		},

		releasePersonNode : function( node ) {
			if( this._nodeList.length <= this._maxSize ) {
				this._nodeList.push(node);
			}
		}
	}

	PersonNodeFactory.Instance = new PersonNodeFactory(100);


	var GOTCalendar = function( elmCalender ) {
		this._elmCalender = elmCalender;
	};

	GOTCalendar.prototype = {

		onUpdateYear : function( inputData, inputYearValue ) {
			var mapDayToNames = {};

			CONSTANTS.DAYS.forEach( function( day ) {
				mapDayToNames[day] = [];
			}); ;

		 	this._fillSortedDataForDays(inputData, inputYearValue, mapDayToNames); 
			this._updateView(mapDayToNames);
		},


		_fillSortedDataForDays : function(data, inputYearValue, mapDayToNames) {
			var personData = JSON.parse( JSON.stringify( data ));
			this._fillAgeAndDay( personData, inputYearValue );
			personData = this._filterOutNoBorns( personData );
			//TODO : Add code to filter out persons born after input year.
			this._sortDataOnAge( personData );
			this._createMapFromDayToNames( personData, mapDayToNames );
		},

		_fillAgeAndDay : function( personData, inputYearValue ) {
			personData.forEach( function(person) {
				var arrDate = person.birthday.split('/'),
					objDOB = new Date( arrDate[2], arrDate[0] - 1, arrDate[1] ),
					objDOBInputYear = new Date( inputYearValue, arrDate[0] - 1, arrDate[1] ),
					oneDay = CONSTANTS.DAY_TO_SECONDS;

				person.age = Math.round(( objDOBInputYear - objDOB )/ oneDay );
				person.day = CONSTANTS.DAYS[ objDOBInputYear.getDay() ];
			});
		},

		_filterOutNoBorns : function( personData ) {
			return personData.filter( function( person ) { 
				return person.age > 0;
			} );
		},

		_sortDataOnAge : function( personData ) {
			Helper.sortArrayOfObjects(personData, 'age' );
		},

		_createMapFromDayToNames : function( personData, mapDayToNames ) {
			personData.forEach( function( person ) {
				mapDayToNames[person.day].push( person.name );
			});
		},

		_updateView : function( mapDayToNames ) {

			CONSTANTS.DAYS.forEach( function( day) {

				var arrPersons = mapDayToNames[day],
					cntPersons = arrPersons.length,
					elmLiCalendarBox = this._elmCalender.querySelector('[data-day=' + day +']'),
					elmDaysContainer = elmLiCalendarBox.getElementsByClassName('day__people')[0],
					elmLiCalendarBoxClassName = elmLiCalendarBox.className;

				//TODO : Add code to release person nodes
				elmDaysContainer.innerHTML = '';


				if( cntPersons === 0 ) {
					elmLiCalendarBox.className = elmLiCalendarBoxClassName + ' day--empty';
				}
				else {
					var	width, height;
					width = height = Helper.getWidthFromCount(cntPersons);
					elmLiCalendarBox.className = elmLiCalendarBoxClassName.replace('day--empty', '');

					arrPersons.forEach( function( person ) {
						elmDaysContainer.appendChild( PersonNodeFactory.Instance.createPersonNode(person, width, height));
					});
				}

			}.bind(this));

			console.log(mapDayToNames);
		}
	};


	var Controller = function() {
		this._init();
		this._bindEvents();
	};

	Controller.prototype = {

		_init : function() {
			this._elmCalendar = document.getElementsByClassName('js-calendar')[0];
			this._elmInputYear = document.getElementsByClassName('js-year')[0];
			this._elmBtnUpdate = document.getElementsByClassName('js-update')[0];
			this._elmInputData = document.getElementById('json-input');
			this._inputDataValue = this.getInputDataObject();
			this._inputYearValue = null;
			this._bInputDataChanged = true;

			this._instanceCalendar = new GOTCalendar( this._elmCalendar );
		},

		_bindEvents : function() {
			this._elmBtnUpdate.onclick = this._onClickUpdate.bind(this);
			this._elmInputData.oninput = this._onChangeInputData.bind(this);
		},

		_onClickUpdate : function() {
			if( this._bInputDataChanged ) {
				 this._inputDataValue = this.getInputDataObject();
			}

			if( this._bInputDataChanged  || this._inputYearValue !== this._elmInputYear.value ) {
				this._bInputDataChanged = false;
				this._inputYearValue = this._elmInputYear.value;
				this._instanceCalendar.onUpdateYear(this._inputDataValue, this._inputYearValue);
			}
		},

		_onChangeInputData : function() {
			this._bInputDataChanged = true;
		},

		getInputDataObject : function() {
			return eval( this._elmInputData.value );
		}
	};

	
	var objController = new Controller();
})();
