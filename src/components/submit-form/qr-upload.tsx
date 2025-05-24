"use client";

import { useCallback, useRef } from "react";
import { FileWithPath } from "react-dropzone";
import jsQR from "jsqr";
import Dropzone from "../dropzone";

interface Props {
	setQrBytesRaw: React.Dispatch<React.SetStateAction<number[]>>;
}

export default function QrUpload({ setQrBytesRaw }: Props) {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	const handleDrop = useCallback(
		(acceptedFiles: FileWithPath[]) => {
			acceptedFiles.forEach((file) => {
				// Scan QR code
				const reader = new FileReader();
				reader.onload = async (event) => {
					const image = new Image();
					image.onload = () => {
						const canvas = canvasRef.current;
						if (!canvas) return;

						const ctx = canvas.getContext("2d");
						if (!ctx) return;

						canvas.width = image.width;
						canvas.height = image.height;
						ctx.drawImage(image, 0, 0, image.width, image.height);

						const imageData = ctx.getImageData(0, 0, image.width, image.height);
						const code = jsQR(imageData.data, image.width, image.height);
						if (!code) return;

						setQrBytesRaw(code.binaryData!);
					};
					image.src = event.target!.result as string;
				};
				reader.readAsDataURL(file);
			});
		},
		[setQrBytesRaw]
	);

	return (
		<div className="max-w-md w-full">
			<Dropzone onDrop={handleDrop} options={{ maxFiles: 1 }}>
				<p className="text-center text-sm">
					Drag and drop your QR code image here
					<br />
					or click to open
				</p>
			</Dropzone>

			{/* Canvas is used to scan the QR code */}
			<canvas ref={canvasRef} className="hidden" />
		</div>
	);
}
