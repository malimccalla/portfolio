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
	subtitle: string;
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

const MIN_SIZE: Size = { width: 360, height: 280 };

export default function DesktopWindow({
	id,
	title,
	subtitle,
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
	const resize = useRef<{ pointer: Point; start: Size; max: Size }>(undefined);

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

	function startResize(event: PointerEvent<HTMLElement>) {
		if (zoomed || event.button !== 0) return;
		const windowElement = event.currentTarget.parentElement;
		const layer = windowElement?.parentElement;
		if (!windowElement || !layer) return;
		const box = windowElement.getBoundingClientRect();
		const bounds = layer.getBoundingClientRect();
		// Pin the current position so growing the window cannot shift its origin.
		setOrigin(
			(value) =>
				value ?? { x: box.left - bounds.left, y: box.top - bounds.top },
		);
		resize.current = {
			pointer: { x: event.clientX, y: event.clientY },
			start: { width: box.width, height: box.height },
			max: {
				width: bounds.right - box.left,
				height: bounds.bottom - box.top,
			},
		};
		event.currentTarget.setPointerCapture?.(event.pointerId);
	}

	function moveResize(event: PointerEvent<HTMLElement>) {
		const current = resize.current;
		if (!current) return;
		const clamp = (value: number, min: number, max: number) =>
			Math.round(Math.min(Math.max(value, min), Math.max(min, max)));
		setSize({
			width: clamp(
				current.start.width + event.clientX - current.pointer.x,
				MIN_SIZE.width,
				current.max.width,
			),
			height: clamp(
				current.start.height + event.clientY - current.pointer.y,
				MIN_SIZE.height,
				current.max.height,
			),
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
			<footer className="window-footer">
				<span>{subtitle}</span>
				<span className="keyboard-hint">esc to close</span>
			</footer>
			<div
				className="window-resize"
				aria-hidden="true"
				onPointerDown={startResize}
				onPointerMove={moveResize}
				onPointerUp={() => {
					resize.current = undefined;
				}}
				onPointerCancel={() => {
					resize.current = undefined;
				}}
				onDoubleClick={() => setSize(undefined)}
			>
				<svg viewBox="0 0 12 12" aria-hidden="true">
					<path d="M10.5 4.5v6h-6M10.5 8.5v2h-2" />
				</svg>
			</div>
		</section>
	);
}
