export default function AccountDeletionPage() {
	return (
		<div className="grow flex items-center justify-center">
			<div className="bg-amber-50 border-2 border-amber-500 rounded-2xl shadow-lg p-8 max-w-lg w-full text-center flex flex-col">
				<h2 className="text-3xl font-black">Your account is deleted</h2>
				<p>Your profile will stay up for another up to 2 hours.</p>
				<p>Logging in again will create a new account.</p>
			</div>
		</div>
	);
}
