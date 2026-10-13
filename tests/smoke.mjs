import assert from "node:assert/strict";
import { chromium, devices } from "playwright";

const browser = await chromium.launch();
const baseURL = process.env.PORTFOLIO_URL ?? "http://localhost:4321";
const errors = [];

async function checkBounds(page) {
	const viewport = page.viewportSize();
	assert.ok(viewport);
	assert.equal(
		await page.evaluate(
			() => document.documentElement.scrollWidth <= innerWidth,
		),
		true,
		"No horizontal page overflow",
	);
	const surface = await page.locator(".desktop-surface").boundingBox();
	assert.ok(surface);
	for (const window of await page.getByRole("dialog").all()) {
		const box = await window.boundingBox();
		assert.ok(box);
		assert.ok(
			box.x >= surface.x && box.y >= surface.y,
			"Window starts inside desktop",
		);
		assert.ok(
			box.x + box.width <= surface.x + surface.width + 1,
			"Window fits desktop width",
		);
		assert.ok(
			box.y + box.height <= surface.y + surface.height + 1,
			"Window fits above taskbar",
		);
	}
}

try {
	const desktop = await browser.newContext({
		viewport: { width: 1440, height: 900 },
	});
	const page = await desktop.newPage();
	page.on("pageerror", (error) => errors.push(error.message));
	await page.goto(baseURL);
	await page.locator("astro-island[ssr]").waitFor({ state: "detached" });
	assert.equal(
		await page
			.getByRole("navigation", { name: "Portfolio sections" })
			.getByRole("button")
			.count(),
		7,
	);
	const aboutIcon = page.getByRole("button", {
		name: "Open About Me",
		exact: true,
	});
	await aboutIcon.focus();
	await aboutIcon.press("Enter");
	await page.getByRole("dialog", { name: "About Me" }).waitFor();
	assert.equal(
		await page
			.getByRole("heading", { name: "About Me", exact: true })
			.evaluate((element) => element === document.activeElement),
		true,
	);
	const about = page.getByRole("dialog", { name: "About Me" });
	assert.equal(
		await about.getByText("Curiosity, with a defensive mindset.").isVisible(),
		true,
	);
	assert.equal(
		await about.locator(".profile-heading h3").textContent(),
		"[Your name]",
	);
	assert.equal(
		await about.getByRole("link", { name: /Email me/ }).getAttribute("href"),
		"mailto:your.name@example.com",
	);
	await about.getByRole("button", { name: "Open resume", exact: true }).click();
	const resume = page.getByRole("dialog", { name: "Resume" });
	await resume.waitFor();
	assert.equal(
		await resume.getByRole("button", { name: /Open resume PDF/ }).isDisabled(),
		true,
	);
	await page
		.getByRole("heading", { name: "Resume", exact: true })
		.press("Escape");
	await page
		.getByRole("button", { name: "Open Projects", exact: true })
		.dblclick();
	const projects = page.getByRole("dialog", { name: "Projects" });
	await projects.waitFor();
	const cards = projects.locator(".entry-card");
	assert.equal(
		await cards.count(),
		2,
		"Project collection renders both Markdown entries",
	);
	assert.equal(
		await cards
			.first()
			.getByRole("heading", { name: "[Project title] · Detection lab" })
			.isVisible(),
		true,
	);
	assert.equal(
		await cards
			.first()
			.getByRole("heading", { name: "Evidence and takeaways" })
			.isVisible(),
		true,
		"Markdown body renders inside its styled card",
	);
	assert.equal(await cards.first().locator(".markdown-content li").count(), 2);
	assert.equal(await cards.first().locator(".tags li").count(), 3);
	assert.equal(
		await cards
			.first()
			.getByRole("button", { name: /Project repository/ })
			.isDisabled(),
		true,
	);
	await checkBounds(page);
	const taskbar = page.getByRole("navigation", { name: "Open windows" });
	await taskbar.getByRole("button", { name: "Show About Me" }).click();
	assert.ok(
		Number(await about.evaluate((element) => element.style.zIndex)) >
			Number(await projects.evaluate((element) => element.style.zIndex)),
	);
	await about.getByRole("button", { name: "Minimize About Me" }).click();
	await taskbar.getByRole("button", { name: "Restore About Me" }).click();
	await page
		.getByRole("heading", { name: "About Me", exact: true })
		.press("Escape");
	await projects.getByRole("button", { name: "Close Projects" }).click();
	await aboutIcon.focus();
	await aboutIcon.press("Space");
	await about.waitFor();
	await about.getByRole("button", { name: "Close About Me" }).click();
	assert.equal(
		await aboutIcon.evaluate((element) => element === document.activeElement),
		true,
	);
	for (const title of [
		"About Me",
		"Projects",
		"Experience",
		"Certifications",
		"Cybersecurity Write-ups",
		"Resume",
		"Contact",
	]) {
		// Keyboard activation remains accessible even when windows cover desktop icons.
		await page
			.getByRole("button", { name: `Open ${title}`, exact: true })
			.focus();
		await page
			.getByRole("button", { name: `Open ${title}`, exact: true })
			.press("Enter");
		const window = page.getByRole("dialog", { name: title, exact: true });
		assert.equal(
			(await window.locator(".markdown-content").count()) > 0,
			true,
			`${title} renders Markdown`,
		);
		assert.equal(
			await window.getByRole("alert").count(),
			0,
			`${title} has a content slot`,
		);
		assert.equal(await window.getByText(/Template content/).isVisible(), true);
	}
	assert.equal(await page.getByRole("dialog").count(), 7);
	for (const title of ["Visual Studio Code", "iTerm2", "Figma", "Music"]) {
		await page
			.getByRole("navigation", { name: "Applications" })
			.getByRole("button", { name: `Open ${title}`, exact: true })
			.click();
		const window = page.getByRole("dialog", { name: title, exact: true });
		assert.equal(
			await window.locator(".lead").isVisible(),
			true,
			`${title} renders its Markdown content`,
		);
		assert.equal(await window.getByRole("alert").count(), 0);
		await window
			.getByRole("button", { name: `Close ${title}`, exact: true })
			.click();
	}
	await page.setViewportSize({ width: 768, height: 480 });
	await checkBounds(page);
	await desktop.close();

	const mobile = await browser.newContext({
		...devices["iPhone 13"],
		reducedMotion: "reduce",
	});
	const touch = await mobile.newPage();
	touch.on("pageerror", (error) => errors.push(error.message));
	await touch.goto(baseURL);
	await touch.locator("astro-island[ssr]").waitFor({ state: "detached" });
	await touch.getByRole("button", { name: "Open Projects", exact: true }).tap();
	await touch.getByRole("dialog", { name: "Projects" }).waitFor();
	assert.equal(await touch.getByRole("dialog").count(), 1);
	await checkBounds(touch);
	await touch
		.getByRole("dialog")
		.getByRole("button", { name: "Minimize Projects" })
		.tap();
	await touch.getByRole("button", { name: "Open Contact", exact: true }).tap();
	await touch.getByRole("dialog", { name: "Contact" }).waitFor();
	await touch
		.getByRole("navigation", { name: "Open windows" })
		.getByRole("button", { name: "Restore Projects" })
		.tap();
	assert.equal(await touch.getByRole("dialog").count(), 1);
	assert.equal(
		await touch.getByRole("dialog", { name: "Projects" }).isVisible(),
		true,
	);
	await touch.setViewportSize({ width: 320, height: 568 });
	await checkBounds(touch);
	await touch.setViewportSize({ width: 844, height: 390 });
	assert.equal(
		await touch.getByRole("dialog").count(),
		1,
		"Mobile landscape keeps one active window",
	);
	await checkBounds(touch);
	await mobile.close();

	const noJS = await browser.newContext({ javaScriptEnabled: false });
	const fallback = await noJS.newPage();
	await fallback.goto(baseURL);
	assert.equal(
		await fallback
			.locator(".no-script")
			.getByText("Curiosity, with a defensive mindset.")
			.isVisible(),
		true,
		"No-JavaScript view shares Markdown biography",
	);
	assert.equal(
		await fallback
			.locator(".no-script")
			.getByRole("heading", { name: "Evidence and takeaways" })
			.isVisible(),
		true,
		"No-JavaScript view shares Markdown entry bodies",
	);
	assert.equal(
		await fallback
			.locator(".no-script")
			.getByRole("heading", { name: "Contact" })
			.isVisible(),
		true,
	);
	await noJS.close();
	assert.deepEqual(errors, [], "No browser runtime or hydration errors");
	console.log(
		"Desktop keyboard/window, mobile touch/bounds, and no-JavaScript smoke checks passed.",
	);
} finally {
	await browser.close();
}
