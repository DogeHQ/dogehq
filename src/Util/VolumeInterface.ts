import { TypedEventEmitter } from './TypedEmitter';
import EventEmitter from 'eventemitter3';

export interface VolumeInterfaceEvents {
	volumeChange: (oldVolume: number, newVolume: number) => void;
}

/**
 * An interface class for volume transformation.
 * @extends {EventEmitter}
 * @param {number?} volume The number.
 */
export class VolumeInterface extends ((EventEmitter as any) as new () => TypedEventEmitter<VolumeInterfaceEvents>) {
	/**
	 * The volume.
	 * @type {number}
	 */
	public _volume!: number;

	public constructor({ volume = 1 }: { volume?: number }) {
		super();

		this.setVolume(volume);
	}

	/**
	 * Whether or not the volume of this stream is editable.
	 * @type {boolean}
	 * @readonly
	 */
	public get volumeEditable(): boolean {
		return true;
	}

	/**
	 * The current volume of the stream.
	 * @type {number}
	 * @readonly
	 */
	public get volume(): number {
		return this._volume;
	}

	/**
	 * The current volume if the stream in decibels.
	 * @type {number}
	 * @readonly
	 */
	public get volumeDecibels(): number {
		return Math.log10(this.volume) * 20;
	}

	/**
	 * The current volume of the stream from a logarithmic scale.
	 * @type {number}
	 * @readonly
	 */
	public get volumeLogarithmic(): number {
		return Math.pow(this.volume, 1 / 1.660964);
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
	 * Sets the volume relative to the input stream - i.e. 1 is normal, 0.5 is half, 2 is double.
	 * @param {number} volume The volume that you want to set.
	 */
	public setVolume(volume: number): void {
		this.emit('volumeChange', this._volume, volume);

		this._volume = volume;
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
