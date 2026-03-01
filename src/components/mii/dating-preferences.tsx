import { ChangeEvent } from "react";
import { MiiGender } from "@prisma/client";
import { SwitchMiiInstructions } from "@/types";

interface Props {
	data: SwitchMiiInstructions["datingPreferences"];
	onChecked?: (e: ChangeEvent<HTMLInputElement, HTMLInputElement>, gender: MiiGender) => void;
}

const DATING_PREFERENCES = ["Male", "Female", "Nonbinary"];

export default function DatingPreferencesViewer({ data, onChecked }: Props) {
	return (
		<div className="flex flex-col gap-1.5">
			{DATING_PREFERENCES.map((gender) => {
				const genderEnum = gender.toUpperCase() as MiiGender;

				return (
					<div className="flex gap-1.5">
						<input
							key={gender}
							type="checkbox"
							id={gender}
							className="checkbox"
							checked={data.includes(genderEnum)}
							onChange={(e) => {
								if (onChecked) onChecked(e, genderEnum);
							}}
						/>
						<label htmlFor={gender} className="text-sm select-none">
							{gender}
						</label>
					</div>
				);
			})}
		</div>
	);
}
