import { type ChangeEvent } from "react";
import { type MiiGender, type SwitchMiiInstructions } from "@tomodachi-share/shared";

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
					<div key={gender} className="flex gap-1.5">
						<input
							type="checkbox"
							id={gender}
							className="checkbox"
							checked={data.includes(genderEnum)}
							{...(onChecked ? { onChange: (e: ChangeEvent<HTMLInputElement>) => onChecked(e, genderEnum) } : { readOnly: true })}
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
