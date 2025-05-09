// Stolen and edited from https://github.com/PretendoNetwork/mii-js/

import assert from "assert";
import ExtendedBitStream from "./extended-bit-stream";
import Util from "./util";

const STUDIO_RENDER_URL_BASE = "https://studio.mii.nintendo.com/miis/image.png";

const STUDIO_RENDER_DEFAULTS = {
	type: "face",
	expression: "normal",
	width: 96,
	bgColor: "FFFFFF00",
	clothesColor: "default",
	cameraXRotate: 0,
	cameraYRotate: 0,
	cameraZRotate: 0,
	characterXRotate: 0,
	characterYRotate: 0,
	characterZRotate: 0,
	lightXDirection: 0,
	lightYDirection: 0,
	lightZDirection: 0,
	lightDirectionMode: "none",
	instanceCount: 1,
	instanceRotationMode: "model",
};

const STUDIO_RENDER_TYPES = ["face", "face_only", "all_body"];

const STUDIO_RENDER_EXPRESSIONS = [
	"normal",
	"smile",
	"anger",
	"sorrow",
	"surprise",
	"blink",
	"normal_open_mouth",
	"smile_open_mouth",
	"anger_open_mouth",
	"surprise_open_mouth",
	"sorrow_open_mouth",
	"blink_open_mouth",
	"wink_left",
	"wink_right",
	"wink_left_open_mouth",
	"wink_right_open_mouth",
	"like_wink_left",
	"like_wink_right",
	"frustrated",
];

const STUDIO_RENDER_CLOTHES_COLORS = [
	"default",
	"red",
	"orange",
	"yellow",
	"yellowgreen",
	"green",
	"blue",
	"skyblue",
	"pink",
	"purple",
	"brown",
	"white",
	"black",
];

const STUDIO_RENDER_LIGHT_DIRECTION_MODS = ["none", "zerox", "flipx", "camera", "offset", "set"];

const STUDIO_RENDER_INSTANCE_ROTATION_MODES = ["model", "camera", "both"];

const STUDIO_BG_COLOR_REGEX = /^[0-9A-F]{8}$/; // Mii Studio does not allow lowercase

export default class Mii {
	public bitStream: ExtendedBitStream;

	// Mii data
	// can be sure that these are all initialized in decode()

	public version!: number;
	public allowCopying!: boolean;
	public profanityFlag!: boolean;
	public regionLock!: number;
	public characterSet!: number;
	public pageIndex!: number;
	public slotIndex!: number;
	public unknown1!: number;
	public deviceOrigin!: number;
	public systemId!: Buffer;
	public normalMii!: boolean;
	public dsMii!: boolean;
	public nonUserMii!: boolean;
	public isValid!: boolean;
	public creationTime!: number;
	public consoleMAC!: Buffer;
	public gender!: number;
	public birthMonth!: number;
	public birthDay!: number;
	public favoriteColor!: number;
	public favorite!: boolean;
	public miiName!: string;
	public height!: number;
	public build!: number;
	public disableSharing!: boolean;
	public faceType!: number;
	public skinColor!: number;
	public wrinklesType!: number;
	public makeupType!: number;
	public hairType!: number;
	public hairColor!: number;
	public flipHair!: boolean;
	public eyeType!: number;
	public eyeColor!: number;
	public eyeScale!: number;
	public eyeVerticalStretch!: number;
	public eyeRotation!: number;
	public eyeSpacing!: number;
	public eyeYPosition!: number;
	public eyebrowType!: number;
	public eyebrowColor!: number;
	public eyebrowScale!: number;
	public eyebrowVerticalStretch!: number;
	public eyebrowRotation!: number;
	public eyebrowSpacing!: number;
	public eyebrowYPosition!: number;
	public noseType!: number;
	public noseScale!: number;
	public noseYPosition!: number;
	public mouthType!: number;
	public mouthColor!: number;
	public mouthScale!: number;
	public mouthHorizontalStretch!: number;
	public mouthYPosition!: number;
	public mustacheType!: number;
	public unknown2!: number;
	public beardType!: number;
	public facialHairColor!: number;
	public mustacheScale!: number;
	public mustacheYPosition!: number;
	public glassesType!: number;
	public glassesColor!: number;
	public glassesScale!: number;
	public glassesYPosition!: number;
	public moleEnabled!: boolean;
	public moleScale!: number;
	public moleXPosition!: number;
	public moleYPosition!: number;
	public creatorName!: string;
	public checksum!: number;

