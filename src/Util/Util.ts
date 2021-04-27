const isoRegex = /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/;

/**
 * Checks if the date is ISO formatted.
 * @param {string} str - The date.
 * @returns {boolean} If its ISO formatted.
 */
export const isIso = (str: string): boolean => isoRegex.test(str);
