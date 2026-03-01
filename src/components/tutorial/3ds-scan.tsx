"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { Icon } from "@iconify/react";
import Tutorial from ".";

export default function ThreeDsScanTutorialButton() {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<>
			<button
				aria-label="Tutorial"
				type="button"
				onClick={() => setIsOpen(true)}
				className="text-3xl cursor-pointer"
			>
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
										text: "1. Enter the town hall",
										imageSrc: "/tutorial/3ds/step1.png",
									},
									{
										text: "2. Go into 'QR Code'",
										imageSrc: "/tutorial/3ds/adding-mii/step2.png",
									},
									{
										text: "3. Press 'Scan QR Code'",
										imageSrc: "/tutorial/3ds/adding-mii/step3.png",
									},
									{
										text: "4. Click on the QR code below the Mii's image",
										imageSrc: "/tutorial/3ds/adding-mii/step4.png",
									},
									{
										text: "5. Scan with your 3DS",
										imageSrc: "/tutorial/3ds/adding-mii/step5.png",
									},
									{ type: "finish" },
								],
							},
						]}
						isOpen={isOpen}
						setIsOpen={setIsOpen}
					/>,
					document.body
				)}
		</>
	);
}