	constructor(buffer: Buffer) {
		this.bitStream = new ExtendedBitStream(buffer);
		this.decode();
	}

	public validate(): void {
		// Size check
		assert.equal(this.bitStream.length / 8, 0x60, `Invalid Mii data size. Got ${this.bitStream.length / 8}, expected 96`);

		// Value range and type checks
		assert.ok(this.version === 0 || this.version === 3, `Invalid Mii version. Got ${this.version}, expected 0 or 3`);
		assert.equal(typeof this.allowCopying, "boolean", `Invalid Mii allow copying. Got ${this.allowCopying}, expected true or false`);
		assert.equal(typeof this.profanityFlag, "boolean", `Invalid Mii profanity flag. Got ${this.profanityFlag}, expected true or false`);
		assert.ok(Util.inRange(this.regionLock, Util.range(4)), `Invalid Mii region lock. Got ${this.regionLock}, expected 0-3`);
		assert.ok(Util.inRange(this.characterSet, Util.range(4)), `Invalid Mii region lock. Got ${this.characterSet}, expected 0-3`);
		assert.ok(Util.inRange(this.pageIndex, Util.range(10)), `Invalid Mii page index. Got ${this.pageIndex}, expected 0-9`);
		assert.ok(Util.inRange(this.slotIndex, Util.range(10)), `Invalid Mii slot index. Got ${this.slotIndex}, expected 0-9`);
		assert.equal(this.unknown1, 0, `Invalid Mii unknown1. Got ${this.unknown1}, expected 0`);
		assert.ok(Util.inRange(this.deviceOrigin, Util.range(1, 5)), `Invalid Mii device origin. Got ${this.deviceOrigin}, expected 1-4`);
		assert.equal(this.systemId.length, 8, `Invalid Mii system ID size. Got ${this.systemId.length}, system IDs must be 8 bytes long`);
		assert.equal(typeof this.normalMii, "boolean", `Invalid normal Mii flag. Got ${this.normalMii}, expected true or false`);
		assert.equal(typeof this.dsMii, "boolean", `Invalid DS Mii flag. Got ${this.dsMii}, expected true or false`);
		assert.equal(typeof this.nonUserMii, "boolean", `Invalid non-user Mii flag. Got ${this.nonUserMii}, expected true or false`);
		assert.equal(typeof this.isValid, "boolean", `Invalid Mii valid flag. Got ${this.isValid}, expected true or false`);
		assert.ok(this.creationTime < 268435456, `Invalid Mii creation time. Got ${this.creationTime}, max value for 28 bit integer is 268,435,456`);
		assert.equal(
			this.consoleMAC.length,
			6,
			`Invalid Mii console MAC address size. Got ${this.consoleMAC.length}, console MAC addresses must be 6 bytes long`
		);
		assert.ok(Util.inRange(this.gender, Util.range(2)), `Invalid Mii gender. Got ${this.gender}, expected 0 or 1`);
		assert.ok(Util.inRange(this.birthMonth, Util.range(13)), `Invalid Mii birth month. Got ${this.birthMonth}, expected 0-12`);
		assert.ok(Util.inRange(this.birthDay, Util.range(32)), `Invalid Mii birth day. Got ${this.birthDay}, expected 0-31`);
		assert.ok(Util.inRange(this.favoriteColor, Util.range(12)), `Invalid Mii favorite color. Got ${this.favoriteColor}, expected 0-11`);
		assert.equal(typeof this.favorite, "boolean", `Invalid favorite Mii flag. Got ${this.favorite}, expected true or false`);
		assert.ok(Buffer.from(this.miiName, "utf16le").length <= 0x14, `Invalid Mii name. Got ${this.miiName}, name may only be up to 10 characters`);
		assert.ok(Util.inRange(this.height, Util.range(128)), `Invalid Mii height. Got ${this.height}, expected 0-127`);
		assert.ok(Util.inRange(this.build, Util.range(128)), `Invalid Mii build. Got ${this.build}, expected 0-127`);
		assert.equal(typeof this.disableSharing, "boolean", `Invalid disable sharing Mii flag. Got ${this.disableSharing}, expected true or false`);
		assert.ok(Util.inRange(this.faceType, Util.range(12)), `Invalid Mii face type. Got ${this.faceType}, expected 0-11`);
		assert.ok(Util.inRange(this.skinColor, Util.range(7)), `Invalid Mii skin color. Got ${this.skinColor}, expected 0-6`);
		assert.ok(Util.inRange(this.wrinklesType, Util.range(12)), `Invalid Mii wrinkles type. Got ${this.wrinklesType}, expected 0-11`);
		assert.ok(Util.inRange(this.makeupType, Util.range(12)), `Invalid Mii makeup type. Got ${this.makeupType}, expected 0-11`);
		assert.ok(Util.inRange(this.hairType, Util.range(132)), `Invalid Mii hair type. Got ${this.hairType}, expected 0-131`);
		// assert.ok(Util.inRange(this.hairColor, Util.range(8)), `Invalid Mii hair color. Got ${this.hairColor}, expected 0-7`);
		assert.equal(typeof this.flipHair, "boolean", `Invalid flip hair flag. Got ${this.flipHair}, expected true or false`);
		assert.ok(Util.inRange(this.eyeType, Util.range(60)), `Invalid Mii eye type. Got ${this.eyeType}, expected 0-59`);
		assert.ok(Util.inRange(this.eyeColor, Util.range(6)), `Invalid Mii eye color. Got ${this.eyeColor}, expected 0-5`);
		assert.ok(Util.inRange(this.eyeScale, Util.range(8)), `Invalid Mii eye scale. Got ${this.eyeScale}, expected 0-7`);
		assert.ok(Util.inRange(this.eyeVerticalStretch, Util.range(7)), `Invalid Mii eye vertical stretch. Got ${this.eyeVerticalStretch}, expected 0-6`);
		assert.ok(Util.inRange(this.eyeRotation, Util.range(8)), `Invalid Mii eye rotation. Got ${this.eyeRotation}, expected 0-7`);
		assert.ok(Util.inRange(this.eyeSpacing, Util.range(13)), `Invalid Mii eye spacing. Got ${this.eyeSpacing}, expected 0-12`);
		assert.ok(Util.inRange(this.eyeYPosition, Util.range(19)), `Invalid Mii eye Y position. Got ${this.eyeYPosition}, expected 0-18`);
		assert.ok(Util.inRange(this.eyebrowType, Util.range(25)), `Invalid Mii eyebrow type. Got ${this.eyebrowType}, expected 0-24`);
		// assert.ok(Util.inRange(this.eyebrowColor, Util.range(8)), `Invalid Mii eyebrow color. Got ${this.eyebrowColor}, expected 0-7`);
		assert.ok(Util.inRange(this.eyebrowScale, Util.range(9)), `Invalid Mii eyebrow scale. Got ${this.eyebrowScale}, expected 0-8`);
		assert.ok(
			Util.inRange(this.eyebrowVerticalStretch, Util.range(7)),
			`Invalid Mii eyebrow vertical stretch. Got ${this.eyebrowVerticalStretch}, expected 0-6`
		);
		assert.ok(Util.inRange(this.eyebrowRotation, Util.range(12)), `Invalid Mii eyebrow rotation. Got ${this.eyebrowRotation}, expected 0-11`);
		assert.ok(Util.inRange(this.eyebrowSpacing, Util.range(13)), `Invalid Mii eyebrow spacing. Got ${this.eyebrowSpacing}, expected 0-12`);
		assert.ok(Util.inRange(this.eyebrowYPosition, Util.range(3, 19)), `Invalid Mii eyebrow Y position. Got ${this.eyebrowYPosition}, expected 3-18`);
		assert.ok(Util.inRange(this.noseType, Util.range(18)), `Invalid Mii nose type. Got ${this.noseType}, expected 0-17`);
		assert.ok(Util.inRange(this.noseScale, Util.range(9)), `Invalid Mii nose scale. Got ${this.noseScale}, expected 0-8`);
		assert.ok(Util.inRange(this.noseYPosition, Util.range(19)), `Invalid Mii nose Y position. Got ${this.noseYPosition}, expected 0-18`);
		assert.ok(Util.inRange(this.mouthType, Util.range(36)), `Invalid Mii mouth type. Got ${this.mouthType}, expected 0-35`);
		assert.ok(Util.inRange(this.mouthColor, Util.range(5)), `Invalid Mii mouth color. Got ${this.mouthColor}, expected 0-4`);
		assert.ok(Util.inRange(this.mouthScale, Util.range(9)), `Invalid Mii mouth scale. Got ${this.mouthScale}, expected 0-8`);
		assert.ok(
			Util.inRange(this.mouthHorizontalStretch, Util.range(7)),
			`Invalid Mii mouth stretch. Got ${this.mouthHorizontalStretch}, expected 0-6`
		);
		assert.ok(Util.inRange(this.mouthYPosition, Util.range(19)), `Invalid Mii mouth Y position. Got ${this.mouthYPosition}, expected 0-18`);
		assert.ok(Util.inRange(this.mustacheType, Util.range(6)), `Invalid Mii mustache type. Got ${this.mustacheType}, expected 0-5`);
		assert.ok(Util.inRange(this.beardType, Util.range(6)), `Invalid Mii beard type. Got ${this.beardType}, expected 0-5`);
		// assert.ok(Util.inRange(this.facialHairColor, Util.range(8)), `Invalid Mii beard type. Got ${this.facialHairColor}, expected 0-7`);
		assert.ok(Util.inRange(this.mustacheScale, Util.range(9)), `Invalid Mii mustache scale. Got ${this.mustacheScale}, expected 0-8`);
		assert.ok(Util.inRange(this.mustacheYPosition, Util.range(17)), `Invalid Mii mustache Y position. Got ${this.mustacheYPosition}, expected 0-16`);
		assert.ok(Util.inRange(this.glassesType, Util.range(9)), `Invalid Mii glassess type. Got ${this.glassesType}, expected 0-8`);
		assert.ok(Util.inRange(this.glassesColor, Util.range(6)), `Invalid Mii glassess type. Got ${this.glassesColor}, expected 0-5`);
		assert.ok(Util.inRange(this.glassesScale, Util.range(8)), `Invalid Mii glassess type. Got ${this.glassesScale}, expected 0-7`);
		assert.ok(Util.inRange(this.glassesYPosition, Util.range(21)), `Invalid Mii glassess Y position. Got ${this.glassesYPosition}, expected 0-20`);
		assert.equal(typeof this.moleEnabled, "boolean", `Invalid mole enabled flag. Got ${this.moleEnabled}, expected true or false`);
		assert.ok(Util.inRange(this.moleScale, Util.range(9)), `Invalid Mii mole scale. Got ${this.moleScale}, expected 0-8`);
		assert.ok(Util.inRange(this.moleXPosition, Util.range(17)), `Invalid Mii mole X position. Got ${this.moleXPosition}, expected 0-16`);
		assert.ok(Util.inRange(this.moleYPosition, Util.range(31)), `Invalid Mii mole Y position. Got ${this.moleYPosition}, expected 0-30`);

		// Sanity checks
		/*

        HEYimHeroic says this check must be true,
        but in my testing my Mii's have both these flags
        set and are valid

        Commenting out until we get more info

        if (this.dsMii && this.isValid) {
            assert.fail('If DS Mii flag is true, the is valid flag must be false');
        }
        */

		if (this.nonUserMii && (this.creationTime !== 0 || this.isValid || this.dsMii || this.normalMii)) {
			assert.fail("Non-user Mii's must have all other Mii ID bits set to 0");
		}

		if (!this.normalMii && !this.disableSharing) {
			assert.fail("Special Miis must have sharing disabled");
		}
	}

