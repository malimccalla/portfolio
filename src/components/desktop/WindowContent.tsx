import {
	interests,
	type PortfolioEntry,
	profile,
	projects,
	type WindowId,
	writeups,
} from "../../data/portfolio";
import Icon, { AppIcon } from "./Icon";

function PlaceholderNotice() {
	return (
		<p className="placeholder-note">
			<span className="status-dot" /> Template content · Replace bracketed
			details and links before publishing.
		</p>
	);
}

function EntryCard({ entry, index }: { entry: PortfolioEntry; index: number }) {
	return (
		<article className="entry-card">
			<span className="eyebrow">FIELD NOTES / 0{index + 1}</span>
			<h3>{entry.title}</h3>
			<p>{entry.summary}</p>
			<h4>Tools & technologies</h4>
			<ul className="tags">
				{entry.tools.map((tool) => (
					<li key={tool}>{tool}</li>
				))}
			</ul>
			<h4>Security concepts</h4>
			<p className="concepts">{entry.concepts.join(" / ")}</p>
			{entry.href ? (
				<a
					className="text-action"
					href={entry.href}
					target="_blank"
					rel="noreferrer"
				>
					{entry.linkLabel} <span aria-hidden="true">↗</span>
				</a>
			) : (
				<button type="button" className="text-action" disabled>
					{entry.linkLabel} <span aria-hidden="true">↗</span>{" "}
					<span className="link-placeholder">[Add URL]</span>
				</button>
			)}
		</article>
	);
}

export function ProfileLinks() {
	return (
		<div className="action-links">
			<a className="button-link primary" href={`mailto:${profile.email}`}>
				Email me <span aria-hidden="true">↗</span>
			</a>
			<a
				className="button-link"
				href={profile.github}
				target="_blank"
				rel="noreferrer"
			>
				GitHub <span aria-hidden="true">↗</span>
			</a>
			<a
				className="button-link"
				href={profile.linkedin}
				target="_blank"
				rel="noreferrer"
			>
				LinkedIn <span aria-hidden="true">↗</span>
			</a>
		</div>
	);
}

export default function WindowContent({
	id,
	onOpen,
}: {
	id: WindowId;
	onOpen: (id: WindowId) => void;
}) {
	const interest = interests.find((app) => app.id === id);
	if (interest) {
		return (
			<>
				<PlaceholderNotice />
				<div className="interest-heading">
					<span className="interest-icon">
						<AppIcon app={interest} />
					</span>
					<div>
						<span className="eyebrow">OUTSIDE OF WORK</span>
						<h3>{interest.title}</h3>
					</div>
				</div>
				<p className="lead">{interest.summary}</p>
				<p>
					[This app is a placeholder. Fill it with photos, links, playlists, or
					anything else that shows this side of you.]
				</p>
			</>
		);
	}
	return (
		<>
			<PlaceholderNotice />
			{id === "about" && (
				<>
					<div className="profile-heading">
						<div className="profile-avatar" aria-hidden="true">
							&gt;_
						</div>
						<div>
							<span className="eyebrow">HELLO, I'M</span>
							<h3>{profile.name}</h3>
							<p>{profile.role}</p>
						</div>
					</div>
					<p className="lead">Curiosity, with a defensive mindset.</p>
					<p>
						[Write a short introduction: what interests you in cybersecurity,
						what you are currently learning, and the kind of work you want to
						do. Keep it specific and honest.]
					</p>
					<div className="info-grid">
						<article className="info-card">
							<h4>Focus areas</h4>
							<p>[Your security interests]</p>
						</article>
						<article className="info-card">
							<h4>Currently exploring</h4>
							<p>[Your current learning or lab]</p>
						</article>
					</div>
					<ProfileLinks />
					<button
						type="button"
						className="text-action"
						onClick={() => onOpen("resume")}
					>
						Open resume <span aria-hidden="true">↗</span>
					</button>
				</>
			)}
			{(id === "projects" || id === "writeups") && (
				<>
					<p className="lead">
						{id === "projects"
							? "Practical work. Clear takeaways."
							: "Making the investigation readable."}
					</p>
					<p>
						{id === "projects"
							? "A place for your authorized labs, tools, and security-focused builds."
							: "A place for your methodology, evidence, and defensive lessons."}{" "}
						Entries below are examples of structure, not completed work.
					</p>
					<div className="entry-list">
						{(id === "projects" ? projects : writeups).map((entry, index) => (
							<EntryCard key={entry.title} entry={entry} index={index} />
						))}
					</div>
				</>
			)}
			{id === "experience" && (
				<>
					<p className="lead">The path, not just the job titles.</p>
					<article className="entry-card timeline-entry">
						<span className="eyebrow">[START DATE] — [END DATE / PRESENT]</span>
						<h3>[Role, education, volunteering, or lab experience]</h3>
						<p>[Organization or independent learning context]</p>
						<ul className="detail-list">
							<li>[Describe your responsibilities or learning goals.]</li>
							<li>[Add a concrete contribution and supporting evidence.]</li>
							<li>[Explain the security skills you practiced.]</li>
						</ul>
					</article>
					<p>
						No employers or employment history are claimed by this template.
					</p>
				</>
			)}
			{id === "certifications" && (
				<>
					<p className="lead">Learning, backed by evidence.</p>
					<article className="entry-card">
						<span className="eyebrow">
							[EARNED / IN PROGRESS — CHOOSE ACCURATELY]
						</span>
						<h3>[Certification or course name]</h3>
						<p>[Issuing organization] · [Date, if earned]</p>
						<p>
							[Add the topics covered and a credential verification link, if
							available.]
						</p>
						<button className="text-action" type="button" disabled>
							Verify credential{" "}
							<span className="link-placeholder">[Add URL]</span>
						</button>
					</article>
					<p>
						No certifications are claimed by this template. Remove this entry if
						it does not apply.
					</p>
				</>
			)}
			{id === "resume" && (
				<>
					<div className="resume-preview">
						<span className="resume-icon">
							<Icon kind="document" />
						</span>
						<span className="eyebrow">RESUME / PDF</span>
						<h3>{profile.name}</h3>
						<p>[A concise summary of your skills and experience]</p>
					</div>
					{profile.resumeReady ? (
						<a
							className="button-link primary"
							href={profile.resume}
							target="_blank"
							rel="noreferrer"
						>
							Open resume PDF <span aria-hidden="true">↗</span>
						</a>
					) : (
						<>
							<button type="button" className="button-link primary" disabled>
								Open resume PDF · Not added yet
							</button>
							<p>
								Add your PDF as <code>public/resume.pdf</code> and enable{" "}
								<code>resumeReady</code> in the portfolio data. This button
								stays disabled until a real document is configured.
							</p>
						</>
					)}
				</>
			)}
			{id === "contact" && (
				<>
					<p className="lead">Good conversations start here.</p>
					<p>
						[Add the opportunities, collaborations, or topics you would like to
						hear about.]
					</p>
					<ProfileLinks />
					<dl className="contact-details">
						<div>
							<dt>Email</dt>
							<dd>
								{profile.email}{" "}
								<span className="link-placeholder">[Replace]</span>
							</dd>
						</div>
						<div>
							<dt>GitHub / LinkedIn</dt>
							<dd>
								YOUR_USERNAME{" "}
								<span className="link-placeholder">[Replace both URLs]</span>
							</dd>
						</div>
						<div>
							<dt>Location / timezone</dt>
							<dd>[Your location or timezone, optional]</dd>
						</div>
					</dl>
					<p>No contact form, tracking, or account required.</p>
				</>
			)}
		</>
	);
}
