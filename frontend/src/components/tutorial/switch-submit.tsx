import { useState } from "react";
import { createPortal } from "react-dom";
import Tutorial from ".";

interface Props {
	type: "savedata" | "manual";
}

export default function SwitchSubmitTutorialButton({ type }: Props) {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<>
			<button type="button" onClick={() => setIsOpen(true)} className="text-sm text-orange-400 cursor-pointer underline-offset-2 hover:underline">
				How to?
			</button>

			{isOpen &&
				createPortal(
					<Tutorial
						tutorials={[
							{
								title: "Submitting",
								steps:
									type === "savedata"
										? [
												{
													text: "1. Download ShareMii  - click here for link",
													link: "https://gamebanana.com/tools/22305",
													imageSrc: "/tutorial/switch/adding-mii/modded/step1.jpg",
												},
												{
													text: "2. Follow the instructions by the creator (scroll down to exporting) - click here for link",
													link: "https://docs.google.com/document/d/e/2PACX-1vRSaPbTe0pijDSETzdeGhvQ7zYHlx9Qnxn7WdUqG9cveZYyk405A0LSbYnl8ygTNI_ZZqMrIZLeHenr/pub",
													imageSrc: "/tutorial/switch/adding-mii/modded/step3.jpg",
												},
												{ type: "finish" },
											]
										: [
												{
													text: "1. Press X to open the menu, then select 'Residents'",
													imageSrc: "/tutorial/switch/submitting/step1.jpg",
												},
												{
													text: "2. Find the Mii you want to submit and edit it",
													imageSrc: "/tutorial/switch/submitting/step2.jpg",
												},
												{
													text: "3. Press Y to open the features list, then take a screenshot and upload to this submit form",
													imageSrc: "/tutorial/switch/submitting/step3.jpg",
												},
												{
													text: "4. Adding Mii colors and settings is recommended. All instructions are optional; for values like height or distance, use the number of button clicks (positive for buttons on right, negative for buttons on left)",
													imageSrc: "/tutorial/switch/step4.jpg",
												},
												{ type: "finish" },
											],
							},
						]}
						isOpen={isOpen}
						setIsOpen={setIsOpen}
					/>,
					document.body,
				)}
		</>
	);
}
