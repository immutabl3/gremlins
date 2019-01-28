/**
 * The alert mogwai answers calls to alert()
 *
 * The alert mogwai overrides global.alert, global.confirm, and global.prompt
 * to avoid stopping the stress test with blocking JavaScript calls. Instead
 * of displaying a dialog, these methods are simply replaced by a write in the
 * logger.
 *
 *   var alertMogwai = gremlins.mogwais.alert();
 *   horde.mogwai(alertMogwai);
 *
 * The alert mogwai can be customized as follows:
 *
 *   alertMogwai.watchEvents(['alert', 'confirm', 'prompt']); // select the events to catch
 *   alertMogwai.confirmResponse(function() { // what a call to confirm() should return });
 *   alertMogwai.promptResponse(function() { // what a call to prompt() should return });
 *   alertMogwai.logger(loggerObject); // inject a logger
 *   alertMogwai.randomizer(randomizerObject); // inject a randomizer
 *
 * Example usage:
 *
 *   horde.mogwai(gremlins.mogwais.alert()
 *     .watchEvents(['prompt'])
 *     .promptResponse(function() { return 'I typed garbage'; })
 *   );
 */
import configurable from '../utils/configurable';
import LoggerRequiredException from '../exceptions/loggerRequired';

export default function alertMogwai() {
	const config = {
		watchEvents: ['alert', 'confirm', 'prompt'],
		confirmResponse: () => config.randomizer.bool(),
		promptResponse: () => config.randomizer.sentence(),
		logger: null,
		randomizer: null
	};

	const {
		alert,
		confirm,
		prompt,
	} = global;

	const alertMogwai = function() {
		if (!config.logger) throw new LoggerRequiredException();

		if (config.watchEvents.includes('alert')) {
			global.alert = function(msg) {
				config.logger.warn('mogwai ', 'alert ', msg, 'alert');
			};
		}
		if (config.watchEvents.includes('confirm')) {
			global.confirm = function(msg) {
				config.confirmResponse();
				config.logger.warn('mogwai ', 'alert ', msg, 'confirm');
			};
		}
		if (config.watchEvents.includes('prompt')) {
			global.prompt = function(msg) {
				config.promptResponse();
				config.logger.warn('mogwai ', 'alert ', msg, 'prompt');
			};
		}
	};

	alertMogwai.cleanUp = function() {
		global.alert = alert;
		global.confirm = confirm;
		global.prompt = prompt;
		return alertMogwai;
	};

	configurable(alertMogwai, config);

	return alertMogwai;
};