"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import Tutorial from ".";

export default function SubmitTutorialButton() {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<>
			<button
				type="button"
				onClick={() => setIsOpen(true)}
				className="text-sm text-orange-400 cursor-pointer underline-offset-2 hover:underline"
			>
				How to?
			</button>

			{isOpen &&
				createPortal(
					<Tutorial
						tutorials={[
							{
								title: "Allow Copying",
								thumbnail: "/tutorial/3ds/allow-copying/thumbnail.png",
								hint: "Suggested!",
								steps: [
									{ type: "start" },
									{
										text: "1. Enter the town hall",
										imageSrc: "/tutorial/3ds/step1.png",
									},
									{
										text: "2. Go into 'Mii List'",
										imageSrc: "/tutorial/3ds/allow-copying/step2.png",
									},
									{
										text: "3. Select and edit the Mii you wish to submit",
										imageSrc: "/tutorial/3ds/allow-copying/step3.png",
									},
									{
										text: "4. Click 'Other Settings' in the information screen",
										imageSrc: "/tutorial/3ds/allow-copying/step4.png",
									},
									{
										text: "5. Click on 'Don't Allow' under the 'Copying' text",
										imageSrc: "/tutorial/3ds/allow-copying/step5.png",
									},
									{
										text: "6. Press 'Allow'",
										imageSrc: "/tutorial/3ds/allow-copying/step6.png",
									},
									{
										text: "7. Confirm the edits to the Mii",
										imageSrc: "/tutorial/3ds/allow-copying/step7.png",
									},
									{ type: "finish" },
								],
							},
							{
								title: "Create QR Code",
								thumbnail: "/tutorial/3ds/create-qr-code/thumbnail.png",
								steps: [
									{ type: "start" },
									{
										text: "1. Enter the town hall",
										imageSrc: "/tutorial/3ds/step1.png",
									},
									{
										text: "2. Go into 'QR Code'",
										imageSrc: "/tutorial/3ds/create-qr-code/step2.png",
									},
									{
										text: "3. Press 'Create QR Code'",
										imageSrc: "/tutorial/3ds/create-qr-code/step3.png",
									},
									{
										text: "4. Select and press 'OK' on the Mii you wish to submit",
										imageSrc: "/tutorial/3ds/create-qr-code/step4.png",
									},
									{
										text: "5. Pick any option; it doesn't matter since the QR code regenerates upon submission.",
										imageSrc: "/tutorial/3ds/create-qr-code/step5.png",
									},
									{
										text: "6. Exit the tutorial; Upload the QR code (scan with camera or upload file through SD card).",
										imageSrc: "/tutorial/3ds/create-qr-code/step6.png",
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
