import { useState } from "react";
import { MiiGender } from "@prisma/client";

import DatingPreferencesViewer from "@/components/mii/dating-preferences";
import VoiceViewer from "@/components/mii/voice-viewer";
import PersonalityViewer from "@/components/mii/personality-viewer";

import { SwitchMiiInstructions } from "@/types";

interface Props {
	instructions: React.RefObject<SwitchMiiInstructions>;
}

export default function HeadTab({ instructions }: Props) {
	const [height, setHeight] = useState(instructions.current.height ?? 64);
	const [weight, setWeight] = useState(instructions.current.weight ?? 64);
	const [datingPreferences, setDatingPreferences] = useState<MiiGender[]>(instructions.current.datingPreferences ?? []);
	const [voice, setVoice] = useState({
		speed: instructions.current.voice.speed ?? 25,
		pitch: instructions.current.voice.pitch ?? 25,
		depth: instructions.current.voice.depth ?? 25,
		delivery: instructions.current.voice.delivery ?? 25,
		tone: instructions.current.voice.tone ?? 0,
	});
	const [birthday, setBirthday] = useState({
		day: instructions.current.birthday.day ?? (null as number | null),
		month: instructions.current.birthday.month ?? (null as number | null),
		age: instructions.current.birthday.age ?? (null as number | null),
		dontAge: instructions.current.birthday.dontAge,
	});
	const [personality, setPersonality] = useState({
		movement: instructions.current.personality.movement ?? -1,
		speech: instructions.current.personality.speech ?? -1,
		energy: instructions.current.personality.energy ?? -1,
		thinking: instructions.current.personality.thinking ?? -1,
		overall: instructions.current.personality.overall ?? -1,
	});

	return (
		<>
			<h1 className="font-bold text-xl">Misc</h1>

			<div className="grow h-full overflow-y-auto pb-3">
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<div>
						<div className="flex items-center gap-4 text-zinc-500 text-sm font-medium">
							<hr className="grow border-zinc-300" />
							<span>Body</span>
							<hr className="grow border-zinc-300" />
						</div>

						<div className="flex flex-col">
							<label htmlFor="height" className="text-sm">
								Height
							</label>
							<div className="relative h-5 flex justify-center items-center">
								<input
									type="range"
									id="height"
									className="grow z-10"
									min={0}
									max={128}
									step={1}
									value={height}
									onChange={(e) => {
										setHeight(e.target.valueAsNumber);
										instructions.current.height = e.target.valueAsNumber;
									}}
								/>
								<div className="absolute h-4 w-1.5 rounded bg-orange-400 z-0"></div>
							</div>
						</div>

						<div className="flex flex-col">
							<label htmlFor="weight" className="text-sm">
								Weight
							</label>
							<div className="relative h-5 flex justify-center items-center">
								<input
									type="range"
									id="weight"
									className="grow z-10"
									min={0}
									max={128}
									step={1}
									value={weight}
									onChange={(e) => {
										setWeight(e.target.valueAsNumber);
										instructions.current.weight = e.target.valueAsNumber;
									}}
								/>
								<div className="absolute h-4 w-1.5 rounded bg-orange-400 z-0"></div>
							</div>
						</div>

						<div className="flex items-center gap-4 text-zinc-500 text-sm font-medium mt-1.5 mb-2">
							<hr className="grow border-zinc-300" />
							<span>Dating Preferences</span>
							<hr className="grow border-zinc-300" />
						</div>

						<div className="flex flex-col gap-1.5">
							<DatingPreferencesViewer
								data={datingPreferences}
								onChecked={(e, gender) => {
									setDatingPreferences((prev) => {
										const updated = e.target.checked ? (prev.includes(gender) ? prev : [...prev, gender]) : prev.filter((p) => p !== gender);
										instructions.current.datingPreferences = updated;
										return updated;
									});
								}}
							/>
						</div>
					</div>

					<div>
						<div className="flex items-center gap-4 text-zinc-500 text-sm font-medium">
							<hr className="grow border-zinc-300" />
							<span>Voice</span>
							<hr className="grow border-zinc-300" />
						</div>

						<VoiceViewer
							data={voice}
							onChange={(e, label) => {
								setVoice((p) => ({ ...p, [label]: e.target.valueAsNumber }));
								instructions.current.voice[label as keyof typeof voice] = e.target.valueAsNumber;
							}}
							onClickTone={(i) => {
								setVoice((p) => ({ ...p, tone: i }));
								instructions.current.voice.tone = i;
							}}
						/>

						<div className="flex items-center gap-4 text-zinc-500 text-sm font-medium mt-1.5 mb-2">
							<hr className="grow border-zinc-300" />
							<span>Birthday</span>
							<hr className="grow border-zinc-300" />
						</div>

						<div className="grid grid-cols-3 gap-2">
							<div>
								<label htmlFor="day" className="text-xs">
									Day
								</label>
								<input
									type="number"
									id="day"
									min={1}
									max={31}
									className="pill input text-sm py-1! px-3! w-full"
									value={birthday.day ?? undefined}
									onChange={(e) => {
										setBirthday((p) => ({ ...p, day: e.target.valueAsNumber }));
										instructions.current.birthday.day = e.target.valueAsNumber;
									}}
								/>
							</div>
							<div>
								<label htmlFor="month" className="text-xs">
									Month
								</label>
								<input
									type="number"
									id="month"
									min={1}
									max={12}
									className="pill input text-sm py-1! px-3! w-full"
									value={birthday.month ?? undefined}
									onChange={(e) => {
										setBirthday((p) => ({ ...p, month: e.target.valueAsNumber }));
										instructions.current.birthday.month = e.target.valueAsNumber;
									}}
								/>
							</div>
							<div>
								<label htmlFor="age" className="text-xs">
									Age
								</label>
								<input
									type="number"
									id="age"
									min={1}
									max={100}
									className="pill input text-sm py-1! px-3! w-full"
									value={birthday.age ?? undefined}
									onChange={(e) => {
										setBirthday((p) => ({ ...p, age: e.target.valueAsNumber }));
										instructions.current.birthday.age = e.target.valueAsNumber;
									}}
								/>
							</div>
							<div className="flex gap-1.5 col-span-2">
								<input
									type="checkbox"
									id="dontAge"
									className="checkbox"
									checked={birthday.dontAge}
									onChange={(e) => {
										setBirthday((p) => ({ ...p, dontAge: e.target.checked }));
										instructions.current.birthday.dontAge = e.target.checked;
									}}
								/>
								<label htmlFor="dontAge" className="text-sm select-none">
									Don't Age
								</label>
							</div>
						</div>
					</div>
				</div>

				<div className="flex items-center gap-4 text-zinc-500 text-sm font-medium mt-2 mb-2">
					<hr className="grow border-zinc-300" />
					<span>Personality</span>
					<hr className="grow border-zinc-300" />
				</div>

				<PersonalityViewer
					data={personality}
					onClick={(key, i) => {
						setPersonality((p) => {
							const updated = { ...p, [key]: i };
							instructions.current.personality = updated;
							return updated;
						});
						instructions.current.personality = personality;
					}}
				/>
			</div>
		</>
	);
}
