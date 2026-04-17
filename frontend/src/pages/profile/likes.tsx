import MiiList from "../../components/mii/list";

export default function ProfileLikesPage() {
	return (
		<>
			<div className="bg-amber-50 border-2 border-amber-500 rounded-2xl shadow-lg p-4 flex flex-col gap-4 mb-2">
				<div>
					<h2 className="text-2xl font-bold">My Likes</h2>
					<p className="text-sm text-zinc-500">View every Mii you have liked on TomodachiShare.</p>
				</div>
			</div>
			<MiiList parentPage="likes" />
		</>
	);
}
