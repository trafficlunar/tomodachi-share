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
	const [height, setHeight] = useState(50);
	const [weight, setWeight] = useState(50);
	const [datingPreferences, setDatingPreferences] = useState<MiiGender[]>([]);
	const [voice, setVoice] = useState({
		speed: 50,
		pitch: 50,
		depth: 50,
		delivery: 50,
		tone: 0,
	});
	const [personality, setPersonality] = useState({
		movement: -1,
		speech: -1,
		energy: -1,
		thinking: -1,
		overall: -1,
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
							<input
								type="range"
								id="height"
								min={0}
								max={100}
								step={1}
								value={height}
								onChange={(e) => {
									setHeight(e.target.valueAsNumber);
									instructions.current.height = e.target.valueAsNumber;
								}}
							/>
						</div>

						<div className="flex flex-col">
							<label htmlFor="weight" className="text-sm">
								Weight
							</label>
							<input
								type="range"
								id="weight"
								min={0}
								max={100}
								step={1}
								value={weight}
								onChange={(e) => {
									setWeight(e.target.valueAsNumber);
									instructions.current.weight = e.target.valueAsNumber;
								}}
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
							onClick={(e, label) => {
								setVoice((p) => ({ ...p, [label]: e.target.valueAsNumber }));
								instructions.current.voice[label as keyof typeof voice] = e.target.valueAsNumber;
							}}
							onClickTone={(i) => {
								setVoice((p) => ({ ...p, tone: i }));
								instructions.current.voice.tone = i;
							}}
						/>
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
