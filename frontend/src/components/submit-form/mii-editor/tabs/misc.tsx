import { useState } from "react";
import type { MiiGender, SwitchMiiInstructions } from "@tomodachi-share/shared";
import EnhancedSlider from "../enhanced-slider";
import DatingPreferencesViewer from "../../../mii/dating-preferences";
import VoiceViewer from "../../../mii/voice-viewer";
import PersonalityViewer from "../../../mii/personality-viewer";

interface Props {
	instructions: React.RefObject<SwitchMiiInstructions>;
}

export default function MiscTab({ instructions }: Props) {
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
							<EnhancedSlider
								label="Height"
								value={height}
								onChange={(v) => {
									setHeight(v);
									instructions.current.height = v;
								}}
								min={0}
								max={128}
								mid={64}
							/>
						</div>

						<div className="flex flex-col">
							<EnhancedSlider
								label="Weight"
								value={weight}
								onChange={(v) => {
									setWeight(v);
									instructions.current.weight = v;
								}}
								min={0}
								max={128}
								mid={64}
							/>
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
							onChange={(v, label) => {
								setVoice((p) => ({ ...p, [label]: v }));
								instructions.current.voice[label as keyof typeof voice] = v;
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
									max={1000}
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
					}}
				/>
			</div>
		</>
	);
}
