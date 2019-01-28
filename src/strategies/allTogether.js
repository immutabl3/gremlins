/**
 * Execute all Gremlins species at once ; repeat 10ms after for 100 times
 *
 *   var allTogetherStrategy = gremlins.strategies.allTogether();
 *   horde.strategy(allTogetherStrategy);
 *
 * The actual attack duration depends on the number of species in the horde.
 */
import executeInSeries from '../utils/executeInSeries';
import configurable from '../utils/configurable';

export default function allTogether() {
	const config = {
		delay: 10, // delay in milliseconds between each wave
		nb: 100 // number of waves to execute (can be overridden in params)
	};

	let stopped;
	let doneCallback;

	const callDone = () => {
		doneCallback && doneCallback();
		doneCallback = undefined;
	};

	const allTogetherStrategy = function(gremlins, params, done) {
		const horde = this;
		const nb = params && params.nb ? params.nb : config.nb;

		stopped = false;
		doneCallback = done; // done can also be called by stop()

		const executeAllGremlins = callback => executeInSeries(gremlins, [], horde, callback);

		const executeNextWave = idx => {
			if (stopped) return;
			if (idx >= nb) return callDone();
			executeAllGremlins(function() {
				setTimeout(function() {
					executeNextWave(idx + 1);
				}, config.delay);
			});
		};

		executeNextWave(0);
	};

	allTogetherStrategy.stop = function() {
		stopped = true;
		setTimeout(callDone, 4);
	};

	configurable(allTogetherStrategy, config);

	return allTogetherStrategy;
};