/**
 * The fps mogwai logs the number of frames per seconds (FPS) of the browser
 * 
 * The normal (and maximal) FPS rate is 60. It decreases when the browser is
 * busy refreshing the layout, or executing JavaScript.
 *
 * This mogwai logs with the error level once the FPS rate drops below 10.
 *
 *   var fpsMogwai = gremlins.mogwais.fps();
 *   horde.mogwai(fpsMogwai);
 *
 * The fps mogwai can be customized as follows:
 *
 *   fpsMogwai.delay(500); // the interval for FPS measurements
 *   fpsMogwai.levelSelector(function(fps) { // select logging level according to fps value });
 *   fpsMogwai.logger(loggerObject); // inject a logger
 *
 * Example usage:
 *
 *   horde.mogwai(gremlins.mogwais.fps()
 *     .delay(250)
 *     .levelSelector(function(fps) {
 *       if (fps < 5) return 'error';
 *       if (fps < 10) return 'warn';
 *       return 'log';
 *     })
 *   );
 */
import configurable from '../utils/configurable';
import LoggerRequiredException from '../exceptions/loggerRequired';

export default function fpsMogwai() {
	const config = {
		delay: 500, // how often should the fps be measured
		levelSelector(fps) {
			if (fps < 10) return 'error';
			if (fps < 20) return 'warn';
			return 'log';
		},
		logger: null
	};

	let initialTime = -Infinity; // force initial measure
	let enabled;

	const measureFPS = function() {
		let lastTime;
		const measure = time => {
			const fps = (time - lastTime < 16) ? 60 : 1000 / (time - lastTime);
			const level = config.levelSelector(fps);
			config.logger[level]('mogwai ', 'fps       ', fps);
		};
		const init = time => {
			lastTime = time;
			requestAnimationFrame(measure);
		};
		requestAnimationFrame(init);
	};

	const loop = function(time) {
		if ((time - initialTime) > config.delay) {
			measureFPS(time);
			initialTime = time;
		}
		if (!enabled) return;
		requestAnimationFrame(loop);
	};

	const fpsMogwai = function() {
		if (!config.logger) throw new LoggerRequiredException();
		enabled = true;
		requestAnimationFrame(loop);
	};

	fpsMogwai.cleanUp = function() {
		enabled = false;
		return fpsMogwai;
	};

	configurable(fpsMogwai, config);

	return fpsMogwai;
};