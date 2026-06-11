const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawn } = require("child_process");

const DEFAULT_WORKFLOW_PATH = path.resolve(__dirname, "../doc/workflows.md");
const CONFIG_KEYS = ["DOC_LIST_FILE", "PROMPT_TEMPLATE", "OUTPUT_DIR", "MAX_CONCURRENCY"];

function parseWorkflowConfig(markdown, workflowPath = DEFAULT_WORKFLOW_PATH) {
	const values = {};

	for (const key of CONFIG_KEYS) {
		const match = markdown.match(new RegExp(`^${key}\\s*=\\s*(.+?)\\s*$`, "m"));
		if (!match) {
			throw new Error(`Missing ${key} in ${workflowPath}`);
		}
		values[key] = match[1];
	}

	const maxConcurrency = Number(values.MAX_CONCURRENCY);
	if (!Number.isInteger(maxConcurrency) || maxConcurrency < 1) {
		throw new Error(`Invalid MAX_CONCURRENCY in ${workflowPath}`);
	}

	const workflowDir = path.dirname(workflowPath);
	return {
		docListPath: path.resolve(workflowDir, values.DOC_LIST_FILE),
		promptTemplatePath: path.resolve(workflowDir, values.PROMPT_TEMPLATE),
		outputDir: path.resolve(workflowDir, values.OUTPUT_DIR),
		maxConcurrency,
	};
}

function parseDocumentList(text) {
	const visitedUrls = new Set();
	const entries = [];

	for (const line of text.split(/\r?\n/)) {
		const url = line.trim();
		if (!url || url.startsWith("#")) {
			continue;
		}

		if (visitedUrls.has(url)) {
			entries.push({ url, duplicate: true });
			continue;
		}

		new URL(url);
		visitedUrls.add(url);
		entries.push({ url, duplicate: false });
	}

	return entries;
}

function getSlug(url) {
	const pathname = new URL(url).pathname;
	const lastSegment = pathname.split("/").filter(Boolean).at(-1);
	if (!lastSegment) {
		throw new Error(`Cannot derive a filename from ${url}`);
	}

	const slug = lastSegment.replace(/\.md$/i, "");
	if (!slug || slug === "." || slug === "..") {
		throw new Error(`Cannot derive a safe filename from ${url}`);
	}

	return slug;
}

function readExistingOutputs(outputDir) {
	const outputs = [];

	for (const name of fs.readdirSync(outputDir)) {
		const match = name.match(/^(\d+)__(.+)\.md$/);
		if (!match) {
			continue;
		}

		outputs.push({
			name,
			number: Number(match[1]),
			slug: match[2],
			outputPath: path.join(outputDir, name),
		});
	}

	return outputs.sort((left, right) => left.number - right.number);
}

function getNavLabel(slug) {
	return slug.replace(/-/g, " ");
}

function getNavLink(task) {
	const filename = path.basename(task.outputPath);
	return `[${getNavLabel(task.slug)}](./${filename})`;
}

function buildNavigationContext(tasks) {
	const uniqueTasks = tasks.filter((task) => !task.duplicate);
	const navByIndex = new Map();

	uniqueTasks.forEach((task, position) => {
		navByIndex.set(task.index, {
			prev: position > 0 ? getNavLink(uniqueTasks[position - 1]) : "无",
			next:
				position < uniqueTasks.length - 1
					? getNavLink(uniqueTasks[position + 1])
					: "无",
		});
	});

	return navByIndex;
}

function buildTaskQueue(entries, outputDir) {
	const existingOutputs = readExistingOutputs(outputDir);
	const existingBySlug = new Map();
	let nextNumber = 1;

	for (const output of existingOutputs) {
		nextNumber = Math.max(nextNumber, output.number + 1);
		if (!existingBySlug.has(output.slug)) {
			existingBySlug.set(output.slug, output);
		}
	}

	const claimedOutputs = new Set();
	return entries.map((entry, index) => {
		if (entry.duplicate) {
			return { ...entry, index, status: "duplicate" };
		}

		const slug = getSlug(entry.url);
		const existing = existingBySlug.get(slug);
		if (existing && !claimedOutputs.has(existing.outputPath)) {
			claimedOutputs.add(existing.outputPath);
			return {
				...entry,
				index,
				slug,
				outputPath: existing.outputPath,
				overwrite: true,
			};
		}

		const outputPath = path.join(outputDir, `${nextNumber}__${slug}.md`);
		nextNumber += 1;
		claimedOutputs.add(outputPath);
		return { ...entry, index, slug, outputPath, overwrite: false };
	});
}

async function fetchPage(url) {
	const response = await fetch(url, {
		headers: { "user-agent": "expo-tutorial-doc-generator" },
	});

	if (!response.ok) {
		throw new Error(`HTTP ${response.status} ${response.statusText}`);
	}

	return response.text();
}

