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
								title: "Submitting",
								steps: [
									{
										text: "1. Press X to open the menu, then select 'Residents'",
										imageSrc: "/tutorial/switch/submitting/step1.jpg",
									},
									{
										text: "2. Find the Mii you want to submit and edit it",
										imageSrc: "/tutorial/switch/submitting/step2.jpg",
									},
									{
										text: "3. Press Y to open the parts list, take a screenshot then upload to this submit form",
										imageSrc: "/tutorial/switch/submitting/step3.jpg",
									},
									{
										text: "4. Adding Mii colors and settings is recommended. All instructions are optional; for values like height or distance, use the number of button clicks (positive for up/left, negative for down/right)",
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
