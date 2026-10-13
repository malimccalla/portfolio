import { useId } from "react";
import type { AppGlyph, DockApp, IconKind } from "../../data/portfolio";

export default function Icon({ kind }: { kind: IconKind }) {
	const uid = useId();
	if (kind === "document" || kind === "markdown") {
		const markdown = kind === "markdown";
		return (
			<svg
				viewBox="0 0 64 64"
				aria-hidden="true"
				className={`icon ${markdown ? "icon-markdown" : "icon-document"}`}
			>
				<defs>
					<linearGradient id={`doc-paper${uid}`} x1="0" y1="0" x2="0" y2="1">
						<stop offset="0" stopColor="#ffffff" />
						<stop offset="1" stopColor="#e9edf2" />
					</linearGradient>
				</defs>
				<path
					d="M14 4h26l12 12v42a2 2 0 0 1-2 2H14a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"
					fill={`url(#doc-paper${uid})`}
					stroke="#c4cbd4"
				/>
				<path d="M40 4v10a2 2 0 0 0 2 2h10" fill="#dfe4ea" stroke="#c4cbd4" />
				<path
					d="M19 24h26M19 30h26M19 36h18"
					stroke="#b8c0ca"
					strokeWidth="2"
					strokeLinecap="round"
				/>
				<rect
					x="16"
					y="44"
					width="22"
					height="10"
					rx="2"
					fill={markdown ? "#3d9be6" : "#e5483f"}
				/>
				<text
					x="27"
					y="51.6"
					textAnchor="middle"
					fontSize="7"
					fontWeight="700"
					fill="#fff"
					fontFamily="-apple-system, Helvetica, Arial, sans-serif"
				>
					{markdown ? "MD" : "PDF"}
				</text>
			</svg>
		);
	}
	return (
		<svg viewBox="0 0 64 64" aria-hidden="true" className="icon icon-folder">
			<defs>
				<linearGradient id={`folder-back${uid}`} x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor="#6cbcf5" />
					<stop offset="1" stopColor="#3d9be6" />
				</linearGradient>
				<linearGradient id={`folder-front${uid}`} x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor="#8fd1fb" />
					<stop offset="1" stopColor="#58b2f1" />
				</linearGradient>
			</defs>
			<path
				d="M4 14a4 4 0 0 1 4-4h14.3a4 4 0 0 1 2.9 1.2l3.6 3.6a4 4 0 0 0 2.9 1.2H56a4 4 0 0 1 4 4v32a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4Z"
				fill={`url(#folder-back${uid})`}
			/>
			<rect
				x="4"
				y="21"
				width="56"
				height="35"
				rx="4"
				fill={`url(#folder-front${uid})`}
			/>
			<path
				d="M4 25a4 4 0 0 1 4-4h48a4 4 0 0 1 4 4"
				stroke="#fff"
				strokeOpacity=".45"
				fill="none"
			/>
		</svg>
	);
}

function Glyph({ glyph }: { glyph: AppGlyph }) {
	const stroke = {
		stroke: "#fff",
		strokeWidth: 3,
		strokeLinecap: "round" as const,
		strokeLinejoin: "round" as const,
		fill: "none",
	};
	switch (glyph) {
		case "music":
			return (
				<>
					<path d="M26 42V18l18-4v24" {...stroke} />
					<circle cx="21" cy="42" r="5" fill="#fff" />
					<circle cx="39" cy="38" r="5" fill="#fff" />
				</>
			);
		case "camera":
			return (
				<>
					<path
						d="M14 22h7l3-5h12l3 5h7a2 2 0 0 1 2 2v18a2 2 0 0 1-2 2H14a2 2 0 0 1-2-2V24a2 2 0 0 1 2-2Z"
						{...stroke}
					/>
					<circle cx="30" cy="33" r="7" {...stroke} />
				</>
			);
		case "gamepad":
			return (
				<>
					<path
						d="M20 22h20c6 0 9 5 10 12 1 6-2 10-6 8l-6-5H22l-6 5c-4 2-7-2-6-8 1-7 4-12 10-12Z"
						{...stroke}
					/>
					<path d="M21 29v6M18 32h6" {...stroke} />
					<circle cx="38" cy="30" r="1.8" fill="#fff" />
					<circle cx="42" cy="34" r="1.8" fill="#fff" />
				</>
			);
		case "book":
			return (
				<>
					<path
						d="M30 20c-4-3-9-4-15-3v24c6-1 11 0 15 3 4-3 9-4 15-3V17c-6-1-11 0-15 3Z"
						{...stroke}
					/>
					<path d="M30 20v24" {...stroke} />
				</>
			);
	}
}

export function AppIcon({ app }: { app: DockApp }) {
	const gradientId = `app-${useId()}`;
	if (app.icon) {
		return (
			<img
				src={app.icon}
				alt=""
				className={`app-icon ${app.tile ? "has-tile" : ""}`}
				style={
					app.tile
						? {
								background: `linear-gradient(${app.colors[0]}, ${app.colors[1]})`,
							}
						: undefined
				}
			/>
		);
	}
	return (
		<svg viewBox="0 0 60 60" aria-hidden="true" className="app-icon">
			<defs>
				<linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor={app.colors[0]} />
					<stop offset="1" stopColor={app.colors[1]} />
				</linearGradient>
			</defs>
			<rect
				x="2"
				y="2"
				width="56"
				height="56"
				rx="13"
				fill={`url(#${gradientId})`}
			/>
			<rect
				x="2.5"
				y="2.5"
				width="55"
				height="55"
				rx="12.5"
				fill="none"
				stroke="#fff"
				strokeOpacity=".22"
			/>
			{app.glyph && <Glyph glyph={app.glyph} />}
		</svg>
	);
}
