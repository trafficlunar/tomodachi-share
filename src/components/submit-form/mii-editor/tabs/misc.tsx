import { useState } from "react";
import { SwitchMiiInstructions } from "@/types";
import { MiiGender } from "@prisma/client";

interface Props {
	instructions: React.RefObject<SwitchMiiInstructions>;
}

const VOICE_SETTINGS: string[] = ["Speed", "Pitch", "Depth", "Delivery"];
const PERSONALITY_SETTINGS: { label: string; left: string; right: string }[] = [
	{ label: "Movement", left: "Slow", right: "Quick" },
	{ label: "Speech", left: "Polite", right: "Honest" },
	{ label: "Energy", left: "Flat", right: "Varied" },
	{ label: "Thinking", left: "Serious", right: "Chill" },
	{ label: "Overall", left: "Normal", right: "Quirky" },
];

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
		<div className="relative grow p-3 pb-0!">
			<div className="flex h-full">
				<div className="grow flex flex-col">
					<div className="flex items-center h-8">
						<h1 className="font-bold text-xl">Misc</h1>
					</div>

					<div className="grow overflow-y-auto">
						<div className="grid grid-cols-2 gap-4">
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
									<div className="flex gap-1.5">
										<input
											type="checkbox"
											id="male"
											className="checkbox"
											checked={datingPreferences.includes("MALE")}
											onChange={(e) => {
												setDatingPreferences((prev) =>
													e.target.checked ? (prev.includes("MALE") ? prev : [...prev, "MALE"]) : prev.filter((p) => p !== "MALE"),
												);
												instructions.current.datingPreferences = datingPreferences;
											}}
										/>
										<label htmlFor="male" className="text-sm">
											Male
										</label>
									</div>

									<div className="flex gap-1.5">
										<input
											type="checkbox"
											id="female"
											className="checkbox"
											checked={datingPreferences.includes("FEMALE")}
											onChange={(e) => {
												setDatingPreferences((prev) =>
													e.target.checked ? (prev.includes("FEMALE") ? prev : [...prev, "FEMALE"]) : prev.filter((p) => p !== "FEMALE"),
												);
												instructions.current.datingPreferences = datingPreferences;
											}}
										/>
										<label htmlFor="female" className="text-sm">
											Female
										</label>
									</div>

									<div className="flex gap-1.5">
										<input
											type="checkbox"
											id="nonbinary"
											className="checkbox"
											checked={datingPreferences.includes("NONBINARY")}
											onChange={(e) => {
												setDatingPreferences((prev) =>
													e.target.checked ? (prev.includes("NONBINARY") ? prev : [...prev, "NONBINARY"]) : prev.filter((p) => p !== "NONBINARY"),
												);
												instructions.current.datingPreferences = datingPreferences;
											}}
										/>
										<label htmlFor="nonbinary" className="text-sm">
											Nonbinary
										</label>
									</div>
								</div>
							</div>

							<div>
								<div className="flex items-center gap-4 text-zinc-500 text-sm font-medium">
									<hr className="grow border-zinc-300" />
									<span>Voice</span>
									<hr className="grow border-zinc-300" />
								</div>

								<div className="flex flex-col gap-1">
									{VOICE_SETTINGS.map((label) => (
										<div key={label} className="flex gap-3">
											<label htmlFor={label} className="text-sm w-14">
												{label}
											</label>
											<input
												type="range"
												name={label}
												className="grow"
												min={0}
												max={100}
												step={1}
												value={voice[label as keyof typeof voice]}
												onChange={(e) => {
													setVoice((p) => ({ ...p, [label]: e.target.valueAsNumber }));
													instructions.current.voice[label as keyof typeof voice] = e.target.valueAsNumber;
												}}
											/>
										</div>
									))}

									<div className="flex gap-3">
										<label htmlFor="delivery" className="text-sm w-14">
											Tone
										</label>
										<div className="grid grid-cols-6 gap-1 grow">
											{Array.from({ length: 6 }).map((_, i) => (
												<button
													type="button"
													key={i}
													onClick={() => {
														setVoice((p) => ({ ...p, tone: i }));
														instructions.current.voice.tone = i;
													}}
													className={`cursor-pointer hover:bg-orange-300 transition-colors duration-100 rounded-xl ${voice.tone === i ? "bg-orange-400!" : ""}`}
												>
													{i + 1}
												</button>
											))}
										</div>
									</div>
								</div>
							</div>
						</div>

						<div className="flex items-center gap-4 text-zinc-500 text-sm font-medium mt-2 mb-2">
							<hr className="grow border-zinc-300" />
							<span>Personality</span>
							<hr className="grow border-zinc-300" />
						</div>

						<div className="flex flex-col gap-1.5 mb-3">
							{PERSONALITY_SETTINGS.map(({ label, left, right }) => {
								const key = label.toLowerCase() as keyof typeof personality;
								return (
									<div key={label} className="flex justify-center items-center gap-2">
										<span className="text-sm font-bold w-24 shrink-0">{label}</span>
										<span className="text-sm text-zinc-500 w-14 text-right">{left}</span>
										<div className="flex gap-0.5">
											{Array.from({ length: 6 }).map((_, i) => {
												const colors = ["bg-green-400", "bg-green-300", "bg-teal-200", "bg-orange-200", "bg-orange-300", "bg-orange-400"];
												return (
													<button
														key={i}
														type="button"
														onClick={() => {
															setPersonality((p) => ({ ...p, [key]: i }));
															instructions.current.personality = personality;
														}}
														className={`size-7 cursor-pointer rounded-lg transition-opacity duration-100 border-orange-500
                  ${colors[i]} ${personality[key] === i ? "border-2 opacity-100" : "opacity-70"}`}
													></button>
												);
											})}
										</div>
										<span className="text-sm text-zinc-500 w-12 shrink-0">{right}</span>
									</div>
								);
							})}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
