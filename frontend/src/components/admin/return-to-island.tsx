import { useState } from "react";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router";

interface Props {
	hasExpired: boolean;
}

export default function ReturnToIsland({ hasExpired }: Props) {
	const navigate = useNavigate();
	const [isChecked, setIsChecked] = useState(false);
	const [error, setError] = useState<string | undefined>(undefined);

	const handleClick = async () => {
		const response = await fetch(`${import.meta.env.VITE_API_URL}/api/return`, { method: "POST", credentials: "include" });

		if (!response.ok) {
			const data = await response.json();
			setError(data.error);
			return;
		}
		navigate("/");
	};

	return (
		<>
			<div className="flex justify-center items-center gap-2">
				<input
					type="checkbox"
					id="agreement"
					disabled={hasExpired}
					checked={isChecked}
					onChange={(e) => setIsChecked(e.target.checked)}
					className={`checkbox ${hasExpired && "text-zinc-600 bg-zinc-100! border-zinc-300!"}`}
				/>
				<label htmlFor="agreement" className={`${hasExpired && "text-zinc-500"}`}>
					I Agree
				</label>
			</div>

			<hr className="border-zinc-300 mt-3 mb-4" />

			{error && <span className="text-red-400 font-bold mb-2.5">Error: {error}</span>}
			<button disabled={!isChecked} aria-label="Travel Back Home" onClick={handleClick} className="pill button gap-2 w-fit self-center">
				<Icon icon="ic:round-home" fontSize={24} />
				Travel Back
			</button>
		</>
	);
}
