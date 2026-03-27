import React from "react";

import DatingPreferencesViewer from "./dating-preferences";
import VoiceViewer from "./voice-viewer";
import PersonalityViewer from "./personality-viewer";

import { SwitchMiiInstructions } from "@/types";
import { Icon } from "@iconify/react";
import { COLORS } from "@/lib/switch";

interface Props {
	instructions: Partial<SwitchMiiInstructions>;
}

interface SectionProps {
	name: string;
	instructions: Partial<SwitchMiiInstructions[keyof SwitchMiiInstructions]>;
	children?: React.ReactNode;
	isSubSection?: boolean;
}

const ORDINAL_SUFFIXES: Record<string, string> = {
	one: "st",
	two: "nd",
	few: "rd",
	other: "th",
};
const ordinalRules = new Intl.PluralRules("en-US", { type: "ordinal" });

function GridPosition({ index, cols = 5 }: { index: number; cols?: number }) {
	const row = Math.floor(index / cols) + 1;
	const col = (index % cols) + 1;
	const rowSuffix = ORDINAL_SUFFIXES[ordinalRules.select(row)];
	const colSuffix = ORDINAL_SUFFIXES[ordinalRules.select(col)];

	return `${row}${rowSuffix} row, ${col}${colSuffix} column`;
}

function ColorPosition({ color }: { color: number }) {
	if (!color) return null;
	if (color <= 7) {
		return (
			<span className="flex items-center">
				<div className="size-5 rounded mr-1.5" style={{ backgroundColor: `#${COLORS[color]}` }}></div>
				Color menu on left, <GridPosition index={color} cols={1} />
			</span>
		);
	}
	if (color >= 108) {
		return (
			<span className="flex items-center">
				<div className="size-5 rounded mr-1.5" style={{ backgroundColor: `#${COLORS[color]}` }}></div>
				Outside color menu, <GridPosition index={color - 108} cols={2} />
			</span>
		);
	}

	return (
		<span className="flex items-center">
			<div className="size-5 rounded mr-1.5" style={{ backgroundColor: `#${COLORS[color]}` }}></div>
			Color menu on right, <GridPosition index={color - 8} cols={10} />
		</span>
	);
}

interface TableCellProps {
	label: string;
	children: React.ReactNode;
}

function TableCell({ label, children }: TableCellProps) {
	return (
		<tr className={"border-b border-orange-300/50 last:border-0"}>
			<td className={"py-0.5 pr-6 text-amber-700 font-semibold w-30 text-sm"}>{label}</td>
			<td className={"py-0.5 text-amber-950"}>{children}</td>
		</tr>
	);
}

function Section({ name, instructions, children, isSubSection }: SectionProps) {
	if (typeof instructions !== "object" || !instructions) return null;

	const color = "color" in instructions ? instructions.color : undefined;
	const height = "height" in instructions ? instructions.height : undefined;
	const distance = "distance" in instructions ? instructions.distance : undefined;
	const rotation = "rotation" in instructions ? instructions.rotation : undefined;
	const size = "size" in instructions ? instructions.size : undefined;
	const stretch = "stretch" in instructions ? instructions.stretch : undefined;

	return (
		<div className={`p-3 ${isSubSection ? "not-first:mt-2 pt-0!" : "border-l-4 border-amber-400 bg-amber-100/50 rounded-r-lg py-2.5"}`}>
			<h3 className="font-semibold text-xl text-amber-800 mb-1">{name}</h3>

			<table className="w-full">
				<tbody>
					{color && (
						<TableCell label="Color">
							<ColorPosition color={color} />
						</TableCell>
					)}
					{height && <TableCell label="Height">{height}</TableCell>}
					{distance && <TableCell label="Distance">{distance}</TableCell>}
					{rotation && <TableCell label="Rotation">{rotation}</TableCell>}
					{size && <TableCell label="Size">{size}</TableCell>}
					{stretch && <TableCell label="Stretch">{stretch}</TableCell>}

					{children}
				</tbody>
			</table>
		</div>
	);
}

