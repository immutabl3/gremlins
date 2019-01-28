/**
 * The pointer gremlin points anywhere on the visible area of the document
 *
 * By default, the pointer gremlin activity is showed by a red circle.
 *
 *   var pointerGremlin = gremlins.species.pointer();
 *   horde.gremlin(pointerGremlin);
 *
 * The pointer gremlin can be customized as follows:
 *
 *   pointerGremlin.pointerTypes(['pointerover', 'pointerenter']);
 *   pointerGremlin.positionSelector(function() { // find a random pair of coordinates to click });
 *   pointerGremlin.showAction(function(x, y) { // show the gremlin activity on screen });
 *   pointerGremlin.canPoint(function(element) { return true }); // to limit where the gremlin can click
 *   pointerGremlin.maxNbTries(5); // How many times the gremlin must look for a pointable element before quitting
 *   pointerGremlin.logger(loggerObject); // inject a logger
 *   pointerGremlin.randomizer(randomizerObject); // inject a randomizer
 *
 * Example usage:
 *
 *   horde.gremlin(gremlins.species.pointer()
 *     .pointerTypes(['click'])
 *     .positionSelector(function() {
 *        // only click inside the foo element area
 *        var $el = $('#foo');
 *        var offset = $el.offset();
 *        return [
 *          parseInt(Math.random() * $el.outerWidth() + offset.left),
 *          parseInt(Math.random() * $el.outerHeight() + offset.top)
 *        ];
 *     })
 *     .canPoint(function(element) {
 *       // when canPoint returns false, the gremlin will look for another
 *       // element to point on until maxNbTries is reached
 *     })
 *     . showAction(function(x, y) {
 *       // do nothing (hide the gremlin action on screen)
 *     })
 *   );
 */
import configurable from '../utils/configurable';
import RandomizerRequiredException from '../exceptions/randomizerRequired';

const options = {
	bubbles: true, 
	cancelable: true, 
	pointerType: 'touch',
	isPrimary: true
};

export default function pointer() {
	const { document: { body, documentElement } } = global;

	const config = {
		pointerTypes: ['pointerdown', 'pointerdown', 'pointerdown', 'pointerdown', 'pointerover', 'pointerevent', 'pointerdown', 'pointermove', 'pointerup', 'pointercancel', 'pointerout', 'pointerleave'],
		positionSelector() {
			return [
				config.randomizer.natural({ max: documentElement.clientWidth - 1 }),
				config.randomizer.natural({ max: documentElement.clientHeight - 1 })
			];
		},
		showAction(x, y) {
			const clickSignal = document.createElement('div');
			clickSignal.style.zIndex = 2000;
			clickSignal.style.border = '3px solid red';
			clickSignal.style['border-radius'] = '50%'; // Chrome
			clickSignal.style.borderRadius = '50%'; // Mozilla
			clickSignal.style.width = '40px';
			clickSignal.style.height = '40px';
			clickSignal.style['box-sizing'] = 'border-box';
			clickSignal.style.position = 'absolute';
			clickSignal.style.webkitTransition = 'opacity 1s ease-out';
			clickSignal.style.mozTransition = 'opacity 1s ease-out';
			clickSignal.style.transition = 'opacity 1s ease-out';
			clickSignal.style.left = `${x - 20}px`;
			clickSignal.style.top = `${y - 20}px`;
			const element = body.appendChild(clickSignal);
			setTimeout(function() {
				body.removeChild(element);
			}, 1000);
			setTimeout(function() {
				element.style.opacity = 0;
			}, 50);
		},
		canPoint: () => true,
		maxNbTries: 10,
		logger: null,
		randomizer: null
	};

	const clickerGremlin = () => {
		if (!config.randomizer) throw new RandomizerRequiredException();
		let posX;
		let posY;
		let targetElement;
		let nbTries = 0;
		// eslint-disable-next-line no-restricted-syntax
		do {
			const position = config.positionSelector();
			posX = position[0];
			posY = position[1];
			targetElement = document.elementFromPoint(posX, posY);
			nbTries++;
			if (nbTries > config.maxNbTries) return false;
		} while (!targetElement || !config.canPoint(targetElement));

		const pointerType = config.randomizer.pick(config.pointerTypes);
		if (pointerType === 'pointerdown') {
			targetElement.dispatchEvent(new PointerEvent('pointerdown', options));
			targetElement.dispatchEvent(new PointerEvent('pointerup', options));
		} else {
			targetElement.dispatchEvent(new PointerEvent(pointerType, options));
		}

		config.showAction && config.showAction(posX, posY, pointerType);
		config.logger && config.logger.log && config.logger.log('gremlin', 'pointer ', pointerType, 'at', posX, posY);
	};

	configurable(clickerGremlin, config);

	return clickerGremlin;
};