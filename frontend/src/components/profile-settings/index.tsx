import { useState } from "react";

import { userNameSchema } from "@tomodachi-share/shared/schemas";

import ProfilePictureSettings from "./profile-picture";
import SubmitDialogButton from "./submit-dialog-button";
import DeleteAccount from "./delete-account";
import z from "zod";

interface Props {
	currentDescription: string | null | undefined;
}

export default function ProfileSettings({ currentDescription }: Props) {
	const [description, setDescription] = useState(currentDescription);
	const [name, setName] = useState("");

	const [descriptionChangeError, setDescriptionChangeError] = useState<string | undefined>(undefined);
	const [nameChangeError, setNameChangeError] = useState<string | undefined>(undefined);

	const handleSubmitDescriptionChange = async (close: () => void) => {
		const parsed = z.string().trim().max(256).safeParse(description);
		if (!parsed.success) {
			setDescriptionChangeError(parsed.error.issues[0].message);
			return;
		}

		const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/about-me`, {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ description }),
			credentials: "include",
		});

		if (!response.ok) {
			const { error } = await response.json();
			setDescriptionChangeError(error);
			return;
		}

		close();
		window.location.reload();
	};

	const handleSubmitNameChange = async (close: () => void) => {
		const parsed = userNameSchema.safeParse(name);
		if (!parsed.success) {
			setNameChangeError(parsed.error.issues[0].message);
			return;
		}

		const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/name`, {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ name }),
			credentials: "include",
		});

		if (!response.ok) {
			const { error } = await response.json();
			setNameChangeError(error);
			return;
		}

		close();
		window.location.reload();
	};

	return (
		<div className="bg-amber-50 border-2 border-amber-500 rounded-2xl shadow-lg p-4 flex flex-col gap-4">
			<div>
				<h2 className="text-2xl font-bold">Profile Settings</h2>
				<p className="text-sm text-zinc-500">Update your profile picture, description, name, etc.</p>
			</div>

			{/* Separator */}
			<div className="flex items-center gap-4 text-zinc-500 text-sm font-medium mb-1">
				<hr className="grow border-zinc-300" />
				<span>Account Info</span>
				<hr className="grow border-zinc-300" />
			</div>

			{/* Profile Picture */}
			<ProfilePictureSettings />

			{/* Description */}
			<div className="grid grid-cols-5 gap-4 max-lg:grid-cols-1">
				<div className="col-span-3">
					<label className="font-semibold">About Me</label>
					<p className="text-sm text-zinc-500">Write about yourself on your profile</p>
				</div>

				<div className="flex justify-end gap-1 h-min col-span-2">
					<div className="flex-1">
						<textarea
							rows={5}
							maxLength={256}
							placeholder="(optional) Type about yourself..."
							className="pill input rounded-xl! resize-none text-sm w-full"
							value={description || ""}
							onChange={(e) => setDescription(e.target.value)}
						/>
						<p className="text-xs text-zinc-400 mt-1 text-right">{(description || "").length}/256</p>
					</div>

					<SubmitDialogButton
						title="Confirm About Me Change"
						description="Are you sure? You can change it again later."
						error={descriptionChangeError}
						onSubmit={handleSubmitDescriptionChange}
					/>
				</div>
			</div>

			{/* Change Name */}
			<div className="grid grid-cols-5 gap-4 max-lg:grid-cols-1">
				<div className="col-span-3">
					<label className="font-semibold">Change Name</label>
					<p className="text-sm text-zinc-500">This is your name shown on your profile and miis — feel free to change it anytime</p>
				</div>

				<div className="flex justify-end gap-1 h-min col-span-2">
					<input type="text" className="pill input flex-1" placeholder="Type here..." maxLength={64} value={name} onChange={(e) => setName(e.target.value)} />
					<SubmitDialogButton
						title="Confirm Name Change"
						description="Are you sure? You can change it again later."
						error={nameChangeError}
						onSubmit={handleSubmitNameChange}
					>
						<div className="bg-orange-100 rounded-xl border-2 border-amber-500 mt-4 px-2 py-1">
							<p className="font-semibold">New name:</p>
							<p className="indent-4">&apos;{name}&apos;</p>
						</div>
					</SubmitDialogButton>
				</div>
			</div>

			{/* Separator */}
			<div className="flex items-center gap-4 text-zinc-500 text-sm font-medium my-1">
				<hr className="grow border-zinc-300" />
				<span>Danger Zone</span>
				<hr className="grow border-zinc-300" />
			</div>

			{/* Delete Account */}
			<div className="grid grid-cols-2 gap-4 max-lg:grid-cols-1">
				<div>
					<label className="font-semibold">Delete Account</label>
					<p className="text-sm text-zinc-500">This will permanently remove your account and all uploaded Miis. This action cannot be undone</p>
				</div>

				<DeleteAccount />
			</div>
		</div>
	);
}
