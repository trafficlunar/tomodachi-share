"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import dayjs from "dayjs";

import { displayNameSchema, usernameSchema } from "@/lib/schemas";

import ProfilePictureSettings from "./profile-picture";
import SubmitDialogButton from "./submit-dialog-button";
import DeleteAccount from "./delete-account";
import z from "zod";

interface Props {
	currentDescription: string | null | undefined;
}

export default function ProfileSettings({ currentDescription }: Props) {
	const router = useRouter();

	const [description, setDescription] = useState(currentDescription);
	const [displayName, setDisplayName] = useState("");
	const [username, setUsername] = useState("");

	const [descriptionChangeError, setDescriptionChangeError] = useState<string | undefined>(undefined);
	const [displayNameChangeError, setDisplayNameChangeError] = useState<string | undefined>(undefined);
	const [usernameChangeError, setUsernameChangeError] = useState<string | undefined>(undefined);

	const usernameDate = dayjs().add(90, "days");

	const handleSubmitDescriptionChange = async (close: () => void) => {
		const parsed = z.string().trim().max(256).safeParse(description);
		if (!parsed.success) {
			setDescriptionChangeError(parsed.error.issues[0].message);
			return;
		}

		const response = await fetch("/api/auth/about-me", {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ description }),
		});

		if (!response.ok) {
			const { error } = await response.json();
			setDescriptionChangeError(error);
			return;
		}

		close();
		router.refresh();
	};

	const handleSubmitDisplayNameChange = async (close: () => void) => {
		const parsed = displayNameSchema.safeParse(displayName);
		if (!parsed.success) {
			setDisplayNameChangeError(parsed.error.issues[0].message);
			return;
		}

		const response = await fetch("/api/auth/display-name", {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ displayName }),
		});

		if (!response.ok) {
			const { error } = await response.json();
			setDisplayNameChangeError(error);
			return;
		}

		close();
		router.refresh();
	};

	const handleSubmitUsernameChange = async (close: () => void) => {
		const parsed = usernameSchema.safeParse(username);
		if (!parsed.success) {
			setUsernameChangeError(parsed.error.issues[0].message);
			return;
		}

		const response = await fetch("/api/auth/username", {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ username }),
		});

		if (!response.ok) {
			const { error } = await response.json();
			setUsernameChangeError(error);
			return;
		}

		close();
		router.refresh();
	};

	return (
		<div className="bg-amber-50 border-2 border-amber-500 rounded-2xl shadow-lg p-4 flex flex-col gap-4">
			<div>
				<h2 className="text-2xl font-bold">Profile Settings</h2>
				<p className="text-sm text-zinc-500">Update your account info, and username.</p>
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
					<label className="font-semibold">Change Display Name</label>
					<p className="text-sm text-zinc-500">This is a display name shown on your profile — feel free to change it anytime</p>
				</div>

				<div className="flex justify-end gap-1 h-min col-span-2">
					<input type="text" className="pill input flex-1" placeholder="Type here..." value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
					<SubmitDialogButton
						title="Confirm Display Name Change"
						description="Are you sure? This will only be visible on your profile. You can change it again later."
						error={displayNameChangeError}
						onSubmit={handleSubmitDisplayNameChange}
					>
						<div className="bg-orange-100 rounded-xl border-2 border-amber-500 mt-4 px-2 py-1">
							<p className="font-semibold">New display name:</p>
							<p className="indent-4">&apos;{displayName}&apos;</p>
						</div>
					</SubmitDialogButton>
				</div>
			</div>

			{/* Change Username */}
			<div className="grid grid-cols-5 gap-4 max-lg:grid-cols-1">
				<div className="col-span-3">
					<label className="font-semibold">Change Username</label>
					<p className="text-sm text-zinc-500">Your unique tag on the site. Can only be changed once every 90 days</p>
				</div>

				<div className="flex justify-end gap-1 col-span-2">
					<div className="relative flex-1">
						<input
							type="text"
							className="pill input w-full indent-4"
							placeholder="Type here..."
							value={username}
							onChange={(e) => setUsername(e.target.value)}
						/>
						<span className="absolute top-1/2 -translate-y-1/2 left-4 select-none">@</span>
					</div>
					<SubmitDialogButton
						title="Confirm Username Change"
						description="Are you sure? Your username is your unique indentifier and can only be changed every 90 days."
						error={usernameChangeError}
						onSubmit={handleSubmitUsernameChange}
					>
						<p className="text-sm text-zinc-500 mt-2">
							After submitting, you can change it again on{" "}
							{usernameDate.toDate().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}.
						</p>

						<div className="bg-orange-100 rounded-xl border-2 border-amber-500 mt-4 px-2 py-1">
							<p className="font-semibold">New username:</p>
							<p className="indent-4">&apos;@{username}&apos;</p>
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
