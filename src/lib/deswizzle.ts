// TypeScript implementation of https://github.com/Aclios/pyswizzle/blob/main/src/pyswizzle/pyswizzle.py
type Grid = Uint8Array[][];

export class BytesDeswizzle {
	private data: Uint8Array;
	private deswizzleDataList: [number, 0 | 1][];
	private readSize: number;
	private readPerTileCount: number;
	private tileCount: number;
	private tilePerWidth: number;
	private dataReadIdx: number;

	constructor(data: Uint8Array, imSize: [number, number], blockSize: [number, number], bytesPerBlock: number, swizzleMode: number) {
		this.data = data;
		const datasize = data.length;
		const [imWidth, imHeight] = imSize;
		const [blockWidth, blockHeight] = blockSize;

		const expectedDataSize = Math.floor((imWidth * imHeight) / (blockWidth * blockHeight)) * bytesPerBlock;

		if (expectedDataSize !== datasize)
			throw new Error(
				`Error: Invalid data size.\nExpected datasize (according to image and format specifications): ${expectedDataSize}\nActual datasize: ${datasize}`,
			);

		const tileDatasize = 512 * 2 ** swizzleMode;
		const tileWidth = Math.floor(64 / bytesPerBlock) * blockWidth;
		const tileHeight = 8 * blockHeight * 2 ** swizzleMode;
		this.deswizzleDataList = [
			[2, 0],
			[2, 1],
			[4, 0],
			[2, 1],
			[2 ** swizzleMode, 0],
		];
		this.readSize = 16;
		this.readPerTileCount = 32 * 2 ** swizzleMode;

		if (datasize % tileDatasize !== 0)
			throw new Error(
				`Error: Invalid data size. The data size should be a multiple of ${tileDatasize}, while the given datasize is ${datasize}. Height and/or width padding may be required in the original image.`,
			);

		this.tileCount = Math.floor(datasize / tileDatasize);

		if (imWidth % tileWidth !== 0)
			throw new Error(`Error: with the current parameters, image width should be a multiple of ${tileWidth}, but the given width is ${imWidth}`);
		if (imHeight % tileHeight !== 0)
			throw new Error(`Error: with the current parameters, image height should be a multiple of ${tileHeight}, but the given height is ${imHeight}`);

		this.tilePerWidth = Math.floor(imWidth / tileWidth);
		this.dataReadIdx = 0;
	}

	private getTileData(): Grid[] {
		const arrayList: Grid[] = [];
		for (let i = 0; i < this.readPerTileCount; i++) {
			arrayList.push([[this.data.slice(this.dataReadIdx, this.dataReadIdx + this.readSize)]]);
			this.dataReadIdx += this.readSize;
		}
		return arrayList;
	}

	private concatArrays(arrayList: Grid[], sectionNumber: number, axis: 0 | 1): Grid[] {
		const newArrayList: Grid[] = [];
		let idx = 0;

		for (let i = 0; i < Math.floor(arrayList.length / sectionNumber); i++) {
			const slice = arrayList.slice(idx, idx + sectionNumber);
			let newGrid: Grid;

			if (axis === 0) {
				// np.concatenate(..., axis=0)
				newGrid = [];
				for (const grid of slice) {
					newGrid.push(...grid);
				}
			} else {
				// np.concatenate(..., axis=1)
				newGrid = [];
				for (let r = 0; r < slice[0].length; r++) {
					const newRow: Uint8Array[] = [];
					for (const grid of slice) {
						newRow.push(...grid[r]);
					}
					newGrid.push(newRow);
				}
			}

			newArrayList.push(newGrid);
			idx += sectionNumber;
		}

		return newArrayList;
	}

	private deswizzleTile(): Grid {
		let arrayList = this.getTileData();
		for (const deswizzleData of this.deswizzleDataList) {
			arrayList = this.concatArrays(arrayList, deswizzleData[0], deswizzleData[1]);
		}
		return arrayList[0];
	}

	public deswizzle(): Uint8Array {
		const tileList: Grid[] = [];
		for (let i = 0; i < this.tileCount; i++) {
			tileList.push(this.deswizzleTile());
		}

		const tileListWidthConcat = this.concatArrays(tileList, this.tilePerWidth, 1);
		const deswizzledGrid = this.concatArrays(tileListWidthConcat, tileListWidthConcat.length, 0)[0];

		// tobytes()
		const deswizzledData = new Uint8Array(this.data.length);
		let offset = 0;

		for (const row of deswizzledGrid) {
			for (const chunk of row) {
				deswizzledData.set(chunk, offset);
				offset += chunk.length;
			}
		}

		if (deswizzledData.length !== this.data.length) {
			throw new Error(
				`An unknown error occurred while deswizzling bytes: output data length is (somehow) different than input data length. Input data: ${this.data.length}, Output data: ${deswizzledData.length}`,
			);
		}

		return deswizzledData;
	}
}
