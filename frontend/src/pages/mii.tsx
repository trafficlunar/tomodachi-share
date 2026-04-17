import type { SwitchMiiInstructions } from "@tomodachi-share/shared";

import ImageViewer from "../components/image-viewer";
import LikeButton from "../components/like-button";
import Description from "../components/description";
import ShareMiiButton from "../components/mii/share-mii-button";
import ThreeDsScanTutorialButton from "../components/tutorial/3ds-scan";
import SwitchAddMiiTutorialButton from "../components/tutorial/switch-add-mii";
import MiiInstructions from "../components/mii/instructions";
import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";

export default function MiiPage() {
	const { id } = useParams();
	const [mii, setMii] = useState<any>(null);
	const [loading, setLoading] = useState(true);

	const API_URL = import.meta.env.VITE_API_URL;

	useEffect(() => {
		fetch(`${API_URL}/api/mii/${id}/info`)
			.then((res) => {
				if (!res.ok) throw new Error("Failed to fetch Miis");
				return res.json();
			})
			.then((data) => {
				setMii(data);
				setLoading(false);
			})
			.catch((err) => {
				console.error(err);
				setLoading(false);
				window.location.href = "/404";
			});
	}, [id]);

	if (loading || !mii) {
		return <div className="p-6 text-center">Loading...</div>;
	}

	const images = [...Array.from({ length: mii.imageCount }, (_, index) => `${API_URL}/mii/${mii.id}/image?type=image${index}`)];

	return (
		<div className="flex flex-col items-center">
			<div className="max-w-5xl w-full flex flex-col gap-4">
				{mii.quarantined && (
					<div className="bg-red-100 border-2 border-red-400 rounded-2xl shadow-lg p-4 flex items-center gap-3 text-red-700">
						<Icon icon="material-symbols:warning-rounded" className="text-2xl shrink-0" />
						<p className="font-medium">This Mii is flagged as controversial and only appears when the filter is enabled</p>
					</div>
				)}
				{mii.in_queue && (
					<div className="bg-zinc-50 border-2 border-zinc-400 rounded-2xl shadow-lg p-4 flex items-start gap-3 text-zinc-600">
						<Icon icon="material-symbols:timer" className="text-2xl shrink-0" />
						<p className="font-medium">
							This Mii is waiting to be manually reviewed and is hidden from the main page. The review could take between a few hours and a few days.
							<br />
							Despite that, you can still share the Mii through the URL!
						</p>
					</div>
				)}
				<div className="relative grid grid-cols-3 gap-4 max-md:grid-cols-1">
					<div className="bg-amber-50 rounded-3xl border-2 border-amber-500 shadow-lg p-4 h-min flex flex-col items-center max-w-md w-full max-md:place-self-center max-md:row-start-2">
						{/* Mii Image */}
						<div className="bg-linear-to-b from-amber-100 to-amber-200 overflow-hidden rounded-xl w-full mb-4 flex justify-center">
							<ImageViewer
								src={`${API_URL}/mii/${mii.id}/image?type=mii`}
								alt="mii headshot"
								width={250}
								height={250}
								className="drop-shadow-lg hover:scale-105 transition-transform w-full max-h-96 object-contain"
							/>
						</div>
						{/* QR Code */}
						{mii.platform === "THREE_DS" ? (
							<div className="bg-amber-200 overflow-hidden rounded-xl w-full mb-4 flex justify-center p-2">
								<ImageViewer
									src={`${API_URL}/mii/${mii.id}/image?type=qr-code`}
									alt="mii qr code"
									width={128}
									height={128}
									className="border-2 border-amber-300 rounded-lg hover:brightness-90 transition-all"
								/>
							</div>
						) : (
							<ImageViewer
								src={`${API_URL}/mii/${mii.id}/image?type=features`}
								alt="mii features"
								width={300}
								height={300}
								className="rounded-lg hover:brightness-90 mb-4 transition-all"
							/>
						)}
						<hr className="w-full border-t-2 border-t-amber-400" />

						{/* Mii Info */}
						{mii.platform === "THREE_DS" && (
							<ul className="text-sm w-full p-2 *:flex *:justify-between *:items-center *:my-1">
								<li>
									Name:{" "}
									<span className="text-right font-medium">
										{mii.firstName} {mii.lastName}
									</span>
								</li>
								<li>
									From: <span className="text-right font-medium">{mii.islandName} Island</span>
								</li>
								<li>
									Allowed Copying: <input type="checkbox" checked={mii.allowedCopying ?? false} disabled className="checkbox cursor-auto!" />
								</li>
							</ul>
						)}

						{/* Mii Platform */}
						<div className={`flex items-center gap-4 text-zinc-500 text-sm font-medium mb-2 w-full ${mii.platform !== "THREE_DS" && "mt-2"}`}>
							<hr className="grow border-zinc-300" />
							<span>Platform</span>
							<hr className="grow border-zinc-300" />
						</div>

						<div data-tooltip-span title={mii.platform} className="grid grid-cols-2 gap-2 mb-2">
							<div
								className={`tooltip mt-1! ${
									mii.platform === "THREE_DS" ? "bg-sky-400! border-sky-400! before:border-b-sky-400!" : "bg-red-400! border-red-400! before:border-b-red-400!"
								}`}
							>
								{mii.platform === "THREE_DS" ? "3DS" : "Switch"}
							</div>

							<div
								className={`rounded-xl flex justify-center items-center size-13 text-3xl border-2 shadow-sm ${
									mii.platform === "THREE_DS" ? "bg-sky-100 border-sky-400" : "bg-white border-gray-300"
								}`}
							>
								<Icon icon="cib:nintendo-3ds" className="text-sky-500" />
							</div>

							<div
								className={`rounded-xl flex justify-center items-center size-13 text-3xl border-2 shadow-sm ${
									mii.platform === "SWITCH" ? "bg-red-100 border-red-400" : "bg-white border-gray-300"
								}`}
							>
								<Icon icon="cib:nintendo-switch" className="text-red-400" />
							</div>
						</div>

						{/* Mii Gender */}
						<div className="flex items-center gap-4 text-zinc-500 text-sm font-medium mb-2 w-full">
							<hr className="grow border-zinc-300" />
							<span>Gender</span>
							<hr className="grow border-zinc-300" />
						</div>

						<div data-tooltip-span title={mii.gender ?? "NULL"} className="flex gap-1">
							<div
								className={`tooltip mt-1! ${
									mii.gender === "MALE"
										? "bg-blue-400! border-blue-400! before:border-b-blue-400!"
										: mii.gender === "FEMALE"
											? "bg-pink-400! border-pink-400! before:border-b-pink-400!"
											: "bg-purple-400! border-purple-400! before:border-b-purple-400!"
								}`}
							>
								{mii.gender === "MALE" ? "Male" : mii.gender === "FEMALE" ? "Female" : "Nonbinary"}
							</div>

							<div
								className={`rounded-xl flex justify-center items-center size-13 text-5xl border-2 shadow-sm ${
									mii.gender === "MALE" ? "bg-blue-100 border-blue-400" : "bg-white border-gray-300"
								}`}
							>
								<Icon icon="foundation:male" className="text-blue-400" />
							</div>

							<div
								className={`rounded-xl flex justify-center items-center size-13 text-5xl border-2 shadow-sm ${
									mii.gender === "FEMALE" ? "bg-pink-100 border-pink-400" : "bg-white border-gray-300"
								}`}
							>
								<Icon icon="foundation:female" className="text-pink-400" />
							</div>

							{mii.platform !== "THREE_DS" && (
								<div
									className={`rounded-xl flex justify-center items-center size-13 text-5xl border-2 shadow-sm ${
										mii.gender === "NONBINARY" ? "bg-purple-100 border-purple-400" : "bg-white border-gray-300"
									}`}
								>
									<Icon icon="mdi:gender-non-binary" className="text-purple-400" />
								</div>
							)}
						</div>

						{/* Makeup */}
						{mii.platform === "SWITCH" && (
							<>
								<div className="flex items-center gap-4 text-zinc-500 text-sm font-medium mb-2 mt-2 w-full">
									<hr className="grow border-zinc-300" />
									<span>Makeup</span>
									<hr className="grow border-zinc-300" />
								</div>

								<div data-tooltip-span title={mii.makeup ?? "NULL"} className="flex gap-1">
									{/* Tooltip */}
									<div
										className={`tooltip mt-1! ${
											mii.makeup === "FULL"
												? "bg-pink-400! border-pink-400! before:border-b-pink-400!"
												: mii.makeup === "PARTIAL"
													? "bg-purple-400! border-purple-400! before:border-b-purple-400!"
													: "bg-gray-400! border-gray-400! before:border-b-gray-400!"
										}`}
									>
										{mii.makeup === "FULL" ? "Full Makeup" : mii.makeup === "PARTIAL" ? "Partial Makeup" : "No Makeup"}
									</div>

									{/* Full Makeup */}
									<div
										className={`rounded-xl flex justify-center items-center size-13 text-5xl border-2 shadow-sm ${
											mii.makeup === "FULL" ? "bg-pink-100 border-pink-400" : "bg-white border-gray-300"
										}`}
									>
										<Icon icon="mdi:palette" className="text-pink-400" />
									</div>

									{/* Partial Makeup */}
									<div
										className={`rounded-xl flex justify-center items-center size-13 text-5xl border-2 shadow-sm ${
											mii.makeup === "PARTIAL" ? "bg-purple-100 border-purple-400" : "bg-white border-gray-300"
										}`}
									>
										<Icon icon="mdi:lipstick" className="text-purple-400" />
									</div>

									{/* No Makeup */}
									<div
										className={`rounded-xl flex justify-center items-center size-13 text-5xl border-2 shadow-sm ${
											mii.makeup === "NONE" ? "bg-gray-200 border-gray-400" : "bg-white border-gray-300"
										}`}
									>
										<Icon icon="codex:cross" className="text-gray-400" />
									</div>
								</div>
							</>
						)}
					</div>

					<div className="col-span-2 flex flex-col gap-4 max-md:col-span-1">
						{/* Information */}
						<div className="bg-amber-50 border-2 border-amber-500 rounded-2xl shadow-lg p-4 flex flex-col gap-1">
							<div className="flex justify-between items-start">
								{/* Submission name */}
								<h1 className="text-4xl font-extrabold wrap-break-word whitespace-break-spaces text-amber-700 flex-1 min-w-0">{mii.name}</h1>
								{/* Like button */}
								<LikeButton likes={mii._count.likedBy ?? 0} miiId={mii.id} isLiked={(mii.likedBy ?? []).length > 0} big />
							</div>
							{/* Tags */}
							<div id="tags" className="flex flex-wrap gap-1 mt-1 *:px-2 *:py-1 *:bg-orange-300 *:rounded-full *:text-xs">
								{mii.tags.map((tag: string) => (
									<Link to={`/tags=${tag}`} key={tag}>
										{tag}
									</Link>
								))}
							</div>

							{/* Author and Created date */}
							<div className="mt-2">
								<Link to={`/profile/${mii.userId}`} className="text-lg wrap-break-word">
									By <span className="font-bold">{mii.user.name}</span>
								</Link>
								<h4 className="text-sm">
									Created:{" "}
									{new Date(mii.createdAt).toLocaleString("en-GB", {
										day: "2-digit",
										month: "long",
										year: "numeric",
										hour: "2-digit",
										minute: "2-digit",
										second: "2-digit",
										timeZone: "UTC",
									})}{" "}
									UTC
								</h4>
							</div>

							{/* Description */}
							{mii.description && <Description text={mii.description} className="ml-2" />}
						</div>

						{/* Buttons */}
						<div className="flex gap-3 w-fit bg-amber-50 border-2 border-amber-500 rounded-2xl shadow-lg p-4 text-3xl text-orange-400 max-md:place-self-center *:size-12 *:flex *:flex-col *:items-center *:gap-1 **:transition-discrete **:duration-150 *:hover:brightness-75 *:hover:scale-[1.08] *:[&_span]:text-xs">
							{/* <AuthorButtons mii={mii} /> */}

							<ShareMiiButton miiId={mii.id} />
							<Link aria-label="Report Mii" to={`${API_URL}/report/mii/${mii.id}`}>
								<Icon icon="material-symbols:flag-rounded" />
								<span>Report</span>
							</Link>
							{mii.platform === "THREE_DS" ? <ThreeDsScanTutorialButton /> : <SwitchAddMiiTutorialButton />}
						</div>

						{/* Instructions */}
						{mii.platform === "SWITCH" && (
							<div className="bg-amber-50 border-2 border-amber-500 rounded-2xl shadow-lg p-4 flex flex-col gap-3 max-h-96 overflow-y-auto">
								<h2 className="text-xl font-semibold text-amber-700 flex items-center gap-2">
									<Icon icon="fa7-solid:list" />
									Instructions
								</h2>

								{mii.youtubeId && (
									<iframe
										src={`https://www.youtube-nocookie.com/embed/${mii.youtubeId}`}
										title="YouTube video player"
										allow="clipboard-write; encrypted-media;"
										referrerPolicy="strict-origin-when-cross-origin"
										allowFullScreen
										loading="lazy"
										className="aspect-video rounded-2xl w-full max-w-135"
									/>
								)}

								<MiiInstructions instructions={mii.instructions as Partial<SwitchMiiInstructions>} />
							</div>
						)}
					</div>
				</div>

				{/* Images */}
				<div className="bg-amber-50 rounded-3xl border-2 border-amber-500 shadow-lg p-4 flex flex-col">
					<h2 className="text-xl font-semibold text-amber-700 mb-3 flex items-center gap-2">
						<Icon icon="material-symbols:photo-library" />
						Gallery
					</h2>

					{images.length > 0 ? (
						<div className="grid grid-cols-3 gap-2 w-full max-md:grid-cols-2 max-[24rem]:grid-cols-1">
							{images.map((src, index) => (
								<div
									key={index}
									className="relative aspect-3/2 rounded-xl bg-black/65 border-2 border-amber-400 shadow-md overflow-hidden transition hover:shadow-lg shadow-black/30"
								>
									<img
										src={src}
										alt="mii screenshot background blur"
										width={256}
										height={170}
										className="absolute size-full blur-sm contrast-150 brightness-[0.65] object-cover"
									/>

									<ImageViewer
										src={src}
										alt="mii screenshot"
										width={256}
										height={170}
										className="aspect-3/2 w-full object-contain hover:scale-105 duration-300 transition-transform relative z-10"
										images={images}
									/>
								</div>
							))}
						</div>
					) : (
						<p className="indent-7.5 text-black/50">There is nothing here...</p>
					)}
				</div>
			</div>
		</div>
	);
}
