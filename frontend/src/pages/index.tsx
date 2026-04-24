import { useSearchParams } from "react-router";
import MiiList from "../components/mii/list";

export default function IndexPage() {
	const [searchParams] = useSearchParams();

	return (
		<>
			<h1 className="sr-only">
				{searchParams.get("tags") ? `Miis tagged with '${searchParams.get("tags")}' - TomodachiShare` : "TomodachiShare - index mii list"}
			</h1>
			<MiiList />
		</>
	);
}
