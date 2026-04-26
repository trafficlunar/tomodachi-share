import { CharInfoEx } from "charinfo-ex";
import * as fzstd from "fzstd";
import { BytesDeswizzle } from "./deswizzle";

import { minifyInstructions } from "./switch";
import { type MiiGender, type SwitchMiiInstructions } from "./types";

export class SwitchTomodachiLifeMii {
	buffer: ArrayBuffer;
	data: CharInfoEx;

	datingPreferences: MiiGender[];
	birthday: { month: number; day: number; age: number; dontAge: boolean };
	voice: { speed: number; pitch: number; depth: number; delivery: number; tone: number };
	personality: { movement: number; speech: number; energy: number; thinking: number; overall: number };

	constructor(buffer: ArrayBuffer, data: CharInfoEx) {
		this.buffer = buffer;
		this.data = data;

		const view = new DataView(buffer);
		const bytes = new Uint8Array(buffer);
		const parse = (index: number): number => view.getUint8(161 + index * 4);

		const age = view.getUint32(0x00e1, true);
		const year = view.getUint32(0x00d9, true);
		const dontAge = age !== 0xffffffff;

		this.datingPreferences = (["MALE", "FEMALE", "NONBINARY"] as const).filter((_, i) => bytes[0x01a9 + i] === 1);
		this.birthday = {
			month: parse(17),
			day: parse(15),
			age: dontAge ? age : new Date().getFullYear() - year,
			dontAge,
		};
		this.voice = {
			speed: parse(6),
			pitch: parse(8),
			depth: parse(5),
			delivery: Math.max(0, view.getInt8(0xc5)), // why is this an integer??
			tone: parse(7) + 1,
			// TODO: add voice preset to instructions type?
		};
		this.personality = {
			movement: parse(4) - 1,
			speech: parse(2) - 1,
			energy: parse(1) - 1,
			thinking: parse(0) - 1,
			overall: parse(3) - 1,
		};

		// Validate
		// if (bytes[0x01a9] > 1 || bytes[0x01aa] > 1 || bytes[0x01ab] > 1) throw new Error("Invalid dating preference bytes");
		// if (this.birthday.month < 1 || this.birthday.month > 12) throw new Error("Invalid birthday month");
		// if (this.birthday.day < 1 || this.birthday.day > 31) throw new Error("Invalid birthday day");
		// if (
		// 	this.personality.movement < 0 ||
		// 	this.personality.movement > 4 ||
		// 	this.personality.speech < 0 ||
		// 	this.personality.speech > 4 ||
		// 	this.personality.energy < 0 ||
		// 	this.personality.energy > 4 ||
		// 	this.personality.thinking < 0 ||
		// 	this.personality.thinking > 4 ||
		// 	this.personality.overall < 0 ||
		// 	this.personality.overall > 4
		// )
		// 	throw new Error("Invalid personality values");
	}

	// There's a UGC Texture image but we're ignoring it
	public async extractFacePaintImage(): Promise<Buffer | null> {
		try {
			if (typeof window !== "undefined") {
				throw new Error("sharp cannot run in the browser");
			}

			const { default: sharp } = await import("sharp");

			const buf = Buffer.from(this.buffer);

			const canvasMarker = Buffer.from([0xa3, 0xa3, 0xa3, 0xa3]);
			const ugcMarker = Buffer.from([0xa4, 0xa4, 0xa4, 0xa4]);

			const canvasStart = buf.indexOf(canvasMarker);
			if (canvasStart === -1) return null;

			const ugcStart = buf.indexOf(ugcMarker);
			const canvasData = buf.subarray(canvasStart + 4, ugcStart === -1 ? undefined : ugcStart);

			const decompressed = Buffer.from(fzstd.decompress(canvasData));
			const deswizzled = new BytesDeswizzle(decompressed, [256, 256], [1, 1], 4, 4).deswizzle();

			return await sharp(deswizzled, {
				raw: { width: 256, height: 256, channels: 4 },
			})
				.png()
				.toBuffer();
		} catch (err) {
			console.error("extractFacePaintImage failed:", err);
			return null;
		}
	}

