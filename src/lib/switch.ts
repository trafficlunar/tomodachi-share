import { SwitchMiiInstructions } from "@/types";

export function minifyInstructions(instructions: Partial<SwitchMiiInstructions>) {
	const DEFAULT_ZERO_FIELDS = new Set(["height", "distance", "rotation", "size", "stretch"]);

	function minify(object: Partial<SwitchMiiInstructions>): Partial<SwitchMiiInstructions> {
		for (const key in object) {
			const value = object[key as keyof SwitchMiiInstructions];

			if (value === null || value === undefined || (DEFAULT_ZERO_FIELDS.has(key) && value === 0)) {
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
	"F2F2F2",
	"E6D5C3",
	"F3E6A2",
	"CDE6A1",
	"A9DFA3",
	"8ED8B0",
	"8FD3E8",
	"C9C2E6",
	"F3C1CF",
	"F0A8A8",
	// Row 2
	"D8D8D8",
	"E8C07D",
	"F0D97A",
	"CDE07A",
	"7BC96F",
	"6BC4B2",
	"5BBAD6",
	"D9A7E0",
	"F7B6C2",
	"F47C6C",
	// Row 3
	"C0C0C0",
	"D9A441",
	"F4C542",
	"D4C86A",
	"8FD14F",
	"58B88A",
	"6FA8DC",
	"B4A7D6",
	"F06277",
	"FF6F61",
	// Row 4
	"A8A8A8",
	"D29B62",
	"F2CF75",
	"D8C47A",
	"8DB600",
	"66C2A5",
	"4DA3D9",
	"C27BA0",
	"D35D6E",
	"FF4C3B",
	// Row 5
	"9A9A9A",
	"C77800",
	"F4B183",
	"D6BF3A",
	"3FA34D",
	"4CA3A3",
	"7EA6E0",
	"B56576",
	"FF1744",
	"FF2A00",
	// Row 6
	"8A817C",
	"B85C1E",
	"FF8C00",
	"D2B48C",
	"2E8B57",
	"2F7E8C",
	"2E86C1",
	"7D5BA6",
	"C2185B",
	"E0193A",
	// Row 7
	"6E6E6E",
	"95543A",
	"F4A460",
	"B7A369",
	"3B7A0A",
	"1F6F78",
	"3F51B5",
	"673AB7",
	"B71C1C",
	"C91F3A",
	// Row 8
	"3E3E3E",
	"8B5A2B",
	"F0986C",
	"9E8F2A",
	"0B5D3B",
	"0E3A44",
	"1F2A44",
	"4B2E2E",
	"9C1B1B",
	"7A3B2E",
	// Row 9
	"2E2E2E",
	"7A4A2A",
	"A86A1D",
	"6E6B2A",
	"2F6F55",
	"004E52",
	"1C2F6E",
	"3A1F4D",
	"A52A2A",
	"8B4513",
	// Row 10
	"000000",
	"5A2E0C",
	"7B3F00",
	"5C4A00",
	"004225",
	"003B44",
	"0A1F44",
	"2B1B3F",
	"7B2D2D",
	"8B3A0E",
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
