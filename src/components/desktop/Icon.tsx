import type { IconKind } from "../../data/portfolio";

export default function Icon({ kind }: { kind: IconKind }) {
	return (
		<svg
			viewBox="0 0 48 48"
			fill="none"
			aria-hidden="true"
			className={`icon icon-${kind}`}
		>
			{kind === "folder" && (
				<>
					<path
						d="M5 13a4 4 0 0 1 4-4h11l5 5h14a4 4 0 0 1 4 4v18a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4Z"
						fill="currentColor"
						opacity=".35"
					/>
					<path
						d="M5 21a4 4 0 0 1 4-4h30a4 4 0 0 1 4 4v15a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4Z"
						fill="currentColor"
					/>
					<path
						d="M12 24h12"
						stroke="#fff"
						strokeOpacity=".45"
						strokeWidth="2"
						strokeLinecap="round"
					/>
				</>
			)}
			{kind === "person" && (
				<>
					<rect
						x="7"
						y="5"
						width="34"
						height="38"
						rx="7"
						fill="currentColor"
						opacity=".2"
					/>
					<circle cx="24" cy="19" r="7" fill="currentColor" />
					<path d="M12 37c0-7 5-11 12-11s12 4 12 11" fill="currentColor" />
				</>
			)}
			{kind === "document" && (
				<>
					<path d="M11 5h18l9 9v29H11Z" fill="currentColor" opacity=".8" />
					<path d="M29 5v10h9" fill="#fff" fillOpacity=".35" />
					<path
						d="M18 24h13M18 30h13M18 36h8"
						stroke="#15232b"
						strokeWidth="2"
						strokeLinecap="round"
					/>
				</>
			)}
			{kind === "mail" && (
				<>
					<rect
						x="5"
						y="11"
						width="38"
						height="28"
						rx="5"
						fill="currentColor"
						opacity=".85"
					/>
					<path
						d="m7 14 17 13 17-13"
						stroke="#15232b"
						strokeWidth="2"
						strokeLinejoin="round"
					/>
				</>
			)}
			{kind === "shield" && (
				<>
					<path
						d="m24 5 16 7v11c0 10-10 17-16 20C18 40 8 33 8 23V12Z"
						stroke="currentColor"
						strokeWidth="2"
						fill="currentColor"
						fillOpacity=".1"
					/>
					<path
						d="m17 24 5 5 10-11"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</>
			)}
		</svg>
	);
}
