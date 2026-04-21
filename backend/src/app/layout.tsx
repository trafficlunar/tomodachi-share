import "./globals.css";

export default function Layout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html>
			<head>
				<title>TomodachiShare API</title>
			</head>
			<body>{children}</body>
		</html>
	);
}
