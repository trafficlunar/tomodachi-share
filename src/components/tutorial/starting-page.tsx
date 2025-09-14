import Image from "next/image";
import { UseEmblaCarouselType } from "embla-carousel-react";

interface Props {
	emblaApi: UseEmblaCarouselType[1] | undefined;
	isSwitch?: boolean;
}

export default function StartingPage({ emblaApi, isSwitch }: Props) {
	const goToTutorial = (index: number) => {
		if (!emblaApi) return;

		emblaApi.scrollTo(index - 1, true);
		emblaApi.scrollTo(index);
	};

	return (
		<div className="flex-shrink-0 flex flex-col w-full px-6 py-6">
			{/* Separator */}
			<div className="flex items-center gap-4 text-zinc-500 text-sm font-medium mb-2">
				<hr className="flex-grow border-zinc-300" />
				<span>Pick a tutorial</span>
				<hr className="flex-grow border-zinc-300" />
			</div>

			<div className="grid grid-cols-2 gap-4 h-full">
				<button
					onClick={() => goToTutorial(1)}
					aria-label="Allow Copying Tutorial"
					className="flex flex-col justify-center items-center bg-zinc-50 rounded-xl p-4 shadow-md border-2 border-zinc-300 cursor-pointer text-center text-sm transition hover:scale-[1.03] hover:bg-cyan-100 hover:border-cyan-600"
				>
					<Image
						src={`/tutorial/${isSwitch ? "switch" : "3ds"}/allow-copying/thumbnail.png`}
						alt="Allow Copying thumbnail"
						width={128}
						height={128}
						className="rounded-lg border-2 border-zinc-300"
					/>
					<p className="mt-2">Allow Copying</p>
					<p className="text-[0.65rem] text-zinc-400">Suggested!</p>
				</button>

				<button
					onClick={() => goToTutorial(10)}
					aria-label="Create QR Code Tutorial"
					className="flex flex-col justify-center items-center bg-zinc-50 rounded-xl p-4 shadow-md border-2 border-zinc-300 cursor-pointer text-center text-sm transition hover:scale-[1.03] hover:bg-cyan-100 hover:border-cyan-600"
				>
					<Image
						src={`/tutorial/${isSwitch ? "switch" : "3ds"}/create-qr-code/thumbnail.png`}
						alt="Creating QR code thumbnail"
						width={128}
						height={128}
						className="rounded-lg border-2 border-zinc-300"
					/>
					<p className="mt-2">Create QR Code</p>
					{/* Add placeholder to keep height the same */}
					<p className="text-[0.65rem] opacity-0">placeholder</p>
				</button>
			</div>
		</div>
	);
}
