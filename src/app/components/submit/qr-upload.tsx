"use client";

import { useCallback } from "react";
import { FileWithPath, useDropzone } from "react-dropzone";
import { Icon } from "@iconify/react";
import jsQR from "jsqr";

interface Props {
	setQrBytesRaw: React.Dispatch<React.SetStateAction<number[]>>;
}

export default function QrUpload({ setQrBytesRaw }: Props) {
	const onDrop = useCallback((acceptedFiles: FileWithPath[]) => {
		acceptedFiles.forEach((file) => {
			// Scan QR code
			const reader = new FileReader();
			reader.onload = async (event) => {
				const image = new Image();
				image.onload = () => {
					const canvas = document.createElement("canvas");
					const ctx = canvas.getContext("2d");
					if (!ctx) return;

					canvas.width = image.width;
					canvas.height = image.height;
					ctx.drawImage(image, 0, 0, image.width, image.height);

					const imageData = ctx.getImageData(0, 0, image.width, image.height);
					const decoded = jsQR(imageData.data, image.width, image.height);

					setQrBytesRaw(decoded?.binaryData!);
				};
				image.src = event.target!.result as string;
			};
			reader.readAsDataURL(file);
		});
	}, []);

	const { getRootProps, getInputProps } = useDropzone({
		onDrop,
		accept: {
			"image/*": [".png", ".jpg", ".jpeg", ".bmp", ".webp"],
		},
	});

	return (
		<div className="p-2 border-2 bg-orange-100 border-amber-500 rounded-2xl shadow-lg w-full">
			<div
				{...getRootProps({
					className:
						"bg-orange-100 flex flex-col justify-center items-center gap-2 p-4 rounded-xl border border-2 border-dashed border-amber-500 select-none h-full",
				})}
			>
				<input {...getInputProps({ multiple: false })} />
				<Icon icon="material-symbols:upload" fontSize={48} />
				<p className="text-center text-sm">
					Drag and drop your QR code image here
					<br />
					or click to open
				</p>
			</div>
		</div>
	);
}
