// Based on https://github.com/PretendoNetwork/mii-js/
// Updated to bit-buffer v0.3.0

import { BitStream } from "bit-buffer";

export default class ExtendedBitStream extends BitStream {
	constructor(buffer: Buffer) {
		super(buffer, buffer.byteOffset, buffer.byteLength);
	}

	public swapEndian(): void {
		this.bigEndian = !this.bigEndian;
	}

	public alignByte(): void {
		const nextClosestByteIndex = 8 * Math.ceil(this.index / 8);
		const bitDistance = nextClosestByteIndex - this.index;
		this.skipBits(bitDistance);
	}

	public skipBits(bitCount: number): void {
		this.index += bitCount;
	}

	public skipBit(): void {
		this.skipBits(1);
	}

	public skipInt16(): void {
		// Skipping a uint16 is the same as skipping 2 uint8's
		this.skipBits(16);
	}

	public readBit(): number {
		return this.readBits(1, false);
	}

	public readBuffer(length: number): Buffer {
		return Buffer.from(super.readBytes(length));
	}

	public readUTF16String(length: number): string {
		return this.readBuffer(length).toString("utf16le").replace(/\0.*$/, "");
	}
}
