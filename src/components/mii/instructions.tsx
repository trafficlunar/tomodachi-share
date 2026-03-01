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
			<>
				Color menu on left, <GridPosition index={color} cols={1} />
			</>
		);
	}
	if (color >= 108) {
		return (
			<>
				Outside color menu, <GridPosition index={color - 108} cols={2} />
			</>
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
	if (typeof instructions !== "object") return null;

	const type = "type" in instructions ? instructions.type : undefined;
	const color = "color" in instructions ? instructions.color : undefined;
	const height = "height" in instructions ? instructions.height : undefined;
	const distance = "distance" in instructions ? instructions.distance : undefined;
	const rotation = "rotation" in instructions ? instructions.rotation : undefined;
	const size = "size" in instructions ? instructions.size : undefined;
	const stretch = "stretch" in instructions ? instructions.stretch : undefined;

	return (
		<div className={`p-3 ${isSubSection ? "mt-2" : "border-l-4 border-amber-400 bg-amber-100/50 rounded-r-lg py-2.5"}`}>
			<h3 className="font-semibold text-xl text-amber-800 mb-1">{name}</h3>

			<table className="w-full">
				<tbody>
					{type && (
						<TableCell label="Type">
							<GridPosition index={type} />
						</TableCell>
					)}
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
	const { head, hair, eyebrows, eyes, nose, lips, ears, glasses, other, height, weight, datingPreferences, voice, personality } = instructions;

	return (
		<div className="bg-amber-50 border-2 border-amber-500 rounded-2xl shadow-lg p-4 flex flex-col gap-3 max-h-96 overflow-y-auto">
			<h2 className="text-xl font-semibold text-amber-700 flex items-center gap-2">
				<Icon icon="fa7-solid:list" />
				Instructions
			</h2>

			{head && <Section name="Head" instructions={head}></Section>}
			{hair && (
				<Section name="Hair" instructions={hair}>
					{hair.setType && (
						<TableCell label="Set Type">
							<GridPosition index={hair.setType} />
						</TableCell>
					)}
					{hair.bangsType && (
						<TableCell label="Bangs Type">
							<GridPosition index={hair.bangsType} />
						</TableCell>
					)}
					{hair.backType && (
						<TableCell label="Back Type">
							<GridPosition index={hair.backType} />
						</TableCell>
					)}
					{hair.subColor && (
						<TableCell label="Sub Color">
							<ColorPosition color={hair.subColor} />
						</TableCell>
					)}
				</Section>
			)}
			{eyebrows && <Section name="Eyebrows" instructions={eyebrows}></Section>}
			{eyes && (
				<Section name="Eyes" instructions={eyes}>
					{eyes.eyesType && (
						<TableCell label="Eyes Type">
							<GridPosition index={eyes.eyesType} />
						</TableCell>
					)}
					{eyes.eyelashesTop && (
						<TableCell label="Eyelashes Top Type">
							<GridPosition index={eyes.eyelashesTop} />
						</TableCell>
					)}
					{eyes.eyelashesBottom && (
						<TableCell label="Eyelashes Bottom Type">
							<GridPosition index={eyes.eyelashesBottom} />
						</TableCell>
					)}
					{eyes.eyelidTop && (
						<TableCell label="Eyelid Top Type">
							<GridPosition index={eyes.eyelidTop} />
						</TableCell>
					)}
					{eyes.eyelidBottom && (
						<TableCell label="Eyelid Bottom Type">
							<GridPosition index={eyes.eyelidBottom} />
						</TableCell>
					)}
					{eyes.eyeliner && (
						<TableCell label="Eyeliner Type">
							<GridPosition index={eyes.eyeliner} />
						</TableCell>
					)}
					{eyes.pupil && (
						<TableCell label="Pupil Type">
							<GridPosition index={eyes.pupil} />
						</TableCell>
					)}
				</Section>
			)}
			{nose && <Section name="Nose" instructions={nose}></Section>}
			{lips && <Section name="Lips" instructions={lips}></Section>}
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
					<Section isSubSection name="Wrinkles 1" instructions={other.wrinkles1} />
					<Section isSubSection name="Wrinkles 2" instructions={other.wrinkles2} />
					<Section isSubSection name="Beard" instructions={other.beard} />
					<Section isSubSection name="Moustache" instructions={other.moustache} />
					<Section isSubSection name="Goatee" instructions={other.goatee} />
					<Section isSubSection name="Mole" instructions={other.mole} />
					<Section isSubSection name="Eye Shadow" instructions={other.eyeShadow} />
					<Section isSubSection name="Blush" instructions={other.blush} />
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
							<input id="height" type="range" min={0} max={100} step={1} disabled value={height} />
						</div>
					)}
					{weight && (
						<div className="flex">
							<label htmlFor="weight" className="w-16">
								Weight
							</label>
							<input id="weight" type="range" min={0} max={100} step={1} disabled value={weight} />
						</div>
					)}
					{datingPreferences && (
						<div className="pl-2">
							<h4 className="text-lg font-semibold mt-4">Dating Preferences</h4>
							<div className="w-min">
								<DatingPreferencesViewer data={datingPreferences} />
							</div>
						</div>
					)}
					{voice && (
						<div className="pl-2">
							<h4 className="font-semibold text-xl text-amber-800 mb-1 mt-4">Voice</h4>
							<div className="w-min">
								<VoiceViewer data={voice} />
							</div>
						</div>
					)}
					{personality && (
						<div className="pl-2">
							<h4 className="font-semibold text-xl text-amber-800 mb-1 mt-4">Personality</h4>
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
