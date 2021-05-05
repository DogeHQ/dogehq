import { VolumeInterface } from '../../Util/VolumeInterface';
import { AudioPlayer } from './Player';
import { Silence } from '../../Util/Silence';
import { Writable } from 'stream';

const FRAME_LENGTH = 10;

export type StreamType = 'unknown' | 'converted' | 'opus' | 'ogg/opus' | 'webm/opus';

export interface StreamOptions {
	type?: StreamType;
	seek?: number;
	volume?: number | boolean;
	plp?: number;
	fec?: boolean;
	bitrate?: number | 'auto';
	highWaterMark?: number;
}

/**
 * @external WritableStream
 * @see {@link https://nodejs.org/api/stream.html#stream_class_stream_writable}
 */

/**
 * The audio dispatcher.
 * @implements {VolumeInterface}
 * @extends {WritableStream}
 * @param {Record<string, any>} player The player.
 * @param {StreamOptions} options The options.
 * @param {Record<string, any>} [streams] The streams.
 */
export class AudioDispatcher extends Writable implements VolumeInterface {
	/**
	 * @type {number}
	 */
	private readonly _nonce: number;

	/**
	 * @type {Buffer}
	 */
	private readonly _nonceBuffer: Buffer;

	/**
	 * The write callback.
	 * @type {?Function}
	 */
	private _writeCallback: (() => void) | null;

	/**
	 * The paused time.
	 * @type {number}
	 */
	private _pausedTime: number;

	/**
	 * The silent paused time.
	 * @type {number}
	 */
	private _silentPausedTime: number;

	/**
	 * If silenced.
	 * @type {?boolean}
	 */
	private _silence!: null | boolean;

	/**
	 * When the dispatcher was paused.
	 * @type {number}
	 */
	private _pausedSince!: number;

	/**
	 * The player.
	 * @type {Record<string, any>}
	 */
	public player: AudioPlayer;

	/**
	 * The stream options.
	 * @type {Record<string, any>}
	 */
	public streamOptions: Record<string, any>;

	/**
	 * The streams.
	 * @type {Record<string, any>}
	 */
	public streams: Record<string, any>;

	/**
	 * The last speak packet.
	 * @type {?number}
	 */
	public lastSpeakPacket: number | null;

	/**
	 * When the dispatcher was paused.
	 * @type {?number}
	 */
	public pausedSince: number | null;

	/**
	 * The count.
	 * @type {number}
	 */
	public count: number;

	/**
	 * The start time.
	 * @type {number}
	 */
	public startTime!: number;

	/**
	 * The volume.
	 * @type {number}
	 */
	public _volume!: number;

	public constructor(
		player: AudioPlayer,
		{ seek = 0, volume = 1, highWaterMark = 12 }: StreamOptions,
		streams?: Record<string, any>,
	) {
		const streamOptions = { seek, volume, highWaterMark };
		super(streamOptions);

		this.player = player;
		this.streamOptions = streamOptions;
		this.streams = streams ?? {};
		this.streams.silence = new Silence();
		this._nonce = 0;
		this._nonceBuffer = Buffer.alloc(24);
		this.lastSpeakPacket = null;
		this.pausedSince = null;
		this._writeCallback = null;
		this._pausedTime = 0;
		this._silentPausedTime = 0;
		this.count = 0;

		this.on('finish', () => {
			this._cleanup();
			this._setSpeaking(false);
		});

		this.setVolume(Number(volume));

		const streamError = (type?: string, err?: Error): void => {
			if (type && err) {
				err.message = `${type} stream: ${err.message}`;

				this.emit(this.player.dispatcher === this ? 'error' : 'debug', err);
			}

			this.destroy();
		};

		this.on('error', streamError);

		if (this.streams.input) this.streams.input.on('error', (err: Error) => streamError('input', err));
		if (this.streams.ffmpeg) this.streams.ffmpeg.on('error', (err: Error) => streamError('ffmpeg', err));
		if (this.streams.opus) this.streams.opus.on('error', (err: Error) => streamError('opus', err));
		if (this.streams.pcm) this.streams.pcm.on('error', (err: Error) => streamError('pcm', err));
		if (this.streams.splitter)
			this.streams.splitter.on('error', (err: Error) => streamError('splitter', err));
		if (this.streams.volume) this.streams.volume.on('error', (err: Error) => streamError('volume', err));
	}

	/**
	 * Clean up things.
	 */
	private _cleanup(): void {
		if (this.player.dispatcher === this) this.player.dispatcher = null;

		const { streams } = this;

		if (streams.opus) streams.opus.destroy();
		if (streams.pcm) streams.pcm.destroy();
		if (streams.splitter) streams.splitter.destroy();
		if (streams.ffmpeg) streams.ffmpeg.destroy();
	}

	/**
	 * Step.
	 * @param {Function} done The done function.
	 */
	private _step(done: () => void): void {
		this._writeCallback = () => {
			this._writeCallback = null;
			done();
		};

		if (!this.streams.broadcast) {
			const next =
				FRAME_LENGTH +
				this.count * FRAME_LENGTH -
				(Date.now() - this.startTime - this._pausedTime);

			setTimeout(() => {
				if ((!this.pausedSince || this._silence) && this._writeCallback) this._writeCallback();
			}, next);
		}

		this.count++;
	}

	/**
	 * Final.
	 * @param {Function} callback The callback.
	 */
	public _final(callback: () => void): void {
		this._writeCallback = null;

		callback();
	}

