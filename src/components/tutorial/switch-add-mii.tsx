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
										text: "2. Press 'From scratch' and choose the Male template (instructions may be slightly inaccurate if you select Female)",
										imageSrc: "/tutorial/switch/adding-mii/step2.jpg",
									},
									{
										text: "3. Follow all instructions (not all instructions will be there, check next slide for more)",
										imageSrc: "/tutorial/switch/adding-mii/step3.jpg",
									},
									{
										text: "4. If the instructions have height, distance, etc. the value will be relative to how many times to click the button - positive for up/left, negative for down/right",
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
