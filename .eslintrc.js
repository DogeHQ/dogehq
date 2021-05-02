module.exports = {
	extends: 'marine/prettier/node',
	root: true,
	rules: {
		'valid-jsdoc': 'error',
		'@typescript-eslint/no-misused-promises': 'off',
		'@typescript-eslint/no-floating-promises': 'off',
		'no-return-await': 'off',
		'@typescript-eslint/prefer-nullish-coalescing': 'off',
	},
};
