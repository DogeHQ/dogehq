const isoRegex = /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/;

/**
 * Checks if the date is ISO formatted.
 * @param {string} str - The date.
 * @returns {boolean} If its ISO formatted.
 */
export const isIso = (str: string): boolean => isoRegex.test(str);

/**
 * Apply the given properties to the class.
 * @param {string[]} props The properties.
 * @param {Function} structure The class.
 * @param {Function} c The class.
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export const applyToClass = (props: string[], structure: Function, c: Function): void => {
	for (const prop of props) {
		Object.defineProperty(
			structure.prototype,
			prop,
			Object.getOwnPropertyDescriptor(c.prototype, prop) as PropertyDescriptor,
		);
	}
};
