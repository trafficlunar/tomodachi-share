import { MiiGender, Prisma } from "@prisma/client";
import { DefaultSession } from "next-auth";

// Some types have different options disabled, we're ignoring them for now
interface SwitchMiiInstructions {
	head: {
		type: number; // 16 types, default is 2
		skinColor: number; // Additional 14 are not in color menu, default is 2
	};
	hair: {
		setType: number | null; // 245 types, default is 43
		bangsType: number | null; // 83 types, default is none, if a set is selected, set bangs and back to none and vice-versa
		backType: number | null; // 111 types, default is none, same here (set related)
		color: number;
		subColor: number | null; // Default is none
		subColor2: number | null; // Only used when bangs/back is selected
		style: number | null; // is this different for each hair?
		isFlipped: boolean; // Only for sets and fringe
	};
	eyebrows: {
		type: number; // 1 is None, 43 types, default is 28
		color: number;
		height: number;
		distance: number;
		rotation: number;
		size: number;
		stretch: number;
	};
	eyes: {
		main: {
			type: number; // 1 is None, 121 types default is 6
			color: number;
			height: number;
			distance: number;
			rotation: number;
			size: number;
			stretch: number;
		};
		eyelashesTop: {
			type: number; // 6 types, default is 1
			height: number;
			distance: number;
			rotation: number;
			size: number;
			stretch: number;
		};
		eyelashesBottom: {
			type: number; // 2 types, default is 1
			height: number;
			distance: number;
			rotation: number;
			size: number;
			stretch: number;
		};
		eyelidTop: {
			type: number; // 3 types, default is 1
			height: number;
			distance: number;
			rotation: number;
			size: number;
			stretch: number;
		};
		eyelidBottom: {
			type: number; // 3 types, default is 1
			height: number;
			distance: number;
			rotation: number;
			size: number;
			stretch: number;
		};
		eyeliner: {
			type: number; // 2 types, default is 1
			color: number;
		};
		pupil: {
			type: number; // 10 types, default is 1
			height: number;
			distance: number;
			rotation: number;
			size: number;
			stretch: number;
		};
	};
	nose: {
		type: number; // 1 is None, 32 types, default is 6
		height: number;
		size: number;
	};
	lips: {
		type: number; // 1 is None, 53 types, default is 2
		color: number;
		height: number;
		rotation: number;
		size: number;
		stretch: number;
		hasLipstick: boolean;
	};
	ears: {
		type: number; // 5 types, default is 1
		height: number; // Does not work for default
		size: number; // Does not work for default
	};
	glasses: {
		type: number; // NOTE: THERE IS A GAP AT 40!!! 1 is None, 58 types, default is 1
		ringColor: number;
		shadesColor: number; // Only works after gap
		height: number;
		size: number;
		stretch: number;
	};
	other: {
		// names were assumed
		wrinkles1: {
			type: number; // 9 types, default is 1
			height: number;
			distance: number;
			size: number;
			stretch: number;
		};
		wrinkles2: {
			type: number; // 15 types, default is 1
			height: number;
			distance: number;
			size: number;
			stretch: number;
		};
		beard: {
			type: number; // 15 types, default is 1
			color: number;
		};
		moustache: {
			type: number; // 16 types, default is 1
			color: number; // is this same as hair?
			height: number;
			isFlipped: boolean;
			size: number;
			stretch: number;
		};
		goatee: {
			type: number; // 14 types, default is 1
			color: number;
		};
		mole: {
			type: number; // 2 types, default is 1
			color: number; // is this same as hair?
			height: number;
			distance: number;
			size: number;
		};
		eyeShadow: {
			type: number; // 4 types, default is 1
			color: number;
			height: number;
			distance: number;
			size: number;
			stretch: number;
		};
		blush: {
			type: number; // 8 types, default is 1
			color: number;
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
