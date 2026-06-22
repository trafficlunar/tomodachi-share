import { useStore } from "@nanostores/react";
import AdminBanner from "./components/admin/banner";
import Footer from "./components/footer";
import Header from "./components/header";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { session } from "./session";
import { Icon } from "@iconify/react";

export default function Layout({ children }: { children: React.ReactNode }) {
	const $session = useStore(session);
	const navigate = useNavigate();
	const location = useLocation();

	const API_URL = import.meta.env.VITE_API_URL;

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

	// Check for punishment on every page navigation
	useEffect(() => {
		if (!$session) return;
		if (["/punished", "/terms-of-service", "/privacy"].includes(location.pathname)) return;

		fetch(`${API_URL}/api/is-punished`, { credentials: "include" })
			.then((res) => {
				if (!res.ok) return null;
				return res.json();
			})
			.then((data) => {
				if (data.isPunished) navigate("/punished", { replace: true });
			})
			.catch((err) => {
				console.error("Failed to check punishment status:", err);
			});
	}, [$session, location.pathname]);

	return (
		<>
			<Header />
			<AdminBanner />
			<a
				href="https://ko-fi.com/trafficlunar"
				target="_blank"
				aria-label="Support on Ko-fi"
				className="pill button h-full bg-[#FF5E5B]! hover:bg-[#e04f4c]! border-[#e04f4c]! text-white! inline-flex items-center gap-2 mt-4"
				data-tooltip-span
			>
				<div className="tooltip bg-[#FF5E5B]! border-[#FF5E5B]! before:border-b-[#FF5E5B]!">Support me (trafficlunar) on Ko-fi</div>
				<Icon icon="simple-icons:kofi" fontSize={20} />
				Support me!
			</a>
			<main className="px-4 py-8 pt-4 max-w-7xl w-full grow flex flex-col">{children}</main>
			<Footer />
		</>
	);
}
