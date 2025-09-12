import type { Metadata } from "next";
import Script from "next/script";
import { Lexend } from "next/font/google";

import { WebSite, WithContext } from "schema-dts";

import "./globals.css";

import Providers from "./provider";
import Header from "@/components/header";
import Footer from "@/components/footer";
import AdminBanner from "@/components/admin/banner";

const lexend = Lexend({
	subsets: ["latin"],
});

export const metadata: Metadata = {
	metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL!),
	title: "TomodachiShare - home for Tomodachi Life Miis!",
	description: "Discover and share Mii residents for your Tomodachi Life island!",
	keywords: ["mii", "tomodachi life", "nintendo", "tomodachishare", "tomodachi-share", "mii creator", "mii collection"],
	category: "Gaming",
	openGraph: {
		locale: "en_US",
		siteName: "TomodachiShare",
		title: "TomodachiShare",
		description: "Discover and share Mii residents for your Tomodachi Life island!",
		images: "/preview.png",
		type: "website",
		url: process.env.NEXT_PUBLIC_BASE_URL,
	},
	twitter: {
		card: "summary_large_image",
		title: "TomodachiShare - Discover and Share Your Mii Residents",
		description: "Discover and share Mii residents for your Tomodachi Life island!",
		images: "/preview.png",
		creator: "@trafficlunr",
	},
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
	const jsonLd: WithContext<WebSite> = {
		"@context": "https://schema.org",
		"@type": "WebSite",
		name: "TomodachiShare",
		url: "https://tomodachishare.com",
		description: "Discover and share Mii residents for your Tomodachi Life island!",
		inLanguage: "en",
		publisher: {
			"@type": "Organization",
			name: "TomodachiShare",
			url: "https://tomodachishare.com",
			logo: {
				"@type": "ImageObject",
				url: "https://tomodachishare.com/logo.png",
			},
			sameAs: ["https://trafficlunar.net", "https://twitter.com/trafficlunr", "https://bsky.app/profile/trafficlunar.net"],
		},
		potentialAction: {
			"@type": "SearchAction",
			target: "https://tomodachishare.com/?q={search_term_string}",
			// @ts-expect-error whatever
			"query-input": "required name=search_term_string",
		},
	};

	return (
		<html lang="en">
			<head>
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{
						__html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
					}}
				/>
			</head>
			<body className={`${lexend.className} antialiased flex flex-col items-center min-h-screen`}>
				{process.env.NODE_ENV == "production" && (
					<Script defer src="https://analytics.trafficlunar.net/script.js" data-website-id="bc530384-9b7d-471a-b2e3-f9859da50c24" />
				)}

				<Providers>
					<Header />
					<AdminBanner />
					<main className="px-4 py-8 max-w-7xl w-full flex-grow flex flex-col">{children}</main>
					<Footer />
				</Providers>
			</body>
		</html>
	);
}
