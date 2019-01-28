/**
 * For each species, execute the gremlin 200 times, separated by a 10ms delay
 *
 *   var bySpeciesStrategy = gremlins.strategies.bySpecies();
 *   horde.strategy(bySpeciesStrategy);
 *
 * The actual attack duration depends on the number of species in the horde.
 *
 * The bySpecies strategy can be customized as follows:
 *
 *   bySpeciesStrategy.delay(10); // delay in milliseconds between each gremlin action
 *   bySpeciesStrategy.nb(200);   // number times to execute each gremlin
 *
 * Example usage:
 *
 *   horde
 *     .gremlin(gremlins.species.clicker())
 *     .gremlin(gremlins.species.formFiller())
 *     .strategy(gremlins.strategies.bySpecies()
 *       .delay(1000) // one action per second
 *       .nb(10)      // each gremlin will act 10 times
 *     )
 *     .unleash();
 *
 *   // t     clickerGremlin clicked
 *   // t+1s  clickerGremlin clicked
 *   // ...
 *   // t+9s  clickerGremlin clicked
 *   // t+10s formFillerGremlin filled
 *   // t+11s formFillerGremlin filled
 *   // ...
 *   // t+19s formFillerGremlin filled
 *   // t+20s, end of the attack
 */
import executeInSeries from '../utils/executeInSeries';
import configurable from '../utils/configurable';

export default function bySpecies() {
	const config = {
		delay: 10, // delay in milliseconds between each attack
		nb: 200 // number of attacks to execute (can be overridden in params)
	};

	let stopped;
	let doneCallback;

	const callDone = () => {
		doneCallback && doneCallback();
		doneCallback = undefined;
	};

	const bySpeciesStrategy = function(arr, params, done) {
		const horde = this;
		const nb = params && params.nb ? params.nb : config.nb;
		const gremlins = arr.slice(0);
	
		stopped = false;
		doneCallback = done; // done can also be called by stop()

		const executeNext = function(gremlin, idx, callback) {
			if (stopped) return;
			if (idx >= nb) return callback();
			executeInSeries([gremlin], [], horde, function() {
				setTimeout(function() {
					executeNext(gremlin, idx + 1, callback);
				}, config.delay);
			});
		};

		const executeNextGremlin = function() {
			if (stopped) return;
			if (gremlins.length === 0) return callDone();
			executeNext(gremlins.shift(), 0, executeNextGremlin);
		};

		executeNextGremlin();
	};

	bySpeciesStrategy.stop = function() {
		stopped = true;
		setTimeout(callDone, 4);
	};

	configurable(bySpeciesStrategy, config);

	return bySpeciesStrategy;
};