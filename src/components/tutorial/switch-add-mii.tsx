"use client";

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
								title: "Adding Mii",
								steps: [
									{
										text: "1. Press X to open the menu, then select 'Add a Mii'",
										imageSrc: "/tutorial/switch/adding-mii/step1.jpg",
									},
									{
										text: "2. Press 'From scratch' and choose the Male template",
										imageSrc: "/tutorial/switch/adding-mii/step2.jpg",
									},
									{
										text: "3. Click on the features image on this page to zoom it in and add all features on the mii editor",
										imageSrc: "/tutorial/switch/adding-mii/step3.png",
									},
									{
										text: "4. If the author added instructions, follow them (not all instructions will be there, check next slide for more)",
										imageSrc: "/tutorial/switch/adding-mii/step4.jpg",
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
