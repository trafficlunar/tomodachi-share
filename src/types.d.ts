import { MiiGender, Prisma } from "@prisma/client";
import { DefaultSession } from "next-auth";

// Some types have different options disabled, we're ignoring them for now
interface SwitchMiiInstructions {
	head: {
		type: number | null; // 16 types, default is 2
		skinColor: number | null; // Additional 14 are not in color menu, default is 2
	};
	hair: {
		setType: number | null; // 245 types, default is 43
		bangsType: number | null; // 83 types, default is none, if a set is selected, set bangs and back to none and vice-versa
		backType: number | null; // 111 types, default is none, same here (set related)
		color: number | null;
		subColor: number | null; // Default is none
		subColor2: number | null; // Only used when bangs/back is selected
		style: number | null; // is this different for each hair?
		isFlipped: boolean; // Only for sets and fringe
	};
	eyebrows: {
		type: number | null; // 1 is None, 43 types, default is 28
		color: number | null;
		height: number | null;
		distance: number | null;
		rotation: number | null;
		size: number | null;
		stretch: number | null;
	};
	eyes: {
		main: {
			type: number | null; // 1 is None, 121 types default is 6
			color: number | null;
			height: number | null;
			distance: number | null;
			rotation: number | null;
			size: number | null;
			stretch: number | null;
		};
		eyelashesTop: {
			type: number | null; // 6 types, default is 1
			height: number | null;
			distance: number | null;
			rotation: number | null;
			size: number | null;
			stretch: number | null;
		};
		eyelashesBottom: {
			type: number | null; // 2 types, default is 1
			height: number | null;
			distance: number | null;
			rotation: number | null;
			size: number | null;
			stretch: number | null;
		};
		eyelidTop: {
			type: number | null; // 3 types, default is 1
			height: number | null;
			distance: number | null;
			rotation: number | null;
			size: number | null;
			stretch: number | null;
		};
		eyelidBottom: {
			type: number | null; // 3 types, default is 1
			height: number | null;
			distance: number | null;
			rotation: number | null;
			size: number | null;
			stretch: number | null;
		};
		eyeliner: {
			type: number | null; // 2 types, default is 1
			color: number | null;
		};
		pupil: {
			type: number | null; // 10 types, default is 1
			height: number | null;
			distance: number | null;
			rotation: number | null;
			size: number | null;
			stretch: number | null;
		};
	};
	nose: {
		type: number | null; // 1 is None, 32 types, default is 6
		height: number | null;
		size: number | null;
	};
	lips: {
		type: number | null; // 1 is None, 53 types, default is 2
		color: number | null;
		height: number | null;
		rotation: number | null;
		size: number | null;
		stretch: number | null;
		hasLipstick: boolean;
	};
	ears: {
		type: number | null; // 5 types, default is 1
		height: number | null; // Does not work for default
		size: number | null; // Does not work for default
	};
	glasses: {
		type: number | null; // NOTE: THERE IS A GAP AT 40!!! 1 is None, 58 types, default is 1
		ringColor: number | null;
		shadesColor: number | null; // Only works after gap
		height: number | null;
		size: number | null;
		stretch: number | null;
	};
	other: {
		// names were assumed
		wrinkles1: {
			type: number | null; // 9 types, default is 1
			height: number | null;
			distance: number | null;
			size: number | null;
			stretch: number | null;
		};
		wrinkles2: {
			type: number | null; // 15 types, default is 1
			height: number | null;
			distance: number | null;
			size: number | null;
			stretch: number | null;
		};
		beard: {
			type: number | null; // 15 types, default is 1
			color: number | null;
		};
		moustache: {
			type: number | null; // 16 types, default is 1
			color: number | null; // is this same as hair?
			height: number | null;
			isFlipped: boolean;
			size: number | null;
			stretch: number | null;
		};
		goatee: {
			type: number | null; // 14 types, default is 1
			color: number | null;
		};
		mole: {
			type: number | null; // 2 types, default is 1
			color: number | null; // is this same as hair?
			height: number | null;
			distance: number | null;
			size: number | null;
		};
		eyeShadow: {
			type: number | null; // 4 types, default is 1
			color: number | null;
			height: number | null;
			distance: number | null;
			size: number | null;
			stretch: number | null;
		};
		blush: {
			type: number | null; // 8 types, default is 1
			color: number | null;
			height: number | null;
			distance: number | null;
			size: number | null;
			stretch: number | null;
		};
	};
	// makeup, use video?
	height: number | null;
	weight: number | null;
	datingPreferences: MiiGender[];
	voice: {
		speed: number | null;
		pitch: number | null;
		depth: number | null;
		delivery: number | null;
		tone: number | null; // 1 to 6
	};
	personality: {
		movement: number | null; // 8 levels, slow to quick
		speech: number | null; // 8 levels, polite to honest
		energy: number | null; // 8 levels, flat to varied
		thinking: number | null; // 8 levels, serious to chill
		overall: number | null; // 8 levels, normal to quirky
	};
}
