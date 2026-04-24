import { Icon } from "@iconify/react";
import { useStore } from "@nanostores/react";
import { themeStore, cycleTheme, applyTheme, type Theme } from "../lib/theme";

interface ThemeToggleProps {
	size?: "sm" | "md" | "lg";
	className?: string;
}

export default function ThemeToggle({ size = "md", className = "" }: ThemeToggleProps) {
	const theme = useStore(themeStore);

	const sizeClasses = {
		sm: "h-8 w-8",
		md: "h-10 w-10",
		lg: "h-12 w-12",
	};

	const iconSizes = {
		sm: 16,
		md: 20,
		lg: 24,
	};

	const handleClick = () => {
		const currentTheme: Theme = theme ?? "SYSTEM";
		const nextTheme = cycleTheme(currentTheme);
		applyTheme(nextTheme);
	};

	const getIcon = () => {
		if (theme === "DARK") return <Icon icon="mdi:moon" fontSize={iconSizes[size]} />;
		if (theme === "LIGHT") return <Icon icon="mdi:white-balance-sunny" fontSize={iconSizes[size]} />;
		// SYSTEM or undefined - show computer/monitor icon
		return <Icon icon="mdi:monitor" fontSize={iconSizes[size]} />;
	};

	const getTooltip = () => {
		if (theme === "DARK") return "Dark Mode";
		if (theme === "LIGHT") return "Light Mode";
		return "System Theme";
	};

	return (
		<button
			onClick={handleClick}
			className={`pill button rounded-full! aspect-square ${sizeClasses[size]} ${className}`}
			title={getTooltip()}
			aria-label={`Current theme: ${theme ?? "SYSTEM"}. Click to cycle.`}
			data-tooltip={getTooltip()}
		>
			{getIcon()}
		</button>
	);
}
