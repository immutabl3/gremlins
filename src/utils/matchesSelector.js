const matchesSelector = [
	'webkitMatchesSelector',
	'mozMatchesSelector',
	'msMatchesSelector',
	'oMatchesSelector',
	'matchesSelector',
].find(key => document.createElement('div')[key]);

export default (el, selector) => el[matchesSelector](selector);