export default function BreachNoticePage() {
	return (
		<div className="bg-amber-50 border-2 border-amber-500 rounded-2xl p-6">
			<h1 className="text-2xl font-bold">Breach Notice</h1>
			<h2 className="font-light">
				<strong className="font-medium">Date:</strong> 13 May 2026
			</h2>

			<hr className="border-black/20 mt-1 mb-4" />

			<p>
				I have been made aware today (13 May 2026) that there has been a security breach on 6 May 2026 of the website. The following information have been
				collected:
			</p>

			<ul className="list-disc list-inside indent-4 my-4">
				<li>User IDs</li>
				<li>Email addresses</li>
				<li>Email verfication statuses</li>
				<li>Avatar images</li>
				<li>About Me descriptions</li>
				<li>Profile creation dates</li>
				<li>Profile update dates</li>
				<li>Profile picture update dates</li>
				<li>Amount of Miis you have liked</li>
			</ul>

			<p className="mb-2">
				The only data that wouldn't normally be viewable is your email address (the same thing you would give to people to receive emails), everything else was
				publicly viewable (such as on the profile pages). The code that caused this to happen has already been fixed.
			</p>
			<p>
				As far as I'm aware, no other information have been collected. The breach has been notified to the Information Commissioner's Office. Please take care
				when opening any suspicious emails. <strong>TomodachiShare does not send any emails.</strong> Please do not click on any suspicious links.
			</p>
		</div>
	);
}
