export function eventPromise(element, resolveEvent = 'load', rejectEvent = 'error') {
	return new Promise((resolve, reject) => {
		element.addEventListener(resolveEvent, () => resolve(element));
		element.addEventListener(rejectEvent, reject);
	});
}