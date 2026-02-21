import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Privacy Policy - TomodachiShare",
	description: "Learn how TomodachiShare collects, uses, and protects your data",
};

export default function PrivacyPage() {
	return (
		<div className="bg-amber-50 border-2 border-amber-500 rounded-2xl p-6">
			<h1 className="text-2xl font-bold">Privacy Policy</h1>
			<h2 className="font-light">
				<strong className="font-medium">Effective Date:</strong> 21 February 2026
			</h2>

			<hr className="border-black/20 mt-1 mb-4" />

			<p>By using this website, you confirm that you understand and agree to this Privacy Policy.</p>
			<p className="mt-1">
				If you have any questions or concerns, please contact me at:{" "}
				<a href="mailto:hello@trafficlunar.net" className="text-blue-700">
					hello@trafficlunar.net
				</a>
				.
			</p>

			<ul className="list-decimal ml-5 marker:text-xl marker:font-semibold">
				<li>
					<h3 className="text-xl font-semibold mt-6 mb-2">Information We Collect</h3>

					<section>
						<p className="mb-2">The following types of information are stored when you use this website:</p>
						<ul className="list-disc list-inside">
							<li>
								<strong>Account Information:</strong> When you sign up or log in using Discord or Github, your username, e-mail, and profile picture are
								collected. Your authentication tokens may also be temporarily stored to maintain your login session.
							</li>
							<li>
								<strong>Miis:</strong> We store any Miis you submit, including associated images (such as a picture of your Mii, QR codes, and custom images).
							</li>
							<li>
								<strong>Interaction Data:</strong> The Miis you like.
							</li>
						</ul>
					</section>
				</li>
				<li>
					<h3 className="text-xl font-semibold mt-6 mb-2">Use of Cookies</h3>

					<section>
						<p className="mb-2">Cookies are necessary for user sessions and authentication. We do not use cookies for tracking or advertising purposes.</p>
					</section>
				</li>
				<li>
					<h3 className="text-xl font-semibold mt-6 mb-2">Analytics</h3>

					<section>
						<p className="mb-2">
							We use{" "}
							<a href="https://umami.is/" className="text-blue-700">
								Umami
							</a>{" "}
							to collect anonymous data about how users interact with the site. Umami is fully GDPR-compliant, and no personally identifiable information is
							collected through this service.
						</p>
					</section>
				</li>
				<li>
					<h3 className="text-xl font-semibold mt-6 mb-2">Error Reporting</h3>
					<section>
						<p className="mb-2">
							This website uses{" "}
							<a href="https://glitchtip.com/" className="text-blue-700">
								GlitchTip
							</a>{" "}
							(a self-hosted Sentry-like instance) to monitor errors and site performance. To protect your privacy:
						</p>
						<ul className="list-disc list-inside ml-4">
							<li>Errors and performance data is collected.</li>
							<li>Only your user ID and username are sent, no other personally identifiable information is collected.</li>
							<li>You can use ad blockers or browser privacy features to opt out.</li>
						</ul>
					</section>
				</li>
				<li>
					<h3 className="text-xl font-semibold mt-6 mb-2">Data Sharing</h3>

					<section>
						<p className="mb-2">
							We do not sell your personal data to third parties. Your data may be sent anonymously to self-hosted third-party services or trusted third-party
							tools (such as analytics) but these services are used solely to keep the site functional.
						</p>
					</section>
				</li>
				<li>
					<h3 className="text-xl font-semibold mt-6 mb-2">Your Rights</h3>

					<section>
						<p className="mb-2">As a user, you have the right to:</p>
						<ul className="list-disc list-inside indent-4">
							<li>Access the personal data we hold about you.</li>
							<li>Request corrections to any inaccurate or incomplete information.</li>
							<li>Request the deletion of your personal data.</li>
						</ul>
					</section>
				</li>
				<li>
					<h3 className="text-xl font-semibold mt-6 mb-2">Data Deletion</h3>

					<section>
						<p className="mb-2">
							Your data, including your Miis, will be retained for as long as you have an account on the site. You may request that your data be deleted at any
							time by going to your profile page, clicking the settings icon, and clicking the &apos;Delete Account&apos; button. Upon clicking, your data will
							be promptly removed from our servers.
						</p>
					</section>
				</li>
				<li>
					<h3 className="text-xl font-semibold mt-6 mb-2">Changes to this Privacy Policy</h3>

					<section>
						<p className="mb-2">
							This Privacy Policy may be updated from time to time. We encourage you to review this policy periodically to stay informed about your privacy.
						</p>
					</section>
				</li>
			</ul>
		</div>
	);
}
