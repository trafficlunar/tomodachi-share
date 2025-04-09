export default function PrivacyPage() {
	return (
		<div>
			<h1 className="text-2xl font-bold">Terms of Service</h1>
			<h2 className="font-light">
				<strong className="font-medium">Effective Date:</strong> April 06, 2025
			</h2>

			<hr className="border-black/20 mt-1 mb-4" />

			<p>
				By registering for, or using this service, you confirm that you understand and agree to the terms below. If you do not agree to these terms,
				you should not use the service.
			</p>
			<p className="mt-1">
				If you have any questions or concerns, please contact me at:{" "}
				<a href="mailto:hello@trafficlunar.net" className="text-blue-700">
					hello@trafficlunar.net
				</a>
				.
			</p>

			<ul className="list-decimal ml-5 marker:text-xl marker:font-semibold">
				<li>
					<h3 className="text-xl font-semibold mt-6 mb-2">Usage Policy</h3>

					<section>
						<p className="mb-2">As a user of this site, you must abide by these guidelines:</p>
						<ul className="list-disc list-inside">
							<li>Nothing that would interfere with or gain unauthorized access to the website or its systems.</li>
							<li>Nothing that is against the law in the United Kingdom.</li>
							<li>No NSFW, violent, gory, or inappropriate Miis or images.</li>
							<li>No spam.</li>
							<li>No impersonation of others.</li>
							<li>No malware, malicious links, or phishing content.</li>
							<li>No harassment, hate speech, threats, or bullying towards others.</li>
							<li>No use of automated scripts, bots, or scrapers to access or interact with the site.</li>
						</ul>
					</section>
				</li>
				<li>
					<h3 className="text-xl font-semibold mt-6 mb-2">Termination</h3>

					<section>
						<p className="mb-2">
							We reserve the right to suspend or terminate your access to the site at any time if you violate these Terms of Service or engage in any
							activities that disrupt the functionality of the site.
						</p>
						<p>
							To request deletion of your account and personal data, please refer to the{" "}
							<a href="/privacy" className="text-blue-700">
								Privacy Policy
							</a>{" "}
							(see &quot;Data Deletion&quot;) or email me at{" "}
							<a href="mailto:hello@trafficlunar.net" className="text-blue-700">
								hello@trafficlunar.net
							</a>
						</p>
					</section>
				</li>
				<li>
					<h3 className="text-xl font-semibold mt-6 mb-2">Eligibility</h3>
					<section>
						<p className="mb-2">By using this service, you confirm that you are at least 13 years old or have the consent of a parent or guardian.</p>
					</section>
				</li>

				<li>
					<h3 className="text-xl font-semibold mt-6 mb-2">Liability</h3>

					<section>
						<p className="mb-2">
							This service is provided &quot;as is&quot; and without any warranties. We are not responsible for any user-generated content or the
							actions of users on the site. You use the site at your own risk.
						</p>
						<p>
							We do not guarantee continuous or secure access to the service and are not liable for any damages resulting from interruptions, loss of
							data, or unauthorized access.
						</p>
					</section>
				</li>
				<li>
					<h3 className="text-xl font-semibold mt-6 mb-2">DMCA & Copyright</h3>

					<section>
						<p className="mb-2">
							If you believe that content uploaded to this site infringes on your copyright, you may submit a DMCA takedown request by emailing{" "}
							<a href="mailto:hello@trafficlunar.net" className="text-blue-700">
								hello@trafficlunar.net
							</a>
							.
						</p>
						<p className="mb-2">Please include:</p>
						<ul className="list-disc list-inside">
							<li>Your name and contact information</li>
							<li>A description of the copyrighted work</li>
							<li>A link to the allegedly infringing material</li>
							<li>A statement that you have a good faith belief that the use is not authorized</li>
							<li>
								A statement that the information in the notice is accurate and, under penalty of perjury, that you are authorized to act on behalf of
								the copyright owner
							</li>
							<li>Your electronic or physical signature</li>
						</ul>
					</section>
				</li>
				<li>
					<h3 className="text-xl font-semibold mt-6 mb-2">Nintendo Disclaimer</h3>

					<section>
						<p className="mb-2">
							This site is not affiliated with, endorsed by, or associated with Nintendo in any way. &quot;Mii&quot; and all related character designs
							are trademarks of Nintendo Co., Ltd.
						</p>
						<p>
							All Mii-related content is shared by users under the assumption that it does not violate any third-party rights. If you believe your
							rights have been infringed, please see the DMCA section above.
						</p>
					</section>
				</li>
				<li>
					<h3 className="text-xl font-semibold mt-6 mb-2">Changes to this Terms of Service</h3>

					<section>
						<p className="mb-2">
							This Terms of Service may be updated from time to time. We encourage you to review the terms periodically to stay informed about the use
							of the site. We may notify users via a site banner or other means if changes are made to the Terms of Service.
						</p>
					</section>
				</li>
			</ul>
		</div>
	);
}
