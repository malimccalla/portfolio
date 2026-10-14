import {
	type CSSProperties,
	type PointerEvent,
	type ReactNode,
	useRef,
	useState,
} from "react";

interface Props {
	id: string;
	title: string;
	active: boolean;
	hidden: boolean;
	stack: number;
	position: number;
	onActivate: () => void;
	onClose: () => void;
	onMinimize: () => void;
	children: ReactNode;
}

interface Point {
	x: number;
	y: number;
}

interface Size {
	width: number;
	height: number;
}

type Corner = "nw" | "ne" | "sw" | "se";

const MIN_SIZE: Size = { width: 360, height: 280 };
const CORNERS: Corner[] = ["nw", "ne", "sw", "se"];

export default function DesktopWindow({
	id,
	title,
	active,
	hidden,
	stack,
	position,
	onActivate,
	onClose,
	onMinimize,
	children,
}: Props) {
	const [zoomed, setZoomed] = useState(false);
	const [origin, setOrigin] = useState<Point>();
	const [size, setSize] = useState<Size>();
	const drag = useRef<{ pointer: Point; start: Point; bounds: DOMRect }>(
		undefined,
	);
	const resize = useRef<{
		pointer: Point;
		corner: Corner;
		start: DOMRect;
		bounds: Size;
	}>(undefined);

	const style: CSSProperties & Record<`--${string}`, string> = {
		zIndex: stack,
		"--window-offset": `${position * 28}px`,
	};
	if (origin) {
		style["--window-x"] = `${origin.x}px`;
		style["--window-y"] = `${origin.y}px`;
	}
	if (size) {
		style["--w"] = `${size.width}px`;
		style["--h"] = `${size.height}px`;
	}

	function startDrag(event: PointerEvent<HTMLElement>) {
		if (
			zoomed ||
			event.button !== 0 ||
			(event.target instanceof Element && event.target.closest("button"))
		)
			return;
		const windowElement = event.currentTarget.parentElement;
		const layer = windowElement?.parentElement;
		if (!windowElement || !layer) return;
		const box = windowElement.getBoundingClientRect();
		const bounds = layer.getBoundingClientRect();
		drag.current = {
			pointer: { x: event.clientX, y: event.clientY },
			start: { x: box.left - bounds.left, y: box.top - bounds.top },
			bounds: new DOMRect(
				0,
				0,
				bounds.width - box.width,
				bounds.height - box.height,
			),
		};
		event.currentTarget.setPointerCapture?.(event.pointerId);
	}

	function moveDrag(event: PointerEvent<HTMLElement>) {
		const current = drag.current;
		if (!current) return;
		const clamp = (value: number, max: number) =>
			Math.round(Math.min(Math.max(value, 0), Math.max(max, 0)));
		setOrigin({
			x: clamp(
				current.start.x + event.clientX - current.pointer.x,
				current.bounds.width,
			),
			y: clamp(
				current.start.y + event.clientY - current.pointer.y,
				current.bounds.height,
			),
		});
	}

	function startResize(event: PointerEvent<HTMLElement>, corner: Corner) {
		if (zoomed || event.button !== 0) return;
		const windowElement = event.currentTarget.parentElement;
		const layer = windowElement?.parentElement;
		if (!windowElement || !layer) return;
		const box = windowElement.getBoundingClientRect();
		const bounds = layer.getBoundingClientRect();
		const start = new DOMRect(
			box.left - bounds.left,
			box.top - bounds.top,
			box.width,
			box.height,
		);
		// Pin the current position so resizing cannot shift the anchored corner.
		setOrigin(
			(value) =>
				value ?? { x: Math.round(start.left), y: Math.round(start.top) },
		);
		resize.current = {
			pointer: { x: event.clientX, y: event.clientY },
			corner,
			start,
			bounds: { width: bounds.width, height: bounds.height },
		};
		event.currentTarget.setPointerCapture?.(event.pointerId);
	}

	function moveResize(event: PointerEvent<HTMLElement>) {
		const current = resize.current;
		if (!current) return;
		const { bounds, corner, pointer, start } = current;
		const west = corner === "nw" || corner === "sw";
		const north = corner === "nw" || corner === "ne";
		const clamp = (value: number, min: number, max: number) =>
			Math.round(Math.min(Math.max(value, min), Math.max(min, max)));
		const dx = event.clientX - pointer.x;
		const dy = event.clientY - pointer.y;
		const width = clamp(
			start.width + (west ? -dx : dx),
			MIN_SIZE.width,
			west ? start.right : bounds.width - start.left,
		);
		const height = clamp(
			start.height + (north ? -dy : dy),
			MIN_SIZE.height,
			north ? start.bottom : bounds.height - start.top,
		);
		setSize({ width, height });
		setOrigin({
			x: Math.max(0, Math.round(west ? start.right - width : start.left)),
			y: Math.max(0, Math.round(north ? start.bottom - height : start.top)),
		});
	}

	return (
		<section
			role="dialog"
			aria-labelledby={`title-${id}`}
			className={`desktop-window ${active ? "is-active" : ""} ${zoomed ? "is-zoomed" : ""} ${origin ? "is-placed" : ""}`}
			style={style}
			hidden={hidden}
			onFocusCapture={onActivate}
			onPointerDownCapture={(event) => {
				onActivate();
				if (
					event.target instanceof Element &&
					!event.target.closest("button, a, input, textarea, select")
				) {
					event.currentTarget.querySelector<HTMLElement>("h2")?.focus();
				}
			}}
		>
			{/* biome-ignore lint/a11y/noStaticElementInteractions: Dragging and double-click zoom are pointer enhancements; keyboard users have the zoom button. */}
			<header
				className="window-titlebar"
				onPointerDown={startDrag}
				onPointerMove={moveDrag}
				onPointerUp={() => {
					drag.current = undefined;
				}}
				onPointerCancel={() => {
					drag.current = undefined;
				}}
				onDoubleClick={(event) => {
					if (
						!(event.target instanceof Element && event.target.closest("button"))
					)
						setZoomed((value) => !value);
				}}
			>
				<div className="traffic-lights">
					<button
						type="button"
						className="traffic-light close"
						aria-label={`Close ${title}`}
						onClick={onClose}
					>
						<svg viewBox="0 0 12 12" aria-hidden="true">
							<path d="m3.5 3.5 5 5m0-5-5 5" />
						</svg>
					</button>
					<button
						type="button"
						className="traffic-light minimize"
						aria-label={`Minimize ${title}`}
						onClick={onMinimize}
					>
						<svg viewBox="0 0 12 12" aria-hidden="true">
							<path d="M3 6h6" />
						</svg>
					</button>
					<button
						type="button"
						className="traffic-light zoom"
						aria-label={`${zoomed ? "Restore size of" : "Zoom"} ${title}`}
						aria-pressed={zoomed}
						onClick={() => setZoomed((value) => !value)}
					>
						<svg viewBox="0 0 12 12" aria-hidden="true">
							<path d="M3.5 7.5v-4h4ZM8.5 4.5v4h-4Z" />
						</svg>
					</button>
				</div>
				<h2 id={`title-${id}`} tabIndex={-1}>
					{title}
				</h2>
			</header>
			<div className="window-body">{children}</div>
			{CORNERS.map((corner) => (
				<div
					key={corner}
					className={`window-resize window-resize-${corner}`}
					aria-hidden="true"
					onPointerDown={(event) => startResize(event, corner)}
					onPointerMove={moveResize}
					onPointerUp={() => {
						resize.current = undefined;
					}}
					onPointerCancel={() => {
						resize.current = undefined;
					}}
					onDoubleClick={() => setSize(undefined)}
				/>
			))}
		</section>
	);
}
