/**
 * $.form
 * 
 * @version 0.3
 * 
 * Params for validator object :
 * required : Boolean
 * type : String ('string', 'email', 'int', 'float', 'phone', 'mobile')
 * rangeLength : Array ([minLength:Number, maxLength:Number])
 * minLength : Number
 * maxLength : Number
 * equalTo : Number, String
 * rangeValue : Array ([minValue:Number, maxValue:Number])
 * minValue : Number
 * maxValue : Number
 * tipValue : Number, String
 * defaultValue : Number, String
 * errorMessage : String
 * errorContainer : String
 * 
 * Params not yet implemented :
 * lengthEqualTo : Number
 */
(function($){
	function delegate (method, instance) {	return function() {	return method.apply(instance, arguments); } }
	
	var default_options = {
		required: false,
		validate: function(value, options) {
			return !emptyOrTip(value, options);
		},
		fieldContainer: undefined,
		errorMessage: 'Merci de renseigner ce champ correctement.',
		errorContainer: undefined,
		tipValue: '',
		defaultValue: ''
	};
	
	/****************************************************************************************************
	 * VALIDATOR
	 ****************************************************************************************************/
	
	function empty(str) {
		return ( (str === undefined) || (str === null) || (str === false) || (str === "") || (str === 0) || (str === "0") );
	};

	function emptyOrTip(value, options) {
		var ok = !empty(value);

		if (ok && !empty(options.tipValue)) {
			ok = ok && (options.tipValue != value);
		}

		return !ok;
	}
	
	/****************************************************************************************************
	 * MANAGER
	 ****************************************************************************************************/
	
	function FormManager (jForm) {
		this.jForm = jForm;
		this.rules = [];
	}
	
	var p = FormManager.prototype;
	
	/****************************************************************************************************
	 * INIT
	 ****************************************************************************************************/
	
	/**
	 * initField
	 * @param name
	 * @param value
	 */
	p.initField = function (name, value) {
		var o = $('input[name=' + name + ']', this.jForm);
		o.val(value);
		
		return (this);
	};

	/**
	 * tipField
	 * @param name
	 * @param value
	 */
	p.tipField = function (name, value) {
		var o = $('input[name=' + name + ']', this.jForm);
		
		if (empty(o.val())) {
			o.val(value);
		}
		
		o.focus(function(){
			if (o.val() == value) {
				o.val('');
			}
		});
		o.blur(function(){
			if (o.val() === '') {
				o.val(value);
			}
		});
		
		return (this);
	};

	/**
	 * initSelect
	 * @param name
	 * @param value
	 */
	p.initSelect = function (name, value) {
		var option = $('select[name=' + name + '] option[value=' + value + ']', this.jForm);
		option[0].selected = true;
		
		return (this);
	};

	/**
	 * initRadio
	 * @param name
	 * @param value
	 */
	p.initRadio = function (name, value) {
		var o = $('input[name=' + name + '][value=' + value + ']', this.jForm);
		o[0].checked = true;
		
		return (this);
	};

	/****************************************************************************************************
	 * RULES
	 ****************************************************************************************************/
	
	/**
	 * addField
	 * @param name_form
	 * @param name
	 * @param validator
	 */
	p.addField = function (name, options) {
		options = $.extend({}, default_options, options);
		
		this.tipField(name, options.tipValue);
		
		if (options.defaultValue !== '') {
			this.initField(name, options.defaultValue);
		}
		
		var r = {
				name: name,
				type: 'field',
				options: options
		};
		
		this.rules.push(r);
		
		return (this);
	};

	/**
	 * addSelect
	 * @param name_form
	 * @param name
	 * @param options
	 */
	p.addSelect = function (name, options) {
		options = $.extend({}, default_options, options);
		
		this.initSelect(name, options.defaultValue);
		
		var r = {
				name: name,
				type: 'field',
				options: options
		};
		
		this.rules.push(r);
		
		return (this);
	};

	/**
	 * addRadio
	 * @param name_form
	 * @param name
	 * @param options
	 */
	p.addRadio = function (name, options) {
		options = $.extend({}, default_options, options);
		
		if (options.defaultValue) {
			this.initRadio(name, options.defaultValue);
		}
		
		var r = {
				name: name,
				type: 'radio',
				options: options
		};
		
		this.rules.push(r);
		
		return (this);
	};

	/**
	 * addRule
	 * @param name_form
	 * @param name
	 * @param rule
	 * @param options
	 */
	p.addRule = function (name, options) {
		options = $.extend({}, default_options, options);
		
		var r = {
				name: name,
				type: 'rule',
				options: options
		};
		
		this.rules.push(r);
		
		return (this);
	};

	/****************************************************************************************************
	 * CHECK
	 ****************************************************************************************************/
	
	p.check = function (e) {
		var ok = true;
		
		if (this.errorContainer != undefined) {
			this.errorContainer.empty();
			this.errorContainer.hide();
		}
		
		for (var i=0, l=this.rules.length; i<l; i++) {
			var name    = this.rules[i].name;
			var type    = this.rules[i].type;
			var options = this.rules[i].options;
			
			var value;
			switch (type) {
				case 'field':
					value = $('[name=' + name + ']', this.jForm).val();
					break;
					
				case 'radio':
					value = $('[name=' + name + ']:checked', this.jForm).val();
					break;
			}

			if ((options.required || !emptyOrTip(value, options)) && !options.validate(value, options)) {
				ok = false;

				if (options.errorContainer != undefined) {
					options.errorContainer.html(options.errorMessage);
					options.errorContainer.show();
				}
				else if (this.errorContainer != undefined) {
					this.errorContainer.append('<div>' + options.errorMessage + '</div>');
					this.errorContainer.show();
				}
				
				if ((options.fieldContainer != undefined) && (!options.fieldContainer.hasClass("error"))) {
					options.fieldContainer.addClass("error");
				}
			}
			else {
				if (options.errorContainer != undefined) {
					options.errorContainer.hide();
				}
				
				if (options.fieldContainer != undefined) {
					options.fieldContainer.removeClass("error");
				}
			}
		}
		
		if (ok && (this.errorContainer != undefined)) {
			this.errorContainer.hide();
		}
		
		if (!ok) {
			e.preventDefault();
		}
	};
	
	/***************************************************************************
	 * jQuery
	 **************************************************************************/
	
	$.fn.form = function() {
		var dom = this.get(0);
		
		if (dom === undefined) {
			return new FormManager(null);
		}
		
		if (dom.formManager === undefined) {
			dom.formManager = new FormManager(this);
			
			this.submit(delegate(dom.formManager.check, dom.formManager));
		}
		
		return (dom.formManager);
	};
})(jQuery);
