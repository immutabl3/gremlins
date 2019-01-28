import isFunction from 'lodash/isFunction';

export default function inject(services, objects) {
	for (let idx = 0, count = objects.length; idx < count; idx++) {
		for (const name in services) {
			if (isFunction(objects[idx][name]) && !objects[idx][name]()) {
				objects[idx][name](services[name]);
			}
		}
	}
};