function generateMarkdown({ prompt, source, currentUrl }) {
	return new Promise((resolve, reject) => {
		const child = spawn(
			"codex",
			[
				"exec",
				"--ephemeral",
				"--ignore-user-config",
				"--skip-git-repo-check",
				"--sandbox",
				"read-only",
				"--color",
				"never",
				"-C",
				os.tmpdir(),
				prompt,
			],
			{
				cwd: os.tmpdir(),
				stdio: ["pipe", "pipe", "pipe"],
			},
		);

		let stdout = "";
		let stderr = "";
		child.stdout.setEncoding("utf8");
		child.stderr.setEncoding("utf8");
		child.stdout.on("data", (chunk) => {
			stdout += chunk;
		});
		child.stderr.on("data", (chunk) => {
			stderr += chunk;
		});
		child.on("error", (error) => {
			reject(new Error(`Failed to start Codex for ${currentUrl}: ${error.message}`));
		});
		child.on("close", (code) => {
			if (code !== 0) {
				reject(
					new Error(
						`Codex failed for ${currentUrl} with exit code ${code}: ${stderr.trim()}`,
					),
				);
				return;
			}

			const content = stdout.trim();
			if (!content) {
				reject(new Error(`Codex returned empty content for ${currentUrl}`));
				return;
			}

			resolve(`${content}\n`);
		});

		child.stdin.end(source);
	});
}

async function processTask(task, promptTemplate, navigationContext) {
	try {
		const source = await fetchPage(task.url);
		const navigation = navigationContext.get(task.index) || { prev: "无", next: "无" };
		const prompt = promptTemplate
			.replaceAll("{{url}}", task.url)
			.replaceAll("{{prev_nav}}", navigation.prev)
			.replaceAll("{{next_nav}}", navigation.next);
		const content = await generateMarkdown({
			prompt,
			source,
			currentUrl: task.url,
		});

		fs.writeFileSync(task.outputPath, content, "utf8");
		return {
			...task,
			status: task.overwrite ? "overwritten" : "generated",
		};
	} catch (error) {
		return { ...task, status: "failed", error: error.message };
	}
}

async function runWithConcurrency(tasks, maxConcurrency, worker) {
	const results = new Array(tasks.length);
	let nextIndex = 0;

	async function runWorker() {
		while (nextIndex < tasks.length) {
			const currentIndex = nextIndex;
			nextIndex += 1;
			results[currentIndex] = await worker(tasks[currentIndex]);
		}
	}

	const workerCount = Math.min(maxConcurrency, tasks.length);
	await Promise.all(Array.from({ length: workerCount }, () => runWorker()));
	return results;
}

function printSummary(results) {
	console.log("\nResult summary:");
	for (const result of results) {
		const number = String(result.index + 1).padStart(2, "0");
		if (result.status === "duplicate") {
			console.log(`${number} SKIPPED duplicate ${result.url}`);
		} else if (result.status === "failed") {
			console.log(`${number} FAILED ${result.url}: ${result.error}`);
		} else {
			console.log(
				`${number} ${result.status.toUpperCase()} ${result.url} -> ${result.outputPath}`,
			);
		}
	}
}

function parseArguments(argv) {
	for (const argument of argv) {
		if (argument !== "--discover-only") {
			throw new Error(`Unknown argument: ${argument}`);
		}
	}

	return { discoverOnly: argv.includes("--discover-only") };
}

async function main(argv = process.argv.slice(2)) {
	const options = parseArguments(argv);
	const workflowMarkdown = fs.readFileSync(DEFAULT_WORKFLOW_PATH, "utf8");
	const config = parseWorkflowConfig(workflowMarkdown, DEFAULT_WORKFLOW_PATH);
	const documentList = fs.readFileSync(config.docListPath, "utf8");
	const promptTemplate = fs.readFileSync(config.promptTemplatePath, "utf8");

	fs.mkdirSync(config.outputDir, { recursive: true });
	const tasks = buildTaskQueue(parseDocumentList(documentList), config.outputDir);

	if (options.discoverOnly) {
		printSummary(
			tasks.map((task) =>
				task.duplicate
					? task
					: { ...task, status: task.overwrite ? "overwritten" : "generated" },
			),
		);
		console.log(`\nDiscovered ${tasks.filter((task) => !task.duplicate).length} unique URLs.`);
		return;
	}

	const runnableTasks = tasks.filter((task) => !task.duplicate);
	const navigationContext = buildNavigationContext(tasks);
	const processed = await runWithConcurrency(runnableTasks, config.maxConcurrency, (task) =>
		processTask(task, promptTemplate, navigationContext),
	);
	const processedByIndex = new Map(processed.map((result) => [result.index, result]));
	const results = tasks.map((task) => processedByIndex.get(task.index) || task);

	printSummary(results);
	if (processed.some((result) => result.status === "failed")) {
		process.exitCode = 1;
	}
}

if (require.main === module) {
	main().catch((error) => {
		console.error(error.message);
		process.exitCode = 1;
	});
}

module.exports = {
	buildNavigationContext,
	buildTaskQueue,
	getNavLabel,
	getNavLink,
	getSlug,
	parseDocumentList,
	parseWorkflowConfig,
	runWithConcurrency,
};
