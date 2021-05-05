import { AudioDispatcher, StreamOptions } from './Dispatcher';
import { RTCAudioSource } from 'wrtc/lib/binding';
import { Device, types } from 'mediasoup-client';
import { AudioPlayer } from './Player';
import { Client } from '../Client';
import { Readable } from 'stream';
import Prism from 'prism-media';
import wrtc from 'wrtc';

// @ts-ignore
for (const name in wrtc) global[name] = wrtc[name]; // eslint-disable-line guard-for-in
global.navigator = {
	...global.navigator,
	userAgent:
		'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.85 Safari/537.36',
};

export interface AudioConnectionOptions {
	routerRtpCapabilities?: types.RtpCapabilities;
	sendTransportOptions?: types.TransportOptions;
	recvTransportOptions?: types.TransportOptions;
}

/**
 * The audio connection.
 * @param {Client} client The client.
 * @param {AudioConnectionOptions} [options={}] The options.
 */
export class AudioConnection {
	/**
	 * The client that instantiated the connection.
	 * @type {Client}
	 */
	public readonly client: Client;

	/**
	 * The options.
	 * @type {?AudioConnectionOptions}
	 */
	public options: AudioConnectionOptions | null;

	/**
	 * The device.
	 * @type {Device}
	 */
	public device: Device;

	/**
	 * The player.
	 * @type {?AudioPlayer}
	 */
	public player!: AudioPlayer | null;

	/**
	 * The send transport.
	 * @type {?types.Transport}
	 */
	public sendTransport!: types.Transport | null;

	/**
	 * The audio source.
	 * @type {RTCAudioSource}
	 */
	public audioSource!: RTCAudioSource;

	public constructor(client: Client, options?: AudioConnectionOptions) {
		this.client = client;
		this.options = options ? options : null;
		this.device = new Device();
	}

	/**
	 * Connects to the audio.
	 */
	private async _connectInput(): Promise<void> {
		console.log(this.options?.routerRtpCapabilities, this.options?.sendTransportOptions);
		this.sendTransport = this.device.createSendTransport(
			this.options?.sendTransportOptions as types.TransportOptions,
		);
		this.sendTransport.on('connect', ({ dtlsParameters }, resolve, reject) => {
			this.client.connection.once('@connect-transport-send-done', (data: any) => {
				if ('error' in data) {
					reject(data.error);
				} else {
					resolve();
				}
			});

			this.client.connection.send('@connect-transport', {
				transportId: this.sendTransport?.id,
				direction: 'send',
				dtlsParameters,
			});
		});
		this.sendTransport.on('produce', ({ kind, rtpParameters, appData }, resolve, reject) => {
			this.client.connection.once('@send-track-send-done', (data: any) => {
				if ('error' in data) {
					reject(data.error);
				} else {
					resolve(data);
				}
			});

			this.client.connection.send('@send-track', {
				transportId: this.options?.sendTransportOptions?.id,
				direction: 'send',
				rtpParameters,
				rtpCapabilities: this.device.rtpCapabilities,
				paused: false,
				kind,
				appData,
			});
		});

		this.audioSource = new (RTCAudioSource as any)();

		await this.sendTransport.produce({
			track: (this.audioSource as any).createTrack(),
			appData: { mediaTag: 'cam-audio' },
		});
	}

	/**
	 * Connects to the audio.
	 */
	public async connect(): Promise<void> {
		if (!this.device.loaded)
			await this.device.load({
				routerRtpCapabilities: this.options ? this.options.routerRtpCapabilities ?? {} : {},
			});
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (!this.sendTransport || this.sendTransport.closed) {
			await this._connectInput();

			this.player = new AudioPlayer(this);
		}
	}

	/**
	 * Play an audio resource.
	 * @param {Readable|string} resource The resource to play.
	 * @param {StreamOptions} [options={}] The options.
	 * @returns {AudioDispatcher?} The dispatcher.
	 */
	public play(resource: Readable | string, options: StreamOptions = {}): AudioDispatcher | undefined {
		if (resource instanceof Readable || typeof resource === 'string') {
			const type = options.type || 'unknown';

			if (type === 'unknown') {
				return this.player?.playUnknown(resource, options);
			} else if (type === 'converted') {
				return this.player?.playPCMStream(resource as Readable, options);
			} else if (type === 'opus') {
				return this.player?.playOpusStream(resource as Readable, options);
			} else if (type === 'ogg/opus') {
				if (!(resource instanceof Readable))
					throw new Error('VOICE_PRISM_DEMUXERS_NEED_STREAM');

				return this.player?.playOpusStream(resource.pipe(new Prism.opus.OggDemuxer()), options);
			}

			if (!(resource instanceof Readable)) throw new Error('VOICE_PRISM_DEMUXERS_NEED_STREAM');

			return this.player?.playOpusStream(resource.pipe(new Prism.opus.WebmDemuxer()), options);
		}

		throw new Error('VOICE_PLAY_INTERFACE_BAD_TYPE');
	}

	/**
	 * Disconnects.
	 */
	public disconnect(): void {
		if (this.player) this.player.destroy();
		if (this.sendTransport) this.sendTransport.close();

		this.player = null;
		this.sendTransport = null;
	}

	/**
	 * Speak in the room.
	 * @param {boolean} speaking If the bot should speak.
	 */
	public setSpeaking(speaking: boolean): void {
		this.client.setSpeaking(speaking);
	}
}
