import { useRouter } from "next/navigation";
import Image from "next/image";

import { useCallback, useState } from "react";
import { FileWithPath } from "react-dropzone";

import { Icon } from "@iconify/react";
import dayjs from "dayjs";

import SubmitDialogButton from "./submit-dialog-button";
import Dropzone from "../dropzone";

export default function ProfilePictureSettings() {
	const router = useRouter();

	const [error, setError] = useState<string | undefined>(undefined);
	const [newPicture, setNewPicture] = useState<FileWithPath | undefined>();

	const changeDate = dayjs().add(7, "days");

	const handleSubmit = async (close: () => void) => {
		const formData = new FormData();
		if (newPicture) formData.append("image", newPicture);

		const response = await fetch("/api/auth/picture", {
			method: "PATCH",
			body: formData,
		});

		if (!response.ok) {
			const { error } = await response.json();
			setError(error);
			return;
		}

		close();
		router.refresh();
	};

	const handleDrop = useCallback((acceptedFiles: FileWithPath[]) => {
		if (!acceptedFiles[0]) return;
		setNewPicture(acceptedFiles[0]);
	}, []);

	return (
		<div className="grid grid-cols-5 gap-4 max-lg:grid-cols-1">
			<div className="col-span-3">
				<label className="font-semibold">Profile Picture</label>
				<p className="text-sm text-zinc-500">Manage your profile picture. Can only be changed once every 7 days.</p>
			</div>

			<div className="flex flex-col col-span-2">
				<div className="flex justify-end">
					<Dropzone onDrop={handleDrop} options={{ maxFiles: 1 }}>
						<p className="text-center text-xs">
							Drag and drop your profile picture here
							<br />
							or click to open
						</p>

						<Image
							src={newPicture ? URL.createObjectURL(newPicture) : "/guest.webp"}
							alt="new profile picture"
							width={96}
							height={96}
							className="rounded-full aspect-square border-2 border-amber-500 object-cover"
						/>
					</Dropzone>
				</div>

				<div className="flex justify-end gap-1 mt-2">
					{newPicture && (
						<button
							data-tooltip="Delete Picture"
							aria-label="Delete Picture"
							onClick={() => setNewPicture(undefined)}
							className="pill button aspect-square p-1! text-2xl bg-red-400! border-red-500!"
						>
							<Icon icon="mdi:trash-outline" />
						</button>
					)}
					<SubmitDialogButton
						title="Confirm Profile Picture Change"
						description="Are you sure? Your profile picture can only be changed every 7 days."
						error={error}
						onSubmit={handleSubmit}
					>
						<p className="text-sm text-zinc-500 mt-2">
							After submitting, you can change it again on{" "}
							{changeDate.toDate().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}.
						</p>

						<div className="bg-orange-100 rounded-xl border-2 border-amber-500 mt-4 px-2 py-1 flex items-center">
							<p className="font-semibold mb-2">New profile picture:</p>
							<Image
								src={newPicture ? URL.createObjectURL(newPicture) : "/guest.webp"}
								alt="new profile picture"
								width={128}
								height={128}
								className="rounded-full aspect-square border-2 border-amber-500 ml-auto object-cover"
							/>
						</div>
					</SubmitDialogButton>
				</div>
			</div>
		</div>
	);
}
