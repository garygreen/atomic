function extend(obj1, obj2) {
	var extended = {};

	var merge = function (obj) {
		for (var prop in obj) {
			if (typeof obj[prop] === 'object') {
				extended[prop] = extend(extended[prop], obj[prop]);
			} else {
				extended[prop] = obj[prop];
			}
		}
	};

	merge(obj1);
	merge(obj2);

	return extended;
}

export default extend