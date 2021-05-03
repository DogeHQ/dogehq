declare module 'audio-loader' {
	const loader: (
		path: string | string[] | Record<string, string | number>,
		options?: Record<string, any>,
		cb?: () => void,
	) => AudioBuffer | null;

	export = loader;
}