export default function MiiInstructions({ instructions }: Props) {
	if (Object.keys(instructions).length === 0) return null;
	const { head, hair, eyebrows, eyes, nose, lips, ears, glasses, other, height, weight, birthday, datingPreferences, voice, personality } = instructions;

	return (
		<div className="bg-amber-50 border-2 border-amber-500 rounded-2xl shadow-lg p-4 flex flex-col gap-3 max-h-96 overflow-y-auto">
			<h2 className="text-xl font-semibold text-amber-700 flex items-center gap-2">
				<Icon icon="fa7-solid:list" />
				Instructions
			</h2>

			{head && (
				<Section name="Head" instructions={head}>
					{head.skinColor && (
						<TableCell label="Skin Color">
							<ColorPosition color={head.skinColor} />
						</TableCell>
					)}
				</Section>
			)}
			{hair && (
				<Section name="Hair" instructions={hair}>
					{hair.subColor && (
						<TableCell label="Sub Color">
							<ColorPosition color={hair.subColor} />
						</TableCell>
					)}
					{hair.subColor2 && (
						<TableCell label="Sub Color (Back)">
							<ColorPosition color={hair.subColor2} />
						</TableCell>
					)}
					{hair.style && <TableCell label="Tying Style">{hair.style}</TableCell>}
					{hair.isFlipped && <TableCell label="Flipped">{hair.isFlipped ? "Yes" : "No"}</TableCell>}
				</Section>
			)}
			{eyebrows && <Section name="Eyebrows" instructions={eyebrows}></Section>}
			{eyes && (
				<Section name="Eyes" instructions={eyes}>
					<Section isSubSection name="Tab 1" instructions={eyes.main} />
					<Section isSubSection name="Tab 2" instructions={eyes.eyelashesTop} />
					<Section isSubSection name="Tab 3" instructions={eyes.eyelashesBottom} />
					<Section isSubSection name="Tab 4" instructions={eyes.eyelidTop} />
					<Section isSubSection name="Tab 5" instructions={eyes.eyelidBottom} />
					<Section isSubSection name="Tab 6" instructions={eyes.eyeliner} />
					<Section isSubSection name="Tab 7" instructions={eyes.pupil} />
				</Section>
			)}
			{nose && <Section name="Nose" instructions={nose}></Section>}
			{lips && (
				<Section name="Lips" instructions={lips}>
					{lips.hasLipstick && <TableCell label="Lipstick">{lips.hasLipstick ? "Yes" : "No"}</TableCell>}
				</Section>
			)}
			{ears && <Section name="Ears" instructions={ears}></Section>}
			{glasses && (
				<Section name="Glasses" instructions={glasses}>
					{glasses.ringColor && (
						<TableCell label="Ring Color">
							<ColorPosition color={glasses.ringColor} />
						</TableCell>
					)}
					{glasses.shadesColor && (
						<TableCell label="Shades Color">
							<ColorPosition color={glasses.shadesColor} />
						</TableCell>
					)}
				</Section>
			)}
			{other && (
				<Section name="Other" instructions={other}>
					<Section isSubSection name="Tab 1" instructions={other.wrinkles1} />
					<Section isSubSection name="Tab 2" instructions={other.wrinkles2} />
					<Section isSubSection name="Tab 3" instructions={other.beard} />
					<Section isSubSection name="Tab 4" instructions={other.moustache}>
						{other.moustache && other.moustache.isFlipped && <TableCell label="Flipped">{other.moustache.isFlipped ? "Yes" : "No"}</TableCell>}
					</Section>
					<Section isSubSection name="Tab 5" instructions={other.goatee} />
					<Section isSubSection name="Tab 6" instructions={other.mole} />
					<Section isSubSection name="Tab 7" instructions={other.eyeShadow} />
					<Section isSubSection name="Tab 8" instructions={other.blush} />
				</Section>
			)}

			{(height || weight || datingPreferences || voice || personality) && (
				<div className="pl-3 text-sm border-l-4 border-amber-400 bg-amber-100/50 rounded-r-lg py-2.5 text-amber-950">
					<h3 className="font-semibold text-xl text-amber-800 mb-1">Misc</h3>

					{height && (
						<div className="flex mb-1">
							<label htmlFor="height" className="w-16">
								Height
							</label>
							<div className="relative h-5 flex justify-center items-center">
								<input id="height" type="range" min={0} max={128} step={1} disabled value={height} />
								<div className="absolute h-4 w-1.5 rounded bg-orange-400 z-0"></div>
							</div>
						</div>
					)}
					{weight && (
						<div className="flex">
							<label htmlFor="weight" className="w-16">
								Weight
							</label>
							<div className="relative h-5 flex justify-center items-center">
								<input id="weight" type="range" min={0} max={128} step={1} disabled value={weight} />
								<div className="absolute h-4 w-1.5 rounded bg-orange-400 z-0"></div>
							</div>
						</div>
					)}
					{birthday && (
						<div className="pl-2 not-nth-2:mt-4">
							<h4 className="font-semibold text-xl text-amber-800 mb-1">Birthday</h4>
							<table className="w-full">
								<tbody>
									{birthday.day && <TableCell label="Day">{birthday.day}</TableCell>}
									{birthday.month && <TableCell label="Month">{birthday.month}</TableCell>}
									{birthday.age && <TableCell label="Age">{birthday.age}</TableCell>}
									{birthday.dontAge && <TableCell label="Don't Age">{birthday.dontAge ? "Yes" : "No"}</TableCell>}
								</tbody>
							</table>
						</div>
					)}
					{datingPreferences && (
						<div className="pl-2 not-nth-2:mt-4">
							<h4 className="font-semibold text-xl text-amber-800 mb-1">Dating Preferences</h4>
							<div className="w-min">
								<DatingPreferencesViewer data={datingPreferences} />
							</div>
						</div>
					)}
					{voice && (
						<div className="pl-2 not-nth-2:mt-4">
							<h4 className="font-semibold text-xl text-amber-800 mb-1">Voice</h4>
							<div className="w-min">
								<VoiceViewer data={voice} />
							</div>
						</div>
					)}
					{personality && (
						<div className="pl-2 not-nth-2:mt-4">
							<h4 className="font-semibold text-xl text-amber-800 mb-1">Personality</h4>
							<div className="w-min">
								<PersonalityViewer data={personality} />
							</div>
						</div>
					)}
				</div>
			)}
		</div>
	);
}
