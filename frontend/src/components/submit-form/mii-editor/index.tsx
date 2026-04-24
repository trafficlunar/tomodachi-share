import { type SwitchMiiInstructions } from "@tomodachi-share/shared";
import React, { useState } from "react";
import { Icon } from "@iconify/react";

import HeadTab from "./tabs/head";
import HairTab from "./tabs/hair";
import EyebrowsTab from "./tabs/eyebrows";
import EyesTab from "./tabs/eyes";
import NoseTab from "./tabs/nose";
import LipsTab from "./tabs/lips";
import EarsTab from "./tabs/ears";
import GlassesTab from "./tabs/glasses";
import OtherTab from "./tabs/other";
import MiscTab from "./tabs/misc";

interface Props {
	instructions: React.RefObject<SwitchMiiInstructions>;
}

type Tab = "head" | "hair" | "eyebrows" | "eyes" | "nose" | "lips" | "ears" | "glasses" | "other" | "misc";

export const TAB_ICONS: Record<Tab, string> = {
	head: "mingcute:head-fill",
	hair: "mingcute:hair-fill",
	eyebrows: "material-symbols:eyebrow",
	eyes: "mdi:eye",
	nose: "mingcute:nose-fill",
	lips: "material-symbols-light:lips",
	ears: "ion:ear",
	glasses: "solar:glasses-bold",
	other: "mdi:sparkles",
	misc: "material-symbols:settings",
};

export const TAB_COMPONENTS: Record<Tab, React.ComponentType<any>> = {
	head: HeadTab,
	hair: HairTab,
	eyebrows: EyebrowsTab,
	eyes: EyesTab,
	nose: NoseTab,
	lips: LipsTab,
	ears: EarsTab,
	glasses: GlassesTab,
	other: OtherTab,
	misc: MiscTab,
};

export default function MiiEditor({ instructions }: Props) {
	const [tab, setTab] = useState<Tab>("head");

	return (
		<>
			<div className="w-full h-91 flex flex-col sm:flex-row bg-orange-100 border-2 border-orange-200 rounded-xl overflow-hidden">
				<div className="w-full flex flex-row sm:flex-col max-sm:max-h-9 sm:max-w-9">
					{(Object.keys(TAB_COMPONENTS) as Tab[]).map((t) => (
						<button
							key={t}
							type="button"
							onClick={() => setTab(t)}
							className={`size-full aspect-square flex justify-center items-center text-[1.35rem] cursor-pointer bg-orange-200 hover:bg-orange-300 transition-colors duration-75 ${tab === t ? "bg-orange-100!" : ""}`}
						>
							{/* ml because of border on left causing icons to look miscentered */}
							<Icon icon={TAB_ICONS[t]} className="-ml-0.5" />
						</button>
					))}
				</div>

				{/* Keep all tabs loaded to avoid flickering */}
				{(Object.keys(TAB_COMPONENTS) as Tab[]).map((t) => {
					const TabComponent = TAB_COMPONENTS[t];
					return (
						<div key={t} className={t === tab ? "grow relative p-3 min-h-0" : "hidden"}>
							<TabComponent instructions={instructions} />
						</div>
					);
				})}
			</div>
		</>
	);
}
