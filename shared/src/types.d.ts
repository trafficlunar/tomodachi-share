type MiiGender = "MALE" | "FEMALE" | "NONBINARY";
type MiiPlatform = "THREE_DS" | "SWITCH";
type MiiMakeup = "FULL" | "PARTIAL" | "NONE";
type ReportReason = "INAPPROPRIATE" | "SPAM" | "BAD_QUALITY" | "OTHER";

export interface SwitchMiiInstructions {
	head: {
		skinColor: number | null; // Additional 14 are not in color menu, default is 2
	};
	hair: {
		color: number | null;
		subColor: number | null; // Default is none
		subColor2: number | null; // Only used when bangs/back is selected
		style: number | null; // is this different for each hair?
		isFlipped: boolean; // Only for sets and fringe
	};
	eyebrows: {
		color: number | null;
		height: number | null;
		distance: number | null;
		rotation: number | null;
		size: number | null;
		stretch: number | null;
	};
	eyes: {
		main: {
			color: number | null;
			height: number | null;
			distance: number | null;
			rotation: number | null;
			size: number | null;
			stretch: number | null;
		};
		eyelashesTop: {
			height: number | null;
			distance: number | null;
			rotation: number | null;
			size: number | null;
			stretch: number | null;
		};
		eyelashesBottom: {
			height: number | null;
			distance: number | null;
			rotation: number | null;
			size: number | null;
			stretch: number | null;
		};
		eyelidTop: {
			height: number | null;
			distance: number | null;
			rotation: number | null;
			size: number | null;
			stretch: number | null;
		};
		eyelidBottom: {
			height: number | null;
			distance: number | null;
			rotation: number | null;
			size: number | null;
			stretch: number | null;
		};
		eyeliner: {
			color: number | null;
		};
		pupil: {
			height: number | null;
			distance: number | null;
			rotation: number | null;
			size: number | null;
			stretch: number | null;
		};
	};
	nose: {
		height: number | null;
		size: number | null;
	};
	lips: {
		color: number | null;
		height: number | null;
		rotation: number | null;
		size: number | null;
		stretch: number | null;
		hasLipstick: boolean;
	};
	ears: {
		height: number | null; // Does not work for default
		size: number | null; // Does not work for default
	};
	glasses: {
		ringColor: number | null;
		shadesColor: number | null; // Only works after gap
		height: number | null;
		size: number | null;
		stretch: number | null;
	};
	other: {
		// names were assumed
		wrinkles1: {
			height: number | null;
			distance: number | null;
			size: number | null;
			stretch: number | null;
		};
		wrinkles2: {
			height: number | null;
			distance: number | null;
			size: number | null;
			stretch: number | null;
		};
		beard: {
			color: number | null;
		};
		moustache: {
			color: number | null; // is this same as hair?
			height: number | null;
			isFlipped: boolean;
			size: number | null;
			stretch: number | null;
		};
		goatee: {
			color: number | null;
		};
		mole: {
			color: number | null; // is this same as hair?
			height: number | null;
			distance: number | null;
			size: number | null;
		};
		eyeShadow: {
			color: number | null;
			height: number | null;
			distance: number | null;
			size: number | null;
			stretch: number | null;
		};
		blush: {
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
