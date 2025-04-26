import type { Metadata } from "next";
import Script from "next/script";
import { Lexend } from "next/font/google";

import "./globals.css";

import Providers from "./provider";
import Header from "@/components/header";
import Footer from "@/components/footer";

const lexend = Lexend({
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "TomodachiShare",
	description: "Discover and share Mii residents for your Tomodachi Life island!",
	robots: {
		index: true,
		follow: true,
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={`${lexend.className} antialiased flex flex-col items-center min-h-screen`}>
				{process.env.NODE_ENV == "production" && (
					<Script defer src="https://analytics.trafficlunar.net/script.js" data-website-id="bc530384-9b7d-471a-b2e3-f9859da50c24" />
				)}

				<Providers>
					<Header />
					<div className="px-4 py-8 max-w-7xl w-full flex-grow flex flex-col">{children}</div>
					<Footer />
				</Providers>
			</body>
		</html>
	);
}
