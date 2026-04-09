import React from "react";
import Image from "next/image";

import DatingPreferencesViewer from "./dating-preferences";
import VoiceViewer from "./voice-viewer";
import PersonalityViewer from "./personality-viewer";

import { SwitchMiiInstructions } from "@/types";
import { COLORS } from "@/lib/switch";

interface Props {
	instructions: Partial<SwitchMiiInstructions>;
}

interface SectionProps {
	name: string;
	instructions: Partial<any>;
	iconTemplate?: string;
	pad?: number; // Number of digits to pad with zeroes
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

function not(value: any) {
	return value !== undefined && value !== null;
}

function numberValue(value: number, cutoff: number = 25) {
	return value === cutoff ? "0" : value > cutoff ? `+${value - cutoff}` : `${value - cutoff}`;
}

function GridPosition({ index, cols = 5 }: { index: number; cols?: number }) {
	const row = Math.floor(index / cols) + 1;
	const col = (index % cols) + 1;
	const rowSuffix = ORDINAL_SUFFIXES[ordinalRules.select(row)];
	const colSuffix = ORDINAL_SUFFIXES[ordinalRules.select(col)];

	return `${row}${rowSuffix} row, ${col}${colSuffix} column`;
}

function ColorPosition({ color }: { color: number | undefined | null }) {
	if (color === undefined || color === null) return null;
	if (color <= 7) {
		return (
			<span className="flex items-center">
				<div className="size-5 rounded mr-1.5 shrink-0" style={{ backgroundColor: `#${COLORS[color]}` }}></div>
				Color menu on left, <GridPosition index={color} cols={1} />
			</span>
		);
	}
	if (color >= 108) {
		return (
			<span className="flex items-center">
				<div className="size-5 rounded mr-1.5 shrink-0" style={{ backgroundColor: `#${COLORS[color]}` }}></div>
				Outside color menu, <GridPosition index={color - 108} cols={2} />
			</span>
		);
	}

	return (
		<span className="flex items-center">
			<div className="size-5 rounded mr-1.5 shrink-0" style={{ backgroundColor: `#${COLORS[color]}` }}></div>
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

function Section({ name, iconTemplate, pad = 2, instructions, children, isSubSection }: SectionProps) {
	if (typeof instructions !== "object" || !instructions) return null;

	const type = "type" in instructions ? instructions.type : undefined;
	const color = "color" in instructions ? instructions.color : undefined;
	const height = "height" in instructions ? instructions.height : undefined;
	const distance = "distance" in instructions ? instructions.distance : undefined;
	const rotation = "rotation" in instructions ? instructions.rotation : undefined;
	const size = "size" in instructions ? instructions.size : undefined;
	const stretch = "stretch" in instructions ? instructions.stretch : undefined;

	const renderIcon = type !== undefined && typeof type === "number" && iconTemplate;
	const isBooleanType = typeof type === "boolean";

	return (
		<div className={`p-3 w-max ${isSubSection ? "not-first:mt-2 pt-0!" : "border-l-4 border-amber-400 bg-amber-100/50 rounded-r-lg py-2.5 mb-4"}`}>
			<h3 className={`font-semibold text-amber-800 mb-1 ${isSubSection ? "text-lg" : "text-xl"}`}>{name}</h3>

			<table className="w-full">
				<tbody>
					{renderIcon && (
						<TableCell label="Type">
							<Image src={`/icons/MiiEditor_Face_${iconTemplate.replace("%s", type.toString().padStart(pad, "0"))}.png`} width={64} height={64} alt="icon" />
						</TableCell>
					)}
					{isBooleanType && <TableCell label="Enabled">{type ? "Yes" : "No"}</TableCell>}
					{!renderIcon && !isBooleanType && type !== undefined && <TableCell label="Type">{type}</TableCell>}

					{not(color) && (
						<TableCell label="Color">
							<ColorPosition color={color} />
						</TableCell>
					)}
					{not(height) && <TableCell label="Height">{numberValue(height, 0)}</TableCell>}
					{not(distance) && <TableCell label="Distance">{numberValue(distance, 0)}</TableCell>}
					{not(rotation) && <TableCell label="Rotation">{numberValue(rotation, 0)}</TableCell>}
					{not(size) && <TableCell label="Size">{numberValue(size, 0)}</TableCell>}
					{not(stretch) && <TableCell label="Stretch">{numberValue(stretch, 0)}</TableCell>}

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
		<>
			{head && (
				<Section name="Head" iconTemplate="Faceline%s_Uit" instructions={head}>
					{not(head.skinColor) && (
						<TableCell label="Skin Color">
							<ColorPosition color={head.skinColor} />
						</TableCell>
					)}
				</Section>
			)}

			{hair && (
				<Section name="Hair" iconTemplate="HairAll%s_Uit" pad={3} instructions={hair}>
					{not(hair.set) && (
						<TableCell label="Set">
							<Image src={`/icons/MiiEditor_Face_HairAll${String(hair.set).padStart(3, "0")}_Uit.png`} width={64} height={64} alt="icon" />
						</TableCell>
					)}
					{not(hair.bangs) && (
						<TableCell label="Bangs">
							<Image src={`/icons/MiiEditor_Face_HairFront${String(hair.bangs).padStart(3, "0")}_Uit.png`} width={64} height={64} alt="icon" />
						</TableCell>
					)}
					{not(hair.back) && (
						<TableCell label="Back">
							<Image src={`/icons/MiiEditor_Face_HairBack${String(hair.back).padStart(3, "0")}_Uit.png`} width={64} height={64} alt="icon" />
						</TableCell>
					)}
					{not(hair.subColor) && (
						<TableCell label="Sub Color">
							<ColorPosition color={hair.subColor} />
						</TableCell>
					)}
					{not(hair.subColor2) && (
						<TableCell label="Sub Color (Back)">
							<ColorPosition color={hair.subColor2} />
						</TableCell>
					)}
					{not(hair.style) && <TableCell label="Tying Style">{hair.style}</TableCell>}
					{not(hair.isFlipped) && <TableCell label="Flipped">{hair.isFlipped ? "Yes" : "No"}</TableCell>}
				</Section>
			)}

			{eyebrows && <Section name="Eyebrows" iconTemplate="Eyebrow%s_Uit" instructions={eyebrows}></Section>}

			{eyes && (
				<Section name="Eyes" instructions={eyes}>
					<Section isSubSection name="Main" iconTemplate="Eye%s_Uit" pad={3} instructions={eyes.main} />
					<Section isSubSection name="Eyelashes (Top)" iconTemplate="Eyelash%s_Uit" instructions={eyes.eyelashesTop} />
					<Section isSubSection name="Eyelashes (Bottom)" iconTemplate="EyelashLower%s_Uit" instructions={eyes.eyelashesBottom} />
					<Section isSubSection name="Eyelid (Top)" iconTemplate="EyelidUpper%s_Uit" instructions={eyes.eyelidTop} />
					<Section isSubSection name="Eyelid (Bottom)" iconTemplate="EyelidLower%s_Uit" instructions={eyes.eyelidBottom} />
					<Section isSubSection name="Eyeliner" instructions={eyes.eyeliner} />
					<Section isSubSection name="Pupil" iconTemplate="EyeHighlight%s_Uit" instructions={eyes.pupil} />
				</Section>
			)}

			{nose && <Section name="Nose" iconTemplate="Nose%s_Uit" instructions={nose}></Section>}

			{lips && (
				<Section name="Lips" iconTemplate="Mouth%s_Uit" pad={3} instructions={lips}>
					{not(lips.hasLipstick) && <TableCell label="Lipstick">{lips.hasLipstick ? "Yes" : "No"}</TableCell>}
				</Section>
			)}

			{ears && <Section name="Ears" iconTemplate="Ear%s_Uit" instructions={ears}></Section>}

			{glasses && (
				<Section name="Glasses" iconTemplate="Glass%scolor_Uit" instructions={glasses}>
					{not(glasses.type2) && <TableCell label="Type 2">{glasses.type2}</TableCell>}
					{not(glasses.ringColor) && (
						<TableCell label="Ring Color">
							<ColorPosition color={glasses.ringColor} />
						</TableCell>
					)}
					{not(glasses.shadesColor) && (
						<TableCell label="Shades Color">
							<ColorPosition color={glasses.shadesColor} />
						</TableCell>
					)}
				</Section>
			)}

			{other && (
				<Section name="Other" instructions={other}>
					<Section isSubSection name="Wrinkles 1" iconTemplate="WrinkleLower%s_Uit" instructions={other.wrinkles1} />
					<Section isSubSection name="Wrinkles 2" iconTemplate="WrinkleUpper%s_Uit" instructions={other.wrinkles2} />
					<Section isSubSection name="Beard" iconTemplate="Beard%s_Uit" instructions={other.beard} />
					<Section isSubSection name="Moustache" iconTemplate="Mustache%s_Uit" instructions={other.moustache}>
						{other.moustache && other.moustache.isFlipped !== undefined && <TableCell label="Flipped">{other.moustache.isFlipped ? "Yes" : "No"}</TableCell>}
					</Section>
					<Section isSubSection name="Goatee" iconTemplate="BeardShort%s_Uit" instructions={other.goatee} />
					<Section isSubSection name="Mole" instructions={other.mole}>
						{other.mole?.type && (
							<TableCell label="Icon">
								<Image src={`/icons/MiiEditor_Face_Mole00_Uit.png`} width={64} height={64} alt="icon" />
							</TableCell>
						)}
					</Section>
					<Section isSubSection name="Eye Shadow" iconTemplate="MakeUpper%s_Uit" instructions={other.eyeShadow} />
					<Section isSubSection name="Blush" iconTemplate="MakeLower%s_Uit" instructions={other.blush} />
				</Section>
			)}

			{(height || weight || datingPreferences || voice || personality) && (
				<div className="p-3 border-l-4 border-amber-400 bg-amber-100/50 rounded-r-lg py-2.5 text-amber-950 w-max mb-4">
					<h3 className="font-semibold text-xl text-amber-800 mb-1">Misc</h3>

					<table className="w-full">
						<tbody>
							{not(height) && <TableCell label="Height">{numberValue(height!, 64)}</TableCell>}
							{not(weight) && <TableCell label="Weight">{numberValue(weight!, 64)}</TableCell>}
						</tbody>
					</table>
					{birthday && (
						<div className="pl-2 not-nth-2:mt-4">
							<h4 className="font-semibold text-xl text-amber-800 mb-1">Birthday</h4>
							<table className="w-full">
								<tbody>
									{not(birthday.day) && <TableCell label="Day">{birthday.day}</TableCell>}
									{not(birthday.month) && <TableCell label="Month">{birthday.month}</TableCell>}
									{not(birthday.age) && <TableCell label="Age">{birthday.age}</TableCell>}
									{not(birthday.dontAge) && <TableCell label="Don't Age">{birthday.dontAge ? "Yes" : "No"}</TableCell>}
								</tbody>
							</table>
						</div>
					)}
					{voice && (
						<div className="pl-2 not-nth-2:mt-4">
							<h4 className="font-semibold text-xl text-amber-800 mb-1">Voice</h4>
							<table className="w-full">
								<tbody>
									{not(voice.speed) && <TableCell label="Speed">{numberValue(voice.speed!, 25)}</TableCell>}
									{not(voice.pitch) && <TableCell label="Pitch">{numberValue(voice.pitch!, 25)}</TableCell>}
									{not(voice.depth) && <TableCell label="Depth">{numberValue(voice.depth!, 25)}</TableCell>}
									{not(voice.delivery) && <TableCell label="Delivery">{numberValue(voice.delivery!, 25)}</TableCell>}
									{not(voice.tone) && <TableCell label="Tone">{voice.tone}</TableCell>}
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
		</>
	);
}
