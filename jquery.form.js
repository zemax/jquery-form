/**
 * $.form
 *
 * author Maxime Cousinou
 */
(function (factory) {
	if ( typeof exports === 'object' ) {
		module.exports = factory(jQuery);
	} else {
		factory(jQuery);
	}
}(function ($) {
	function delegate(method, instance) {
		return function () {
			return method.apply(instance, arguments);
		}
	}

	var default_options = {
		required:              false,
		validate:              function (value, options) {
			return !FormManager.emptyOrTip(value, options);
		},
		fieldContainer:        undefined,
		errorMessage:          'Merci de renseigner ce champ correctement.',
		errorContainer:        undefined,
		errorMessageContainer: undefined,
		tipValue:              '',
		defaultValue:          ''
	};

	/**************************************************
	 * MANAGER
	 **************************************************/

	function FormManager(jForm, options) {
		this.jForm = jForm;
		this.rules = [];

		$.extend(this, options);
		0
	}

	var p = FormManager.prototype;

	window.FormManager = window.FormManager || FormManager;

	/**************************************************
	 * VALIDATOR
	 **************************************************/

	FormManager.empty = function (str) {
		return ( (str === undefined) || (str === null) || (str === false) || (str === "") || (str === 0) || (str === "0") );
	}

	FormManager.emptyOrTip = function (value, options) {
		var ok = !FormManager.empty(value);

		if ( ok && !FormManager.empty(options.tipValue) ) {
			ok = ok && (options.tipValue != value);
		}

		return !ok;
	}

	FormManager.validateEmail = function (email) {
		var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return re.test(email);
	}

	/**************************************************
	 * ERROR MESSAGE
	 **************************************************/

	p.hideMessage = function () {
		if ( this.errorContainer != undefined ) {
			if ( this.errorMessageContainer != undefined ) {
				this.errorMessageContainer.empty();
			}
			else {
				this.errorContainer.empty();
			}
			this.errorContainer.hide();
		}
	}

	p.showMessage = function (message) {
		if ( this.errorContainer != undefined ) {
			if ( this.errorMessageContainer != undefined ) {
				this.errorMessageContainer.append('<div>' + message + '</div>');
			}
			else {
				this.errorContainer.append('<div>' + message + '</div>');
			}
			this.errorContainer.show();
		}
	}

	/**************************************************
	 * INIT
	 **************************************************/

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

		if ( FormManager.empty(o.val()) ) {
			o.val(value);
		}

		o.focus(function () {
			if ( o.val() == value ) {
				o.val('');
			}
		});
		o.blur(function () {
			if ( o.val() === '' ) {
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
		option[ 0 ].selected = true;

		return (this);
	};

	/**
	 * initRadio
	 * @param name
	 * @param value
	 */
	p.initRadio = function (name, value) {
		var o = $('input[name=' + name + '][value=' + value + ']', this.jForm);
		o[ 0 ].checked = true;

		return (this);
	};

	/**************************************************
	 * RULES
	 **************************************************/

	/**
	 * addField
	 * @param name
	 * @param options
	 */
	p.addField = function (name, options) {
		options = $.extend({}, default_options, options);

		var $f = $('[name=' + name + ']', this.jForm);
		var placeholder = $f.attr('placeholder');

		if ( 'placeholder' in document.createElement("input") ) {
			if ( !placeholder && options.tipValue ) {
				$f.attr('placeholder', options.tipValue);
			}
		}
		else {
			if ( placeholder && !options.tipValue ) {
				options.tipValue = placeholder;
			}

			this.tipField(name, options.tipValue);
		}

		if ( options.defaultValue !== '' ) {
			this.initField(name, options.defaultValue);
		}

		var r = {
			name:    name,
			type:    'field',
			options: options
		};

		this.rules.push(r);

		return (this);
	};

	/**
	 * addSelect
	 * @param name
	 * @param options
	 */
	p.addSelect = function (name, options) {
		options = $.extend({}, default_options, options);

		this.initSelect(name, options.defaultValue);

		var r = {
			name:    name,
			type:    'field',
			options: options
		};

		this.rules.push(r);

		return (this);
	};

	/**
	 * addRadio
	 * @param name
	 * @param options
	 */
	p.addRadio = function (name, options) {
		options = $.extend({}, default_options, options);

		if ( options.defaultValue ) {
			this.initRadio(name, options.defaultValue);
		}

		var r = {
			name:    name,
			type:    'radio',
			options: options
		};

		this.rules.push(r);

		return (this);
	};

	/**
	 * addRule
	 * @param name
	 * @param options
	 */
	p.addRule = function (name, options) {
		options = $.extend({}, default_options, options);
		options.required = true;

		var r = {
			name:    name,
			type:    'rule',
			options: options
		};

		this.rules.push(r);

		return (this);
	};

	/**************************************************
	 * CHECK
	 **************************************************/

	p.check = function (e) {
		var ok = true;

		this.hideMessage();

		for ( var i = 0, l = this.rules.length; i < l; i++ ) {
			var name = this.rules[ i ].name;
			var type = this.rules[ i ].type;
			var options = this.rules[ i ].options;

			var value;
			switch ( type ) {
				case 'field':
					value = $('[name=' + name + ']', this.jForm).val();
					break;

				case 'radio':
					value = $('[name=' + name + ']:checked', this.jForm).val();
					break;
			}

			options.currentStatus = ok;

			if ( (options.required || !FormManager.emptyOrTip(value, options)) && !options.validate(value, options) ) {
				ok = false;

				if ( options.errorContainer != undefined ) {
					if ( options.errorMessageContainer != undefined ) {
						options.errorMessageContainer.html(options.errorMessage);
					}
					else {
						options.errorContainer.html(options.errorMessage);
					}
					options.errorContainer.show();
				}
				else {
					this.showMessage(options.errorMessage);
				}

				if ( (options.fieldContainer != undefined) && (!options.fieldContainer.hasClass("error")) ) {
					options.fieldContainer.addClass("error");
				}
			}
			else {
				if ( options.errorContainer != undefined ) {
					options.errorContainer.hide();
				}

				if ( options.fieldContainer != undefined ) {
					options.fieldContainer.removeClass("error");
				}
			}
		}

		if ( ok ) {
			this.hideMessage();
		}

		if ( !ok ) {
			e.preventDefault();
		}
	};

	/***************************************************************************
	 * jQuery
	 **************************************************************************/

	$.fn.form = function (options) {
		options = $.extend({}, options);

		var dom = this.get(0);

		if ( dom === undefined ) {
			return new FormManager(null, options);
		}

		if ( dom.formManager === undefined ) {
			dom.formManager = new FormManager(this, options);

			this.submit(delegate(dom.formManager.check, dom.formManager));
		}

		return (dom.formManager);
	};
}));
