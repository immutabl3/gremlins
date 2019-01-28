/**
 * The typer gremlin types keys on the keyboard
 *
 * Note that keyboard events must be localized somewhere on screen, so this
 * gremlins picks a random screen location first.
 *
 * By default, the typer gremlin activity is showed by a letter surrounded by
 * a orange circle with a keyname on it.
 *
 *   var typerGremlin = gremlins.species.typer();
 *   horde.gremlin(typerGremlin);
 *
 * The typerGremlin gremlin can be customized as follows:
 *
 *   typerGremlin.eventTypes(['keypress', 'keyup', 'keydown']); // types of events to trigger
 *   typerGremlin.showAction(function(element) { // show the gremlin activity on screen });
 *   typerGremlin.logger(loggerObject); // inject a logger
 *   typerGremlin.randomizer(randomizerObject); // inject a randomizer
 *
 */
import configurable from '../utils/configurable';
import RandomizerRequiredException from '../exceptions/randomizerRequired';

export default function typerGremlin() {
	const { document: { body, documentElement } } = global;

	const config = {
		eventTypes: ['keypress', 'keyup', 'keydown'],
		showAction(targetElement, x, y, key) {
			const typeSignal = document.createElement('div');
			typeSignal.style.zIndex = 2000;
			typeSignal.style.border = '3px solid orange';
			typeSignal.style['border-radius'] = '50%'; // Chrome
			typeSignal.style.borderRadius = '50%'; // Mozilla
			typeSignal.style.width = '40px';
			typeSignal.style.height = '40px';
			typeSignal.style['box-sizing'] = 'border-box';
			typeSignal.style.position = 'absolute';
			typeSignal.style.webkitTransition = 'opacity 1s ease-out';
			typeSignal.style.mozTransition = 'opacity 1s ease-out';
			typeSignal.style.transition = 'opacity 1s ease-out';
			typeSignal.style.left = `${x}px`;
			typeSignal.style.top = `${y}px`;
			typeSignal.style.textAlign = 'center';
			typeSignal.style.paddingTop = '7px';
			typeSignal.innerHTML = String.fromCharCode(key);

			const element = body.appendChild(typeSignal);
			setTimeout(function() {
				body.removeChild(element);
			}, 1000);
			setTimeout(function() {
				element.style.opacity = 0;
			}, 50);
		},
		keyGenerator() {
			return config.randomizer.natural({ min: 3, max: 254 });
		},
		targetElement(x, y) {
			return document.elementFromPoint(x, y);
		},
		logger: null,
		randomizer: null
	};

	const typerGremlin = function() {
		if (!config.randomizer) throw new RandomizerRequiredException();

		const keyboardEvent = document.createEventObject ? document.createEventObject() : document.createEvent('Events');
		const eventType = config.randomizer.pick(config.eventTypes);			
		const key = config.keyGenerator();
		const posX = config.randomizer.natural({ max: documentElement.clientWidth - 1 });
		const posY = config.randomizer.natural({ max: documentElement.clientHeight - 1 });
		const targetElement = config.targetElement(posX, posY);

		if (keyboardEvent.initEvent) keyboardEvent.initEvent(eventType, true, true);

		keyboardEvent.keyCode = key;
		keyboardEvent.which = key;
		keyboardEvent.keyCodeVal = key;

		targetElement.dispatchEvent ? targetElement.dispatchEvent(keyboardEvent) : targetElement.fireEvent(`on${eventType}`, keyboardEvent);

		config.showAction && config.showAction(targetElement, posX, posY, key);
		config.logger && config.logger.log && config.logger.log('gremlin', 'typer type', String.fromCharCode(key), 'at', posX, posY);
	};

	configurable(typerGremlin, config);

	return typerGremlin;
};