	public decode(): void {
		this.version = this.bitStream.readUint8();
		this.allowCopying = this.bitStream.readBoolean();
		this.profanityFlag = this.bitStream.readBoolean();
		this.regionLock = this.bitStream.readBits(2);
		this.characterSet = this.bitStream.readBits(2);
		this.bitStream.alignByte();
		this.pageIndex = this.bitStream.readBits(4);
		this.slotIndex = this.bitStream.readBits(4);
		this.unknown1 = this.bitStream.readBits(4);
		this.deviceOrigin = this.bitStream.readBits(3);
		this.bitStream.alignByte();
		this.systemId = this.bitStream.readBuffer(8);
		this.bitStream.swapEndian(); // * Mii ID data is BE
		this.normalMii = this.bitStream.readBoolean();
		this.dsMii = this.bitStream.readBoolean();
		this.nonUserMii = this.bitStream.readBoolean();
		this.isValid = this.bitStream.readBoolean();
		this.creationTime = this.bitStream.readBits(28);
		this.bitStream.swapEndian(); // * Swap back to LE
		this.consoleMAC = this.bitStream.readBuffer(6);
		this.bitStream.skipInt16(); // * 0x0000 padding
		this.gender = this.bitStream.readBit();
		this.birthMonth = this.bitStream.readBits(4);
		this.birthDay = this.bitStream.readBits(5);
		this.favoriteColor = this.bitStream.readBits(4);
		this.favorite = this.bitStream.readBoolean();
		this.bitStream.alignByte();
		this.miiName = this.bitStream.readUTF16String(0x14);
		this.height = this.bitStream.readUint8();
		this.build = this.bitStream.readUint8();
		this.disableSharing = this.bitStream.readBoolean();
		this.faceType = this.bitStream.readBits(4);
		this.skinColor = this.bitStream.readBits(3);
		this.wrinklesType = this.bitStream.readBits(4);
		this.makeupType = this.bitStream.readBits(4);
		this.hairType = this.bitStream.readUint8();
		this.hairColor = this.bitStream.readBits(3);
		this.flipHair = this.bitStream.readBoolean();
		this.bitStream.alignByte();
		this.eyeType = this.bitStream.readBits(6);
		this.eyeColor = this.bitStream.readBits(3);
		this.eyeScale = this.bitStream.readBits(4);
		this.eyeVerticalStretch = this.bitStream.readBits(3);
		this.eyeRotation = this.bitStream.readBits(5);
		this.eyeSpacing = this.bitStream.readBits(4);
		this.eyeYPosition = this.bitStream.readBits(5);
		this.bitStream.alignByte();
		this.eyebrowType = this.bitStream.readBits(5);
		this.eyebrowColor = this.bitStream.readBits(3);
		this.eyebrowScale = this.bitStream.readBits(4);
		this.eyebrowVerticalStretch = this.bitStream.readBits(3);
		this.bitStream.skipBit();
		this.eyebrowRotation = this.bitStream.readBits(4);
		this.bitStream.skipBit();
		this.eyebrowSpacing = this.bitStream.readBits(4);
		this.eyebrowYPosition = this.bitStream.readBits(5);
		this.bitStream.alignByte();
		this.noseType = this.bitStream.readBits(5);
		this.noseScale = this.bitStream.readBits(4);
		this.noseYPosition = this.bitStream.readBits(5);
		this.bitStream.alignByte();
		this.mouthType = this.bitStream.readBits(6);
		this.mouthColor = this.bitStream.readBits(3);
		this.mouthScale = this.bitStream.readBits(4);
		this.mouthHorizontalStretch = this.bitStream.readBits(3);
		this.mouthYPosition = this.bitStream.readBits(5);
		this.mustacheType = this.bitStream.readBits(3);
		this.unknown2 = this.bitStream.readUint8();
		this.beardType = this.bitStream.readBits(3);
		this.facialHairColor = this.bitStream.readBits(3);
		this.mustacheScale = this.bitStream.readBits(4);
		this.mustacheYPosition = this.bitStream.readBits(5);
		this.bitStream.alignByte();
		this.glassesType = this.bitStream.readBits(4);
		this.glassesColor = this.bitStream.readBits(3);
		this.glassesScale = this.bitStream.readBits(4);
		this.glassesYPosition = this.bitStream.readBits(5);
		this.moleEnabled = this.bitStream.readBoolean();
		this.moleScale = this.bitStream.readBits(4);
		this.moleXPosition = this.bitStream.readBits(5);
		this.moleYPosition = this.bitStream.readBits(5);
		this.bitStream.alignByte();
		this.creatorName = this.bitStream.readUTF16String(0x14);
		this.bitStream.skipInt16(); // * 0x0000 padding
		this.bitStream.swapEndian(); // * Swap to big endian because thats how checksum is calculated here
		this.checksum = this.bitStream.readUint16();
		this.bitStream.swapEndian(); // * Swap back to little endian

		this.validate();

		if (this.checksum !== this.calculateCRC()) {
			throw new Error("Invalid Mii checksum");
		}
	}