	/**
	 * Sets speaking.
	 * @param {boolean} value If speak.
	 */
	private _setSpeaking(value: boolean): void {
		if (typeof this.player.audioConnection !== 'undefined') this.player.audioConnection.setSpeaking(value);

		this.emit('speaking', value);
	}

	/**
	 * Plays a chunk.
	 * @param {Buffer} chunk The chunk.
	 */
	private _playChunk(chunk: Buffer): void {
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (this.player.dispatcher !== this || !this.player.audioConnection.audioSource) return;
		if (!this.lastSpeakPacket || Date.now() - this.lastSpeakPacket > 5000) {
			this._setSpeaking(true);
			this.lastSpeakPacket = Date.now();
		}

		(this.player.audioConnection as any).audioSource.onData({
			samples: chunk,
			sampleRate: 48000,
			bitsPerSample: 16,
			channelCount: 2,
			numberOfFrames: 48000 / 100,
		});
	}

	/**
	 * Whether or not playback is paused.
	 * @type {boolean}
	 */
	public get paused(): Readonly<boolean> {
		return Boolean(this.pausedSince);
	}

	/**
	 * Total time that this dispatcher has been paused in milliseconds.
	 * @type {number}
	 */
	public get pausedTime(): Readonly<number> {
		return (
			this._silentPausedTime +
			this._pausedTime +
			(this.paused ? Date.now() - (this.pausedSince ?? 0) : 0)
		);
	}

	/**
	 * The time that the dispatcher has actually been playing audio for.
	 * @type {number}
	 */
	public get streamTime(): Readonly<number> {
		return this.count * FRAME_LENGTH;
	}

	/**
	 * The time that the dispatcher has been playing audio for, including skips and pauses.
	 * @type {number}
	 */
	public get totalStreamTime(): Readonly<number> {
		return Date.now() - this.startTime;
	}

	/**
	 * If the volume is editable.
	 * @type {boolean}
	 */
	public get volumeEditable(): boolean {
		return Boolean(this.streams.volume);
	}

	/**
	 * The volume.
	 * @type {number}
	 */
	public get volume(): number {
		return this.streams.volume ? this.streams.volume.volume : 1;
	}

	/**
	 * The current volume if the stream in decibels.
	 * @type {number}
	 */
	public get volumeDecibels(): Readonly<number> {
		return Math.log10(this.volume) * 20;
	}

	/**
	 * The current volume of the stream from a logarithmic scale.
	 * @type {number}
	 */
	public get volumeLogarithmic(): Readonly<number> {
		return Math.pow(this.volume, 1 / 1.660964);
	}

	/**
	 * Write.
	 * @param {Buffer} chunk The chunk.
	 * @param {BufferEncoding} enc The encoding.
	 * @param {Function} done The done function.
	 */
	public _write(chunk: Buffer, enc: BufferEncoding, done: () => void): void {
		// eslint-disable-line
		if (!this.startTime) {
			this.emit('start');

			this.startTime = Date.now();
		}

		this._playChunk(chunk);
		this._step(done);
	}

	/**
	 * Pauses playback.
	 * @param {boolean} [silence=false] Wheter to play silence while paused to prevent audio glitches.
	 */
	public pause(silence = false): void {
		if (this.paused) return;
		if (this.streams.splitter) this.streams.splitter.unpipe(this);
		if (silence) {
			this.streams.silence.pipe(this);
			this._silence = true;
		} else {
			this._setSpeaking(false);
		}

		this._pausedSince = Date.now();
	}

	/**
	 * Resumes playback.
	 */
	public resume(): void {
		if (!this.pausedSince) return;

		this.streams.silence.unpipe(this);

		if (this.streams.splitter) this.streams.splitter.pipe(this);
		if (this._silence) {
			this._silentPausedTime += Date.now() - this.pausedSince;
			this._silence = false;
		} else {
			this._pausedTime += Date.now() - this.pausedSince;
		}

		this.pausedSince = null;

		if (typeof this._writeCallback === 'function') this._writeCallback();
	}

	/**
	 * Sets the volume.
	 * @param {number} value The volume.
	 * @returns {boolean} If it was set.
	 */
	public setVolume(value: number): boolean {
		if (!this.streams.volume) return false;

		this.emit('volumeChange', this.volume, value);
		this.streams.volume.setVolume(value);
		this._volume = value;

		return true;
	}

	/**
	 * Applies a volume.
	 * @param {Buffer} buffer The buffer.
	 * @param {number} volume The volume.
	 * @returns {Buffer} The buffer.
	 */
	public applyVolume(buffer: Buffer, volume: number): Buffer {
		volume = volume || this._volume;
		if (volume === 1) return buffer;

		const out = Buffer.alloc(buffer.length);

		for (let i = 0; i < buffer.length; i += 2) {
			if (i >= buffer.length - 1) break;

			const uint = Math.min(32767, Math.max(-32767, Math.floor(volume * buffer.readInt16LE(i))));

			out.writeInt16LE(uint, i);
		}

		return out;
	}

	/**
	 * Sets the volume in decibels.
	 * @param {number} db The decibels.
	 */
	public setVolumeDecibels(db: number): void {
		this.setVolume(Math.pow(10, db / 20));
	}

	/**
	 * Sets the volume so that a percieved value of 0.5 is half the percieved volume etc.
	 * @param {number} value The value for the volume.
	 */
	public setVolumeLogarithmic(value: number): void {
		this.setVolume(Math.pow(value, 1.660964));
	}
}
