"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import Tutorial from ".";

export default function SubmitTutorialButton() {
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
								title: "Mii Instructions",
								steps: [
									{
										text: "1. Press X to open the menu, then select 'Add a Mii' (or 'Residents' if you're submitting an existing Mii)",
										imageSrc: "/tutorial/switch/step1.jpg",
									},
									{
										text: "2. Press 'From scratch' and choose the Male template (instructions may be slightly inaccurate if you select Female, it's fine if you change all defaults)",
										imageSrc: "/tutorial/switch/step2.jpg",
									},
									{
										text: "3. Customize your Mii to your liking",
										imageSrc: "/tutorial/switch/step3.jpg",
									},
									{
										text: "4. All instructions are optional but if you want to add height, distance, etc. the value will be relative to how many times you clicked the button - positive for up/left, negative for down/right",
										imageSrc: "/tutorial/switch/step4.jpg",
									},
									{
										text: "5. Upload instructions, then screenshot the Mii for the portrait (feel free to crop it)",
										imageSrc: "/tutorial/switch/step5.jpg",
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
