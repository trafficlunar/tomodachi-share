import type { Metadata } from "next";
import { Lexend } from "next/font/google";

import "./globals.css";
import Header from "./components/header";

const lexend = Lexend({
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
			<body className={`${lexend.className} antialiased flex flex-col items-center py-32`}>
				<Header />
				{children}
			</body>
		</html>
	);
}
