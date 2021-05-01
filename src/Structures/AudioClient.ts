import { connect } from '@dogehouse/kebab/lib/audio/mediasoup-client';
import { audioWrap } from '@dogehouse/kebab';
import { Device } from 'mediasoup-client';
import { Client } from './Client';
import load from 'audio-loader';
import * as wrtc from 'wrtc';

// make mediasoup think that this is a browser
// @ts-ignore
for (const name in wrtc) global[name] = wrtc[name]; // eslint-disable-line guard-for-in
global.navigator = {
	...global.navigator,
	userAgent: 'Chrome/74.0.3729.108',
};

export class AudioClient {
	private _audio!: HTMLAudioElement;
	private readonly _audioWrapper: ReturnType<typeof audioWrap>;
	public client: Client;
	public device: Device;
	public isPaused = false;
	public isPlaying = false;

	public constructor(client: Client) {
		this.client = client;
		this.device = new Device();
		this._audioWrapper = audioWrap(client.wrapper.connection);
	}

	private async _makeMicTrack(url: string, loop = false): Promise<MediaStreamTrack> {
		const ctx = new AudioContext();
		const source = ctx.createBufferSource();
		const buffer = await load(url);
		const streamDestination = ctx.createMediaStreamDestination();

		source.buffer = buffer;
		source.connect(streamDestination);
		source.loop = loop;
		source.start();

		const stream = streamDestination.stream;

		return stream.getAudioTracks()[0];
	}

	private _playOutput(track: MediaStreamTrack): void {
		const audio = new Audio();

		this._audio = audio;
		audio.srcObject = new MediaStream([track]);
		audio.play();
	}

	public play(url: string): Promise<void> {
		return new Promise((resolve) => {
			const unsubYjap = this._audioWrapper.subscribe.youJoinedAsPeer(
				async ({ routerRtpCapabilities, recvTransportOptions }) => {
					unsubYjap();

					await connect(
						this.client.wrapper.connection,
						routerRtpCapabilities,
						'output',
						recvTransportOptions,
						this._playOutput,
					)(this.device);

					const unsubYbs = this._audioWrapper.subscribe.youBecameSpeaker(
						async ({ sendTransportOptions }) => {
							unsubYbs();

							await connect(
								this.client.wrapper.connection,
								routerRtpCapabilities,
								'input',
								sendTransportOptions,
								await this._makeMicTrack(url),
							);
						},
					);
				},
			);

			const unsubYjas = this._audioWrapper.subscribe.youJoinedAsSpeaker(
				async ({ routerRtpCapabilities, recvTransportOptions, sendTransportOptions }) => {
					unsubYjas();

					await connect(
						this.client.wrapper.connection,
						routerRtpCapabilities,
						'output',
						recvTransportOptions,
						this._playOutput,
					)(this.device);

					await connect(
						this.client.wrapper.connection,
						routerRtpCapabilities,
						'input',
						sendTransportOptions,
						await this._makeMicTrack(url),
					)(this.device);
				},
			);

			resolve();
		});
	}
}
