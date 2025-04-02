"use client";

import { Icon } from "@iconify/react";
import { useDropzone } from "react-dropzone";

export default function QrUpload() {
	const { acceptedFiles, getRootProps, getInputProps } = useDropzone({
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
