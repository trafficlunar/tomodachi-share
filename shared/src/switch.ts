import { type SwitchMiiInstructions } from "./types";

export function minifyInstructions(instructions: Partial<SwitchMiiInstructions>) {
	const DEFAULT_ZERO_FIELDS = new Set(["height", "distance", "rotation", "size", "stretch"]);

	function minify(object: Partial<SwitchMiiInstructions>): Partial<SwitchMiiInstructions> {
		for (const key in object) {
			const value = object[key as keyof SwitchMiiInstructions];

			if (value === null || value === undefined || (typeof value === "boolean" && value === false) || (DEFAULT_ZERO_FIELDS.has(key) && value === 0)) {
				delete object[key as keyof SwitchMiiInstructions];
				continue;
			}

			if (typeof value === "object" && !Array.isArray(value)) {
				minify(value as Partial<SwitchMiiInstructions>);

				if (Object.keys(value).length === 0) {
					delete object[key as keyof SwitchMiiInstructions];
				}
			}
		}

		return object;
	}

	return minify(instructions);
}

export const defaultInstructions: SwitchMiiInstructions = {
	head: { skinColor: null },
	hair: {
		color: null,
		subColor: null,
		subColor2: null,
		style: null,
		isFlipped: false,
	},
	eyebrows: { color: null, height: null, distance: null, rotation: null, size: null, stretch: null },
	eyes: {
		main: { color: null, height: null, distance: null, rotation: null, size: null, stretch: null },
		eyelashesTop: { height: null, distance: null, rotation: null, size: null, stretch: null },
		eyelashesBottom: { height: null, distance: null, rotation: null, size: null, stretch: null },
		eyelidTop: { height: null, distance: null, rotation: null, size: null, stretch: null },
		eyelidBottom: { height: null, distance: null, rotation: null, size: null, stretch: null },
		eyeliner: { color: null },
		pupil: { height: null, distance: null, rotation: null, size: null, stretch: null },
	},
	nose: { height: null, size: null },
	lips: { color: null, height: null, rotation: null, size: null, stretch: null, hasLipstick: false },
	ears: { height: null, size: null },
	glasses: { ringColor: null, shadesColor: null, height: null, size: null, stretch: null },
	other: {
		wrinkles1: { height: null, distance: null, size: null, stretch: null },
		wrinkles2: { height: null, distance: null, size: null, stretch: null },
		beard: { color: null },
		moustache: { color: null, height: null, isFlipped: false, size: null, stretch: null },
		goatee: { color: null },
		mole: { color: null, height: null, distance: null, size: null },
		eyeShadow: { color: null, height: null, distance: null, size: null, stretch: null },
		blush: { color: null, height: null, distance: null, size: null, stretch: null },
	},
	height: null,
	weight: null,
	datingPreferences: [],
	birthday: {
		day: null,
		month: null,
		age: null,
		dontAge: false,
	},
	voice: { speed: null, pitch: null, depth: null, delivery: null, tone: null },
	personality: { movement: null, speech: null, energy: null, thinking: null, overall: null },
};

export const COLORS: string[] = [
	// Outside
	"000000",
	"8E8E93",
	"6B4F0F",
	"5A2A0A",
	"7A1E0E",
	"A0522D",
	"A56B2A",
	"D4A15A",
	// Row 1
	"FFFFFF",
	"E6CEB2",
	"FAF79A",
	"D7FA9C",
	"BCF1A9",
	"85E5B5",
	"9FE3FE",
	"D1C5ED",
	"FEC8D6",
	"FEBFB8",
	// Row 2
	"DBD7CE",
	"E6BA79",
	"F7EA9B",
	"D6E683",
	"97DE7E",
	"7FD4BD",
	"78C4DC",
	"EFBDFA",
	"FCACC9",
	"FFA6A6",
	// Row 3
	"BDBDBD",
	"CF9F4A",
	"FDE249",
	"D5D86F",
	"9EE041",
	"63C787",
	"85BDFA",
	"C4ADE4",
	"FA7495",
	"FF7366",
	// Row 4
	"9B9B9B",
	"D09B69",
	"F9DF82",
	"D8CC82",
	"93BE0D",
	"79C49D",
	"56B4F0",
	"BF83CB",
	"C7556E",
	"F54949",
	// Row 5
	"797880",
	"A96001",
	"FFC28B",
	"CBBF37",
	"4AAD1C",
	"4FAEB0",
	"8AA6FA",
	"A992C8",
	"B05380",
	"EF0D0E",
	// Row 6
	"786F66",
	"A54D1B",
	"FF960E",
	"CDB987",
	"34996F",
	"347E8B",
	"2982D4",
	"845BB7",
	"C81C56",
	"D8530E",
	// Row 7
	"6D6E70",
	"8D4F40",
	"FFB166",
	"A59562",
	"427901",
	"216663",
	"4655A8",
	"6E42B1",
	"991C3C",
	"B63D42",
	// Row 8
	"404040",
	"7E4500",
	"EF9974",
	"99922A",
	"017562",
	"0C4F58",
	"154166",
	"4B164E",
	"8A163D",
	"A80C0D",
	// Row 9
	"2E2526",
	"663D2B",
	"885816",
	"605F31",
	"396F58",
	"013D3B",
	"223266",
	"38263C",
	"842626",
	"7B3B17",
	// Row 10
	"000000",
	"41220D",
	"5F380D",
	"4D3D0C",
	"0C4A35",
	"0D2E35",
	"161C40",
	"321C40",
	"722E3B",
	"5B160E",
	// Hair tab extra colors
	"FFD8BA",
	"FFD5AC",
	"FEC1A4",
	"FEC68F",
	"FEB089",
	"FEBA6B",
	"F39866",
	"E89854",
	"E37E3F",
	"B45627",
	"914220",
	"59371F",
	"662D16",
	"392D1E",
	// Eye tab extra colors
	"000100",
	"6B6F6E",
	"663F2D",
	"605F34",
	"3B6F59",
	"4856A6",
	// Lips tab extra colors
	"D65413",
	"F21415",
	"F54A4A",
	"EE9670",
	"8A4E40",
	// Glasses tab extra colors
	"000000",
	"776F66",
	"603915",
	"A65F00",
	"A61615",
	"273465",
	// Eye shade extra colors
	"A54E21",
	"653E2C",
	"EC946F",
	"FC9414",
	"F97595",
	"F54A4A",
	"86E1B0",
	"6E44B0",
];
