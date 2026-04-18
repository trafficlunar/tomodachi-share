import AdminBanner from "./components/admin/banner";
import Footer from "./components/footer";
import Header from "./components/header";
import { useEffect } from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
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
		<>
			<Header />
			<AdminBanner />
			<main className="px-4 py-8 max-w-7xl w-full grow flex flex-col">{children}</main>
			<Footer />
		</>
	);
}
