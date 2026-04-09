import { MiiGender, Prisma } from "@prisma/client";
import { DefaultSession } from "next-auth";

interface SwitchMiiInstructions {
	head: {
		type: number | null;

		skinColor: number | null; // Additional 14 are not in color menu, default is 2
	};
	hair: {
		set: number | null;
		bangs: number | null;
		back: number | null;

		color: number | null;
		subColor: number | null; // Default is none
		subColor2: number | null; // Only used when bangs/back is selected
		style: number | null; // is this different for each hair?
		isFlipped: boolean; // Only for sets and fringe
	};
	eyebrows: {
		type: number | null;

		color: number | null;
		height: number | null;
		distance: number | null;
		rotation: number | null;
		size: number | null;
		stretch: number | null;
	};
	eyes: {
		main: {
			type: number | null;

			color: number | null;
			height: number | null;
			distance: number | null;
			rotation: number | null;
			size: number | null;
			stretch: number | null;
		};
		eyelashesTop: {
			type: number | null;

			height: number | null;
			distance: number | null;
			rotation: number | null;
			size: number | null;
			stretch: number | null;
		};
		eyelashesBottom: {
			type: number | null;

			height: number | null;
			distance: number | null;
			rotation: number | null;
			size: number | null;
			stretch: number | null;
		};
		eyelidTop: {
			type: number | null;

			height: number | null;
			distance: number | null;
			rotation: number | null;
			size: number | null;
			stretch: number | null;
		};
		eyelidBottom: {
			type: number | null;

			height: number | null;
			distance: number | null;
			rotation: number | null;
			size: number | null;
			stretch: number | null;
		};
		eyeliner: {
			type: boolean;
			color: number | null;
		};
		pupil: {
			type: number | null;

			height: number | null;
			distance: number | null;
			rotation: number | null;
			size: number | null;
			stretch: number | null;
		};
	};
	nose: {
		type: number | null;

		height: number | null;
		size: number | null;
	};
	lips: {
		type: number | null;

		color: number | null;
		height: number | null;
		rotation: number | null;
		size: number | null;
		stretch: number | null;
		hasLipstick: boolean;
	};
	ears: {
		type: number | null;

		height: number | null; // Does not work for default
		size: number | null; // Does not work for default
	};
	glasses: {
		type: number | null;
		type2: number | null;

		ringColor: number | null;
		shadesColor: number | null; // Only works after gap
		height: number | null;
		size: number | null;
		stretch: number | null;
	};
	other: {
		// names were assumed
		wrinkles1: {
			type: number | null;

			height: number | null;
			distance: number | null;
			size: number | null;
			stretch: number | null;
		};
		wrinkles2: {
			type: number | null;

			height: number | null;
			distance: number | null;
			size: number | null;
			stretch: number | null;
		};
		beard: {
			type: number | null;

			color: number | null;
		};
		moustache: {
			type: number | null;

			color: number | null;
			height: number | null;
			isFlipped: boolean;
			size: number | null;
			stretch: number | null;
		};
		goatee: {
			type: number | null;

			color: number | null;
		};
		mole: {
			type: boolean;

			height: number | null;
			distance: number | null;
			size: number | null;
		};
		eyeShadow: {
			type: number | null;

			color: number | null;
			height: number | null;
			distance: number | null;
			size: number | null;
			stretch: number | null;
		};
		blush: {
			type: number | null;

			color: number | null;
			height: number | null;
			distance: number | null;
			size: number | null;
			stretch: number | null;
		};
	};
	height: number | null;
	weight: number | null;
	datingPreferences: MiiGender[];
	birthday: {
		day: number | null;
		month: number | null;
		age: number | null; // TODO: update accordingly with mii creation date
		dontAge: boolean;
	};
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
