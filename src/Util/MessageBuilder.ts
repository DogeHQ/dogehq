import { MentionToken, TextToken, LinkToken, EmoteToken, CodeBlockToken } from '@dogehouse/kebab';

/**
 * Convert a string to a mention!
 * @param {string} text The text to convert.
 * @returns {[MentionToken]} The token.
 */
export const toMention = (text: string): MentionToken => {
	return { t: 'mention', v: text };
};

/**
 * Convert a string to a token!
 * @param {string} text The text to convert.
 * @returns {[TextToken]} The token.
 */
export const toString = (text: string): TextToken => {
	return { t: 'text', v: text };
};

/**
 * Convert a string to a link!
 * @param {string} text The text to convert.
 * @returns {[LinkToken]} The token.
 */
export const toLink = (text: string): LinkToken => {
	return { t: 'link', v: text };
};

/**
 * Convert a string to an emote!
 * @param {string} text The text to convert.
 * @returns {[EmoteToken]} The token.
 */
export const toEmote = (text: string): EmoteToken => {
	return { t: 'emote', v: text };
};

/**
 * Convert a string to a codeblock!
 * @param {string} text The text to convert.
 * @returns {[CodeBlockToken]} The token.
 */
export const toCodeBlock = (text: string): CodeBlockToken => {
	return { t: 'block', v: text };
};
