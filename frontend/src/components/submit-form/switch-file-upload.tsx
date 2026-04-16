import { useCallback, useState } from "react";
import { type FileWithPath } from "react-dropzone";
import { Icon } from "@iconify/react";
import Dropzone from "../dropzone";
import Camera from "./camera";
import ImageEditorPortrait from "./image-editor";

interface Props {
	text: string;
	forceCrop?: boolean;
	image?: string | undefined;
	setImage: (value: string | undefined) => void;
}

export default function SwitchFileUpload({ text, forceCrop, image, setImage }: Props) {
	const [isCameraOpen, setIsCameraOpen] = useState(false);
	const [isCropOpen, setIsCropOpen] = useState(false);

	const handleDrop = useCallback(
		(acceptedFiles: FileWithPath[]) => {
			const file = acceptedFiles[0];
			// Convert to Data URI
			const reader = new FileReader();
			reader.onload = async (event) => {
				setImage(event.target!.result as string);
				if (forceCrop) setIsCropOpen(true);
			};
			reader.readAsDataURL(file);
		},
		[setImage],
	);

	return (
		<div className="max-w-md w-full flex flex-col items-center gap-2">
			<Dropzone onDrop={handleDrop} options={{ maxFiles: 1 }}>
				<p className="text-center text-sm">
					{!image ? (
						<>
							Drag and drop {text}
							<br />
							or click to open
						</>
					) : (
						"Uploaded!"
					)}
				</p>
			</Dropzone>

			<span>or</span>

			<div className="flex gap-2 max-sm:flex-col">
				<button type="button" aria-label="Use your camera" onClick={() => setIsCameraOpen(true)} className="pill button gap-2">
					<Icon icon="mdi:camera" fontSize={20} />
					Use your camera
				</button>
				<button type="button" aria-label="Crop image" onClick={() => setIsCropOpen(true)} className="pill button gap-2">
					<Icon icon="mdi:image-edit" fontSize={20} />
					Edit Image
				</button>
			</div>

			<Camera
				isOpen={isCameraOpen}
				setIsOpen={setIsCameraOpen}
				setImage={setImage}
				onCapture={() => {
					if (forceCrop) setIsCropOpen(true);
				}}
			/>
			<ImageEditorPortrait isOpen={isCropOpen} setIsOpen={setIsCropOpen} image={image} setImage={setImage} />
		</div>
	);
}
