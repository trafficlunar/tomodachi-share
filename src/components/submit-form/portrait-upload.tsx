"use client";

import { useCallback, useState } from "react";
import { FileWithPath } from "react-dropzone";
import Dropzone from "../dropzone";

interface Props {
	setImage: React.Dispatch<React.SetStateAction<string | undefined>>;
}

export default function PortraitUpload({ setImage }: Props) {
	const [hasImage, setHasImage] = useState(false);

	const handleDrop = useCallback(
		(acceptedFiles: FileWithPath[]) => {
			const file = acceptedFiles[0];
			// Convert to Data URI
			const reader = new FileReader();
			reader.onload = async (event) => {
				setImage(event.target!.result as string);
				setHasImage(true);
			};
			reader.readAsDataURL(file);
		},
		[setImage]
	);

	return (
		<div className="max-w-md w-full">
			<Dropzone onDrop={handleDrop} options={{ maxFiles: 1 }}>
				<p className="text-center text-sm">
					{!hasImage ? (
						<>
							Drag and drop your Mii&apos;s portrait here
							<br />
							or click to open
						</>
					) : (
						"Uploaded!"
					)}
				</p>
			</Dropzone>
		</div>
	);
}
