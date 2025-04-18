"use client";

import { useEffect } from "react";
import { ProgressProvider } from "@bprogress/next/app";

export default function Providers({ children }: { children: React.ReactNode }) {
	// Calculate header height
	useEffect(() => {
		const header = document.querySelector("header");
		if (!header) return;

		const updateHeaderHeight = () => {
			document.documentElement.style.setProperty("--header-height", `${header.offsetHeight}px`);
		};

		const resizeObserver = new ResizeObserver(updateHeaderHeight);
		resizeObserver.observe(header);
		window.addEventListener("resize", updateHeaderHeight);

		updateHeaderHeight();

		return () => {
			resizeObserver.disconnect();
			window.removeEventListener("resize", updateHeaderHeight);
		};
	}, []);

	return (
		<ProgressProvider height="4px" color="var(--color-amber-500)" options={{ showSpinner: false }} shallowRouting>
			{children}
		</ProgressProvider>
	);
}
