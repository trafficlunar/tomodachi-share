import { Icon } from "@iconify/react";

export default function NotFoundPage() {
    return <div className="grow flex items-center justify-center">
		<div className="bg-amber-50 border-2 border-amber-500 rounded-2xl shadow-lg p-8 max-w-xs w-full text-center flex flex-col">
			<h2 className="text-7xl font-black">404</h2>
			<p>Page not found - you swam off the island!</p>
			<a href="/" className="pill button gap-2 mt-8 w-fit self-center">
				<Icon icon="ic:round-home" fontSize={24} />
				Travel Back
			</a>
		</div>
	</div>
}