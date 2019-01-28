/**
 * The formFiller gremlin fills forms by entering data, selecting options, clicking checkboxes, etc
 *
 * As much as possible, the form filling is done using mouse and keyboard
 * events, to trigger any listener bound to it.
 *
 * By default, the formFiller gremlin activity is showed by changing the 
 * element border to solid red.
 *
 *   var formFillerGremlin = gremlins.species.formFiller();
 *   horde.gremlin(formFillerGremlin);
 *
 * The formFiller gremlin can be customized as follows:
 *
 *   formFillerGremlin.elementMapTypes({'select': function selectFiller(element) {} }); // form element filler functions
 *   formFillerGremlin.showAction(function(element) { // show the gremlin activity on screen });
 *   formFillerGremlin.canFillElement(function(element) { return true }); // to limit where the gremlin can fill
 *   formFillerGremlin.maxNbTries(5); // How many times the gremlin must look for a fillable element before quitting
 *   formFillerGremlin.logger(loggerObject); // inject a logger
 *   formFillerGremlin.randomizer(randomizerObject); // inject a randomizer
 */
import configurable from '../utils/configurable';
import RandomizerRequiredException from '../exceptions/randomizerRequired';
import matchesSelector from '../utils/matchesSelector';

export default function formFiller() {
	const { document } = global;

	const config = {};

	const fillTextElement = function(element) {
		const character = config.randomizer.character();
		element.value += character;
		return character;
	};

	const fillNumberElement = function(element) {
		const number = config.randomizer.character({ pool: '0123456789' });
		element.value += number;
		return number;
	};

	const fillSelect = function(element) {
		const options = element.querySelectorAll('option');
		if (options.length === 0) return;
		const randomOption = config.randomizer.pick(options);
		options.forEach(option => {
			option.selected = option.value === randomOption.value;
		});
		return randomOption.value;
	};

	const fillRadio = function(element) {
		// using mouse events to trigger listeners
		const evt = document.createEvent('MouseEvents');
		evt.initMouseEvent('click', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
		element.dispatchEvent(evt);

		return element.value;
	};

	const fillCheckbox = function(element) {
		// using mouse events to trigger listeners
		const evt = document.createEvent('MouseEvents');
		evt.initMouseEvent('click', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
		element.dispatchEvent(evt);

		return element.value;
	};

	const fillEmail = function(element) {
		const email = config.randomizer.email();
		element.value = email;
		return email;
	};

	Object.assign(config, {
		elementMapTypes: {
			select: fillSelect,
			textarea: fillTextElement,
			'input[type="text"]': fillTextElement,
			'input[type="password"]': fillTextElement,
			'input[type="number"]': fillNumberElement,
			'input[type="radio"]': fillRadio,
			'input[type="checkbox"]': fillCheckbox,
			'input[type="email"]': fillEmail,
			'input:not([type])': fillTextElement
		},
		showAction(element) {
			if (element.attributes['data-old-border'] === undefined) {
				element.attributes['data-old-border'] = element.style.border;
			}

			const oldBorder = element.attributes['data-old-border'];
			element.style.border = '1px solid red';

			setTimeout(function() {
				element.style.border = oldBorder;
			}, 500);
		},
		canFillElement: () => true,
		maxNbTries: 10,
		logger: null,
		randomizer: null,
	});

	const formFillerGremlin = function() {
		if (!config.randomizer) throw new RandomizerRequiredException();

		// Retrieve all selectors
		const elementTypes = Object.keys(config.elementMapTypes);

		let element;
		let nbTries = 0;

		// eslint-disable-next-line no-restricted-syntax
		do {
			// Find a random element within all selectors
			const elements = document.querySelectorAll(elementTypes.join(','));
			if (elements.length === 0) return false;
			element = config.randomizer.pick(elements);
			nbTries++;
			if (nbTries > config.maxNbTries) return false;
		} while (!element || !config.canFillElement(element));

		// Retrieve element type
		let elementType;
		for (const selector in config.elementMapTypes) {
			if (matchesSelector(element, selector)) {
				elementType = selector;
				break;
			}
		}

		const value = config.elementMapTypes[elementType](element);
		config.showAction && config.showAction(element);
		config.logger && config.logger.log && config.logger.log('gremlin', 'formFiller', 'input', value, 'in', element);
	};

	configurable(formFillerGremlin, config);

	return formFillerGremlin;
};
