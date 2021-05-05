import { AudioDispatcher, StreamOptions } from './Dispatcher';
import { AudioStreamSplitter } from './StreamSplitter';
import { Readable as ReadableStream } from 'stream';
import { AudioConnection } from './Connection';
import Prism from 'prism-media';

const FFMPEG_ARGS = ['-analyzeduration', '0', '-loglevel', '0', '-f', 's16le', '-ar', '48000', '-ac', '2'];

/**
 * The audio player.
 * @param {AudioConnection} audioConnection The audio connection.
 */
export class AudioPlayer {
	/**
	 * The audio connection.
	 * @type {AudioConnection}
	 */
	public audioConnection: AudioConnection;

	/**
	 * The dispatcher.
	 * @type {?AudioDispatcher}
	 */
	public dispatcher: AudioDispatcher | null;

	public constructor(audioConnection: AudioConnection) {
		this.audioConnection = audioConnection;
		this.dispatcher = null;
	}

	/**
	 * Destroys the dispatcher.
	 */
	public destroyDispatcher(): void {
		if (this.dispatcher) {
			this.dispatcher.destroy();
			this.dispatcher = null;
		}
	}

	/**
	 * An alias of @see {@link AudioPlayer#destroyDispatcher}.
	 */
	public destroy(): void {
		this.destroyDispatcher();
	}

	/**
	 * Creates a dispatcher.
	 * @param {StreamOptions} options The stream options.
	 * @param {Record<string, any>} streams The streams.
	 * @param {any} [broadcast] The broadcast.
	 * @returns {AudioDispatcher} The audio dispatcher.
	 */
	public createDispatcher(
		options: StreamOptions,
		streams: Record<string, any>,
		broadcast?: any,
	): AudioDispatcher {
		this.destroyDispatcher();
		// @ts-ignore
		const dispatcher = (this.dispatcher = new AudioDispatcher(this, options, streams, broadcast)); // eslint-disable-line no-multi-assign

		return dispatcher;
	}

	/**
	 * Plays a PCM stream.
	 * @param {ReadableStream} stream The stream.
	 * @param {StreamOptions} options The stream options.
	 * @param {Record<string, any>} [streams] The streams.
	 * @returns {AudioDispatcher} The dispatcher.
	 */
	public playPCMStream(
		stream: ReadableStream,
		options: StreamOptions,
		streams: Record<string, any> = {},
	): AudioDispatcher {
		this.destroyDispatcher();
		streams.pcm = stream;

		if (options.volume !== false && !streams.input) {
			streams.input = stream;
			streams.volume = new Prism.VolumeTransformer({
				type: 's16le',
				volume: Number(options.volume),
			});
			streams.pcm = stream.pipe(streams.volume);
		}

		const dispatcher = this.createDispatcher(options, streams);

		streams.splitter = new AudioStreamSplitter();
		streams.pcm.pipe(streams.splitter).pipe(dispatcher);

		return dispatcher;
	}

	/**
	 * Plays an unknown track.
	 * @param {any} input The input.
	 * @param {StreamOptions} options The stream options.
	 * @returns {AudioDispatcher} The audio dispatcher.
	 */
	public playUnknown(input: any, options: StreamOptions): AudioDispatcher {
		this.destroyDispatcher();

		const isStream = input instanceof ReadableStream;
		const args = isStream ? FFMPEG_ARGS.slice() : ['-i', input, ...FFMPEG_ARGS];

		if (options.seek) args.unshift('-ss', String(options.seek));

		const ffmpeg = new Prism.FFmpeg({ args });
		const streams: Record<string, any> = { ffmpeg };

		if (isStream) {
			streams.input = input;
			input.pipe(ffmpeg);
		}

		return this.playPCMStream(ffmpeg, options, streams);
	}

	/**
	 * Plays an opus stream.
	 * @param {ReadableStream} stream The opus stream.
	 * @param {StreamOptions} options The stream options.
	 * @param {Record<string, any>} [streams] The streams.
	 * @returns {AudioDispatcher} The dispatcher.
	 */
	public playOpusStream(
		stream: ReadableStream,
		options: StreamOptions,
		streams: Record<string, any> = {},
	): AudioDispatcher {
		this.destroyDispatcher();

		// eslint-disable-next-line no-multi-assign
		const opusDecoder = (streams.opus = new Prism.opus.Decoder({
			channels: 2,
			rate: 48000,
			frameSize: 960,
		}));
		stream.pipe(opusDecoder);

		return this.playPCMStream(opusDecoder, options, streams);
	}
}