	public toInstructions() {
		const instructions: Partial<SwitchMiiInstructions> = {
			head: {
				type: this.data.facelineType,
				skinColor: this.data.facelineColor,
			},
			hair: {
				set: this.data.hairType,
				bangs: this.data.hairTypeFront,
				back: this.data.hairTypeBack,
				color: this.data.hairColor0,
				subColor: this.data.hairColor1,
				subColor2: this.data.hairColor0, // TODO: check
				style: this.data.hairStyle,
				isFlipped: (this.data.faceFlags & (1 << 2)) !== 0, // bangsSide
			},
			eyebrows: {
				type: this.data.eyebrowType,
				color: this.data.eyebrowColor,
				height: this.data.eyebrowY - 10,
				distance: this.data.eyebrowX - 4,
				rotation: this.data.eyebrowRotate - 6,
				size: this.data.eyebrowScale - 4,
				stretch: this.data.eyebrowAspect - 3,
			},
			eyes: {
				main: {
					type: this.data.eyeType,
					color: this.data.eyeColor,
					height: this.data.eyeY - 12,
					distance: this.data.eyeX - 2,
					rotation: this.data.eyeRotate - 4,
					size: this.data.eyeScale - 4,
					stretch: this.data.eyeAspect - 3,
				},
				eyelashesTop: {
					type: this.data.eyelashUpperType,
					height: this.data.eyelashUpperY,
					distance: this.data.eyelashUpperX,
					rotation: this.data.eyelashUpperRotate,
					size: this.data.eyelashUpperScale,
					stretch: this.data.eyelashUpperAspect,
				},
				eyelashesBottom: {
					type: this.data.eyelashLowerType,
					height: this.data.eyelashLowerY,
					distance: this.data.eyelashLowerX,
					rotation: this.data.eyelashLowerRotate,
					size: this.data.eyelashLowerScale,
					stretch: this.data.eyelashLowerAspect,
				},
				eyelidTop: {
					type: this.data.eyelidUpperType,
					height: this.data.eyelidUpperY,
					distance: this.data.eyelidUpperX,
					rotation: this.data.eyelidUpperRotate,
					size: this.data.eyelidUpperScale,
					stretch: this.data.eyelidUpperAspect,
				},
				eyelidBottom: {
					type: this.data.eyelidLowerType,
					height: this.data.eyelidLowerY,
					distance: this.data.eyelidLowerX,
					rotation: this.data.eyelidLowerRotate,
					size: this.data.eyelidLowerScale,
					stretch: this.data.eyelidLowerAspect,
				},
				eyeliner: {
					type: (this.data.faceFlags & (1 << 4)) !== 0, // eyeShadowEnabled
					color: this.data.eyeShadowColor,
				},
				pupil: {
					type: this.data.eyeHighlightType,
					height: this.data.eyeHighlightY,
					distance: this.data.eyeHighlightX,
					rotation: this.data.eyeHighlightRotate,
					size: this.data.eyeHighlightScale,
					stretch: this.data.eyeHighlightAspect,
				},
			},
			nose: {
				type: this.data.noseType,
				height: this.data.noseY - 9,
				size: this.data.noseScale - 4,
			},
			lips: {
				type: this.data.mouthType,
				color: this.data.mouthColor,
				height: this.data.mouthY - 13,
				rotation: this.data.mouthRotate,
				size: this.data.mouthScale - 4,
				stretch: this.data.mouthAspect - 3,
				hasLipstick: (this.data.faceFlags & (1 << 5)) !== 0, // mouthInvert
			},
			ears: {
				type: this.data.earType,
				height: this.data.earY - 4,
				size: this.data.earScale - 2,
			},
			glasses: {
				type: this.data.glassType1,
				type2: this.data.glassType2,
				ringColor: this.data.glassColor1,
				shadesColor: this.data.glassColor2,
				height: this.data.glassY - 11,
				size: this.data.glassScale - 4,
				stretch: this.data.glassAspect - 3,
			},
			other: {
				wrinkles1: {
					type: this.data.wrinkleLowerType,
					height: this.data.wrinkleLowerY - 15,
					distance: this.data.wrinkleLowerX - 2,
					size: this.data.wrinkleLowerScale - 6,
					stretch: this.data.wrinkleLowerAspect - 3,
				},
				wrinkles2: {
					type: this.data.wrinkleUpperType,
					height: this.data.wrinkleUpperY - 23,
					distance: this.data.wrinkleUpperX - 7,
					size: this.data.wrinkleUpperScale - 6,
					stretch: this.data.wrinkleUpperAspect - 3,
				},
				beard: {
					type: this.data.beardType,
					color: this.data.beardColor,
				},
				moustache: {
					type: this.data.mustacheType,
					color: this.data.mustacheColor,
					height: this.data.mustacheY - 10,
					isFlipped: (this.data.faceFlags & (1 << 6)) !== 0, // mustacheInverted
					size: this.data.mustacheScale - 4,
					stretch: this.data.mustacheAspect - 3,
				},
				goatee: {
					type: this.data.beardShortType,
					color: this.data.beardShortColor,
				},
				mole: {
					type: this.data.moleX != 0,
					height: this.data.moleY - 20,
					distance: this.data.moleX - 2,
					size: this.data.moleScale - 4,
				},
				eyeShadow: {
					type: this.data.makeup0,
					color: this.data.makeup0Color,
					height: this.data.makeup0Y - 12,
					distance: this.data.makeup0X - 1,
					size: this.data.makeup0Scale - 6,
					stretch: this.data.makeup0Aspect - 3,
				},
				blush: {
					type: this.data.makeup1,
					color: this.data.makeup1Color,
					height: this.data.makeup1Y - 19,
					distance: this.data.makeup1X - 6,
					size: this.data.makeup1Scale - 5,
					stretch: this.data.makeup1Aspect - 3,
				},
			},
			height: this.data.height,
			weight: this.data.build,
			datingPreferences: this.datingPreferences,
			birthday: this.birthday,
			voice: this.voice,
			personality: this.personality,
		};

		return minifyInstructions(instructions);
	}
}
