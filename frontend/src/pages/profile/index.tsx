import { useParams } from "react-router";
import MiiList from "../../components/mii/list";

export default function ProfilePage() {
	const { id } = useParams();

	return <MiiList userId={Number(id)} />;
}