	public calculateCRC(): number {
		const view = this.bitStream.view;

		// @ts-expect-error _view is private
		const data = view._view.subarray(0, 0x5e);

		let crc = 0x0000;

		for (const byte of data) {
			for (let bit = 7; bit >= 0; bit--) {
				const flag = (crc & 0x8000) != 0;
				crc = ((crc << 1) | ((byte >> bit) & 0x1)) ^ (flag ? 0x1021 : 0);
			}
		}

		for (let i = 16; i > 0; i--) {
			const flag = (crc & 0x8000) != 0;
			crc = (crc << 1) ^ (flag ? 0x1021 : 0);
		}

		return crc & 0xffff;
	}

	public encodeStudio(): Buffer {
		this.validate();

		/*
                Can also disable randomization with:

                let miiStudioData = Buffer.alloc(0x2F);
                let next = 256;

                and removing "randomizer" and the "miiStudioData.writeUInt8(randomizer);" call
            */
		const miiStudioData = Buffer.alloc(0x2f);
		const randomizer = Math.floor(256 * Math.random());
		let next = randomizer;
		let pos = 1;

		function encodeMiiPart(partValue: number): void {
			const encoded = (7 + (partValue ^ next)) % 256;
			next = encoded;

			miiStudioData.writeUInt8(encoded, pos);
			pos++;
		}

		miiStudioData.writeUInt8(randomizer);

		if (this.facialHairColor === 0) {
			encodeMiiPart(8);
		} else {
			encodeMiiPart(this.facialHairColor);
		}

		encodeMiiPart(this.beardType);
		encodeMiiPart(this.build);
		encodeMiiPart(this.eyeVerticalStretch);
		encodeMiiPart(this.eyeColor + 8);
		encodeMiiPart(this.eyeRotation);
		encodeMiiPart(this.eyeScale);
		encodeMiiPart(this.eyeType);
		encodeMiiPart(this.eyeSpacing);
		encodeMiiPart(this.eyeYPosition);
		encodeMiiPart(this.eyebrowVerticalStretch);

		if (this.eyebrowColor === 0) {
			encodeMiiPart(8);
		} else {
			encodeMiiPart(this.eyebrowColor);
		}

		encodeMiiPart(this.eyebrowRotation);
		encodeMiiPart(this.eyebrowScale);
		encodeMiiPart(this.eyebrowType);
		encodeMiiPart(this.eyebrowSpacing);
		encodeMiiPart(this.eyebrowYPosition);
		encodeMiiPart(this.skinColor);
		encodeMiiPart(this.makeupType);
		encodeMiiPart(this.faceType);
		encodeMiiPart(this.wrinklesType);
		encodeMiiPart(this.favoriteColor);
		encodeMiiPart(this.gender);

		if (this.glassesColor == 0) {
			encodeMiiPart(8);
		} else if (this.glassesColor < 6) {
			encodeMiiPart(this.glassesColor + 13);
		} else {
			encodeMiiPart(0);
		}

		encodeMiiPart(this.glassesScale);
		encodeMiiPart(this.glassesType);
		encodeMiiPart(this.glassesYPosition);

		if (this.hairColor == 0) {
			encodeMiiPart(8);
		} else {
			encodeMiiPart(this.hairColor);
		}

		encodeMiiPart(this.flipHair ? 1 : 0);
		encodeMiiPart(this.hairType);
		encodeMiiPart(this.height);
		encodeMiiPart(this.moleScale);
		encodeMiiPart(this.moleEnabled ? 1 : 0);
		encodeMiiPart(this.moleXPosition);
		encodeMiiPart(this.moleYPosition);
		encodeMiiPart(this.mouthHorizontalStretch);

		if (this.mouthColor < 4) {
			encodeMiiPart(this.mouthColor + 19);
		} else {
			encodeMiiPart(0);
		}

		encodeMiiPart(this.mouthScale);
		encodeMiiPart(this.mouthType);
		encodeMiiPart(this.mouthYPosition);
		encodeMiiPart(this.mustacheScale);
		encodeMiiPart(this.mustacheType);
		encodeMiiPart(this.mustacheYPosition);
		encodeMiiPart(this.noseScale);
		encodeMiiPart(this.noseType);
		encodeMiiPart(this.noseYPosition);

		return miiStudioData;
	}

