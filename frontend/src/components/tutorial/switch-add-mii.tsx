import { useState } from "react";
import { createPortal } from "react-dom";
import { Icon } from "@iconify/react";
import Tutorial from ".";

export default function SwitchAddMiiTutorialButton() {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<>
			<button aria-label="Tutorial" type="button" onClick={() => setIsOpen(true)} className="text-3xl cursor-pointer">
				<Icon icon="fa:question-circle" />
				<span>Tutorial</span>
			</button>

			{isOpen &&
				createPortal(
					<Tutorial
						tutorials={[
							{
								title: "ShareMii (Modded)",
								thumbnail: "/tutorial/switch/adding-mii/modded/thumbnail.png",
								steps: [
									{ type: "start" },
									{
										text: "1. Download ShareMii  - click here for link",
										link: "https://gamebanana.com/tools/22305",
										imageSrc: "/tutorial/switch/adding-mii/modded/step1.jpg",
									},
									{
										text: "2. Download the .ltd file, it is above the instructions next to all the other buttons",
										imageSrc: "/tutorial/switch/adding-mii/modded/step2.png",
									},
									{
										text: "3. Follow the instructions by the creator (scroll down to importing) - click here for link",
										link: "https://docs.google.com/document/d/e/2PACX-1vRSaPbTe0pijDSETzdeGhvQ7zYHlx9Qnxn7WdUqG9cveZYyk405A0LSbYnl8ygTNI_ZZqMrIZLeHenr/pub",
										imageSrc: "/tutorial/switch/adding-mii/modded/step3.jpg",
									},
									{ type: "finish" },
								],
							},
							{
								title: "Manual",
								thumbnail: "/tutorial/switch/adding-mii/manual/thumbnail.png",
								steps: [
									{ type: "start" },
									{
										text: "1. Press X to open the menu, then select 'Add a Mii'",
										imageSrc: "/tutorial/switch/adding-mii/manual/step1.jpg",
									},
									{
										text: "2. Press 'From scratch' and choose the Male template",
										imageSrc: "/tutorial/switch/adding-mii/manual/step2.jpg",
									},
									{
										text: "3. Click on the features image on this page to zoom it in and add all features on the mii editor (This won't work if the Mii is from a save file! You can see the icons in the instructions)",
										imageSrc: "/tutorial/switch/adding-mii/manual/step3.png",
									},
									{
										text: "4. If the Mii has instructions, follow them (not all instructions will be there if not from save data, check next slide for more)",
										imageSrc: "/tutorial/switch/adding-mii/manual/step4.jpg",
									},
									{
										text: "5. For instructions like height or distance, use the number of button clicks (positive for buttons on right, negative for buttons on left)",
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
