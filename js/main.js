( function() {
	'use strict';

	/**
	* @object Constants
	* @description Holds constants used in application
	**/
	var CONSTANTS = {
			DAY_TO_SECONDS:  24 * 60 * 60 * 1000,
			DAYS: [ 'sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat' ]
		};

	/**
	* @class Helper
	* @description Implements helper methods
	**/
	var Helper = {

		/**
		* @method sortArrayOfObjects
		* @description Sorts an array in ascending order based on given key values.
		* @param key - key name on which objects needs to be sorted.
		**/
		sortArrayOfObjects : function( array, key ) {
			array.sort( function( a, b ) {
				return a[key] - b[key];
			});
			return array;
		},

		/**
		* @method getWidthFromCount
		* @description Returns width in % based on number of nodes in grid.
		* @param count - Total number of nodes in square box.
		**/
		getWidthFromCount : function( count ) {
			return 100/Math.ceil( Math.sqrt(count));
		}
	};

	/**
	* @class PersonNodeFactory
	* @description Implements node factory for person nodes.
	* @constructor PersonNodeFactory
	* @param maxSize[100] - Max number of nodes it can retain.
	**/
	var PersonNodeFactory = function( maxSize ) {
		this._nodeList = [];
		this._maxSize = maxSize | 100;
	};
	
	PersonNodeFactory.prototype = {

		/**
		* @method _createElement
		* @private
		* @description Returns dom element for person node, if not available then creates it.
		**/
		_createElement: function() {
			if( this._nodeList.length ) {
				return this._nodeList.pop();
			}
			var elmNode = document.createElement('div');
			elmNode.className = 'day__person';
			return elmNode;
		},

		/**
		* @method createPersonNode
		* @description Creates person node with text and sets width, height.
		* @param name - text inside node.( person name)
		* @param width - width of the node.
		* @param height - height of the node.
		**/
		createPersonNode : function( name, width, height ) {
			var elmPerson = this._createElement();
			// elmPerson.className = 'day__person';
			elmPerson.innerText = name;
			elmPerson.style.width = width + '%';
			elmPerson.style.height = height + '%';

			return elmPerson;
		},

		/**
		* @method releasePersonNode
		* @description Stores back node into list if space is available.
		* @param node - node to be stored
		**/
		releasePersonNode : function( node ) {
			if( this._nodeList.length <= this._maxSize ) {
				this._nodeList.push(node);
			}
		}
	}

	// Create factory instance - Singlton object
	PersonNodeFactory.Instance = new PersonNodeFactory(100);


	/**
	* @class GOTCalendar
	* @description Handles calendar operations.
	* @constructor GOTCalendar
	* @param elmCalender - Wrapper element of calendar.
	**/
	var GOTCalendar = function( elmCalender ) {
		this._elmCalender = elmCalender;
	};

	GOTCalendar.prototype = {

		/**
		* @method onUpdateYear
		* @description To be called when calendar needed to be calculated again.
		* @param inputData - array person objects
		* @param inputYearValue - year value for which birthday needed to be calculated.
		**/
		onUpdateYear : function( inputData, inputYearValue ) {
			// Map from day to array of person names.
			var mapDayToNames = {};

			// Initialize map
			CONSTANTS.DAYS.forEach( function( day ) {
				mapDayToNames[day] = [];
			}); ;

		 	this._fillSortedDataForDays(inputData, inputYearValue, mapDayToNames); 
			this._updateView(mapDayToNames);
		},

		/**
		* @method _fillSortedDataForDays
		* @private
		* @description Fills map from day to person names in sorted order.
		* @param inputData - array person objects
		* @param inputYearValue - year value for which birthday needed to be calculated.
		* @param mapDayToNames - map object to be filled.
		**/
		_fillSortedDataForDays : function( data, inputYearValue, mapDayToNames ) {
			// Clone data
			var personData = JSON.parse( JSON.stringify( data ));

			this._fillAgeAndDay( personData, inputYearValue );
			this._sortDataOnAge( personData );
			this._createMapFromDayToNames( personData, mapDayToNames );
		},

		/**
		* @method _fillAgeAndDay
		* @private
		* @description Calculates and fills persons' age and day value of birdate for given year.
		* @param personData - array of person objects.
		* @param inputYearValue - year value for which birthday needed to be calculated.
		**/
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

		/**
		* @method _sortDataOnAge
		* @private
		* @description Sorts persons array based on their ages from youngster to elder.
		* @param personData - array of persons
		**/
		_sortDataOnAge : function( personData ) {
			Helper.sortArrayOfObjects(personData, 'age' );
		},

		/**
		* @method _createMapFromDayToNames
		* @private
		* @description Fills map by storing person name agains day he is born 
		* and stores only persons who are born before input year.
		* @param personData - array of persons
		* @param mapDayToNames - map to be filled.
		**/
		_createMapFromDayToNames : function( personData, mapDayToNames ) {
			personData.forEach( function( person ) {
				if(  person.age >= 0 ) {
					mapDayToNames[person.day].push( person.name );
				}
			});
		},

		/**
		* @method _updateView
		* @private
		* @description Updates view.
		* @param mapDayToNames - map containing sorted persons names against birth day for given year.
		**/
		_updateView : function( mapDayToNames ) {
			// Release all person nodes which will be removed thereafter
			var arrPersonNodes = this._elmCalender.getElementsByClassName('day__person');
			this._releasePersonNodes( arrPersonNodes );

			// For each days start filling dom.
			CONSTANTS.DAYS.forEach( function( day) {

				var arrPersonNames = mapDayToNames[day],
					cntPersons = arrPersonNames.length,
					elmLiCalendarBox = this._elmCalender.querySelector('[data-day=' + day +']'),
					elmDaysContainer = elmLiCalendarBox.getElementsByClassName('day__people')[0],
					elmLiCalendarBoxClassName = elmLiCalendarBox.className,
					elmDocFragment = document.createDocumentFragment();

				// Empty person nodes container
				elmDaysContainer.innerHTML = '';


				if( cntPersons === 0 ) {
					elmLiCalendarBox.className = elmLiCalendarBoxClassName + ' day--empty';
				}
				else {
					var	width, height;
					width = height = Helper.getWidthFromCount(cntPersons);
					elmLiCalendarBox.className = elmLiCalendarBoxClassName.replace('day--empty', '');

					arrPersonNames.forEach( function( person ) {
						elmDocFragment.appendChild(PersonNodeFactory.Instance.createPersonNode(person, width, height));
					});
					elmDaysContainer.appendChild(elmDocFragment);
				}

			}.bind(this));
		},

		/**
		* @method _releasePersonNodes
		* @private
		* @description Relases person nodes to factory.
		* @param arrPersonNodes - an array of nodes to be released.
		**/
		_releasePersonNodes : function( arrPersonNodes ) {
			var cntPersonNodes = arrPersonNodes.length;
			// Release nodes to save it to Factory

			for( var i = 0; i < cntPersonNodes ; i++ ) {
				PersonNodeFactory.Instance.releasePersonNode( arrPersonNodes[ i ] );
			}

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
