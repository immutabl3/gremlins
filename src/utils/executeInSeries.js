/**
 * Execute a list of functions one after the other.
 *
 * Functions can be asynchronous or asynchronous, they will always be
 * executed in the order of the list.
 *
 * @param {Function[]} callbacks - The functions to execute
 * @param {Array} args - The arguments passed to each function
 * @param {Object|null} context - The object the functions must be bound to
 * @param {Function} done - The final callback to execute once all functions are executed
 */
export default function executeInSeries(cbs, args, context, done) {
	const nbArguments = args.length;
	const callbacks = cbs.slice(0); // clone the array to avoid modifying the original

	const iterator = function(callbacks, args) {
		if (!callbacks.length) return done ? done() : true;

		const callback = callbacks.shift();
		callback.apply(context, args);

		// Is the callback synchronous ?
		if (callback.length === nbArguments) {
			iterator(callbacks, args, done);
		}
	};

	args.push(() => iterator(callbacks, args, done));

	iterator(callbacks, args, done);
};