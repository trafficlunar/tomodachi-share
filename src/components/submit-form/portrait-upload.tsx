"use client";

import { useCallback } from "react";
import { FileWithPath } from "react-dropzone";
import Dropzone from "../dropzone";

interface Props {
	setImage: React.Dispatch<React.SetStateAction<string | undefined>>;
}

export default function PortraitUpload({ setImage }: Props) {
	const handleDrop = useCallback(
		(acceptedFiles: FileWithPath[]) => {
			const file = acceptedFiles[0];
			// Convert to Data URI
			const reader = new FileReader();
			reader.onload = async (event) => {
				setImage(event.target!.result as string);
			};
			reader.readAsDataURL(file);
		},
		[setImage]
	);

	return (
		<div className="max-w-md w-full">
			<Dropzone onDrop={handleDrop} options={{ maxFiles: 1 }}>
				<p className="text-center text-sm">
					Drag and drop your Mii&apos;s portrait here
					<br />
					or click to open
				</p>
			</Dropzone>
		</div>
	);
}