	public studioUrl(
		queryParams: {
			type?: string;
			expression?: string;
			width?: number;
			bgColor?: string;
			clothesColor?: string;
			cameraXRotate?: number;
			cameraYRotate?: number;
			cameraZRotate?: number;
			characterXRotate?: number;
			characterYRotate?: number;
			characterZRotate?: number;
			lightXDirection?: number;
			lightYDirection?: number;
			lightZDirection?: number;
			lightDirectionMode?: string;
			instanceCount?: number;
			instanceRotationMode?: string;
			data?: string;
		} = STUDIO_RENDER_DEFAULTS
	): string {
		const params = {
			...STUDIO_RENDER_DEFAULTS,
			...queryParams,
			data: this.encodeStudio().toString("hex"),
		};

		params.type = STUDIO_RENDER_TYPES.includes(params.type as string) ? params.type : STUDIO_RENDER_DEFAULTS.type;
		params.expression = STUDIO_RENDER_EXPRESSIONS.includes(params.expression as string) ? params.expression : STUDIO_RENDER_DEFAULTS.expression;
		params.width = Util.clamp(params.width, 512);
		params.bgColor = STUDIO_BG_COLOR_REGEX.test(params.bgColor as string) ? params.bgColor : STUDIO_RENDER_DEFAULTS.bgColor;
		params.clothesColor = STUDIO_RENDER_CLOTHES_COLORS.includes(params.clothesColor) ? params.clothesColor : STUDIO_RENDER_DEFAULTS.clothesColor;
		params.cameraXRotate = Util.clamp(params.cameraXRotate, 359);
		params.cameraYRotate = Util.clamp(params.cameraYRotate, 359);
		params.cameraZRotate = Util.clamp(params.cameraZRotate, 359);
		params.characterXRotate = Util.clamp(params.characterXRotate, 359);
		params.characterYRotate = Util.clamp(params.characterYRotate, 359);
		params.characterZRotate = Util.clamp(params.characterZRotate, 359);
		params.lightXDirection = Util.clamp(params.lightXDirection, 359);
		params.lightYDirection = Util.clamp(params.lightYDirection, 359);
		params.lightZDirection = Util.clamp(params.lightZDirection, 359);
		params.lightDirectionMode = STUDIO_RENDER_LIGHT_DIRECTION_MODS.includes(params.lightDirectionMode)
			? params.lightDirectionMode
			: STUDIO_RENDER_DEFAULTS.lightDirectionMode;
		params.instanceCount = Util.clamp(params.instanceCount, 1, 16);
		params.instanceRotationMode = STUDIO_RENDER_INSTANCE_ROTATION_MODES.includes(params.instanceRotationMode)
			? params.instanceRotationMode
			: STUDIO_RENDER_DEFAULTS.instanceRotationMode;

		// converts non-string params to strings
		const query = new URLSearchParams(Object.fromEntries(Object.entries(params).map(([key, value]) => [key, value.toString()])));

		if (params.lightDirectionMode === "none") {
			query.delete("lightDirectionMode");
			query.delete("lightXDirection");
			query.delete("lightYDirection");
			query.delete("lightZDirection");
		}

		return `${STUDIO_RENDER_URL_BASE}?${query.toString()}`;
	}
}
