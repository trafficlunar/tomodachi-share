import { MiiGender, Prisma } from "@prisma/client";
import { DefaultSession } from "next-auth";

// All color properties are assumed to be the same 108 colors
interface SwitchMiiInstructions {
	head: {
		type: number; // 16 types
		skinColor: number; // additional 14 are not in color menu
	};
	hair: {
		setType: number; // at least 25
		bangsType: number; // at least 25
		backType: number; // at least 25
		color: number;
		subColor: number;
		style: number; // is this different for each hair?
		isFlipped: boolean; // is this different for bangs/back?
	};
	eyebrows: {
		type: number; // 0 is None, at least 25 (including None)
		color: number;
		height: number;
		distance: number;
		rotation: number;
		size: number;
		stretch: number;
	};
	eyes: {
		eyesType: number; // At least 25
		eyelashesTop: number; // 6 types
		eyelashesBottom: number; // unknown
		eyelidTop: number; // 0 is None, 2 additional types
		eyelidBottom: number; // unknown
		eyeliner: number; // unknown
		pupil: number; // 0 is default, 9 additional types
		color: number; // is this same as hair?
		height: number;
		distance: number;
		rotation: number;
		size: number;
		stretch: number;
	};
	nose: {
		type: number; // 0 is None, at least 24 additional
		height: number;
		size: number;
	};
	lips: {
		type: number; // 0 is None, at least 24 additional
		color: number; // is this same as hair?
		height: number;
		rotation: number;
		size: number;
		stretch: number;
		hasLipstick: boolean; // is this what it's called?
	};
	ears: {
		type: number; // 0 is Default, 4 additional
		height: number;
		size: number;
	};
	glasses: {
		type: number; // NOTE: THERE IS A GAP!!! 0 is None, at least 29 additional
		ringColor: number; // i'm assuming based off icon
		shadesColor: number; // i'm assuming based off icon
		height: number;
		size: number;
		stretch: number;
	};
	other: {
		// names were assumed
		wrinkles1: {
			type: number; // 0 is None, at least BLANK additional
			color: number; // is this same as hair?
			height: number;
			distance: number;
			size: number;
			stretch: number;
		};
		wrinkles2: {
			type: number; // 0 is None, at least BLANK additional
			color: number; // is this same as hair?
			height: number;
			distance: number;
			size: number;
			stretch: number;
		};
		beard: {
			type: number; // 0 is None, at least BLANK additional
			color: number; // is this same as hair?
			height: number;
			distance: number;
			size: number;
			stretch: number;
		};
		moustache: {
			type: number; // 0 is None, at least BLANK additional
			color: number; // is this same as hair?
			height: number;
			distance: number;
			size: number;
			stretch: number;
		};
		goatee: {
			type: number; // 0 is None, at least BLANK additional
			color: number; // is this same as hair?
			height: number;
			distance: number;
			size: number;
			stretch: number;
		};
		mole: {
			type: number; // 0 is None, at least BLANK additional
			color: number; // is this same as hair?
			height: number;
			distance: number;
			size: number;
			stretch: number;
		};
		eyeShadow: {
			type: number; // 0 is None, at least 3 additional
			color: number; // is this same as hair?
			height: number;
			distance: number;
			size: number;
			stretch: number;
		};
		blush: {
			type: number; // 0 is None, at least 7 additional
			color: number; // is this same as hair?
			height: number;
			distance: number;
			size: number;
			stretch: number;
		};
	};
	// makeup, use video?
	height: number;
	weight: number;
	datingPreferences: MiiGender[];
	voice: {
		speed: number;
		pitch: number;
		depth: number;
		delivery: number;
		tone: number; // 1 to 6
	};
	personality: {
		movement: number; // 8 levels, slow to quick
		speech: number; // 8 levels, polite to honest
		energy: number; // 8 levels, flat to varied
		thinking: number; // 8 levels, serious to chill
		overall: number; // 8 levels, normal to quirky
	};
}
