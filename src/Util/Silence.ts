import { Readable } from 'stream';

/**
 * The silence class.
 * @extends {Readable}
 */
export class Silence extends Readable {
	/**
	 * The silence frame.
	 * @type {Buffer}
	 */
	public get silenceFrame(): Buffer {
		return Buffer.from([0xf8, 0xff, 0xfe]);
	}

	/**
	 * Reads stuff.
	 */
	public _read(): void {
		this.push(this.silenceFrame);
	}
}
