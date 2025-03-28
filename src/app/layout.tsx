import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "./globals.css";
import Header from "./components/header";

const inter = Inter({
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "TomodachiShare",
	description: "Share your Tomodachi Life Miis",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={`${inter.className} antialiased flex flex-col items-center`}>
				<Header />
				{children}
			</body>
		</html>
	);
}
