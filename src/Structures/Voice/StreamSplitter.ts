import { Transform } from 'stream';

/**
 * The class to transform 20ms audio samples to 10ms audio samples.
 */
export class AudioStreamSplitter extends Transform {
	/**
	 * Transforms an audio buffer.
	 * @param {Buffer} chunk The chunk.
	 * @param {BufferEncoding} encoding The encoding.
	 * @param {Function} done The done function,
	 * @returns {void}
	 */
	public _transform(chunk: Buffer, encoding: BufferEncoding, done: () => void): void {
		if (chunk.byteLength === 3840) {
			const a = Buffer.alloc(1920);
			const b = Buffer.alloc(1920);

			chunk.copy(a, 0, 0, 1920);
			chunk.copy(b, 0, 1920, 1920 * 2);
			this.push(a);
			this.push(b);
		} else {
			this.push(chunk);
		}

		return done();
	}
}
