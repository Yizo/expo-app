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

function buildNavigationBlock(navigation) {
	return [
		"---",
		"",
		"## 文档导航",
		"",
		`- **上一页**：${navigation.prev}`,
		`- **下一页**：${navigation.next}`,
		"",
	].join("\n");
}

function replaceNavigationBlock(content, navigation) {
	const navigationBlockPattern =
		/(?:\r?\n)?---\r?\n\r?\n## 文档导航\r?\n\r?\n- \*\*上一页\*\*：[^\n]*\r?\n- \*\*下一页\*\*：[^\n]*\s*$/;
	const body = content.replace(navigationBlockPattern, "").trimEnd();
	return `${body}\n\n${buildNavigationBlock(navigation)}`;
}

function verifyNavigationBlock(content, navigation) {
	const expectedBlock = buildNavigationBlock(navigation).trim();
	return content.trimEnd().endsWith(expectedBlock);
}

function buildTaskQueue(entries, outputDir) {
	return entries.map((entry, index) => {
		const lineNumber = index + 1;

		if (entry.duplicate) {
			return { ...entry, index, lineNumber, status: "duplicate" };
		}

		const slug = getSlug(entry.url);
		const outputPath = path.join(outputDir, `${lineNumber}__${slug}.md`);
		const status = fs.existsSync(outputPath) ? "skipped" : "pending";

		return {
			...entry,
			index,
			lineNumber,
			slug,
			outputPath,
			status,
		};
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
	if (task.status === "skipped") {
		return task;
	}

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
			status: "generated",
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

function repairNavigation(outputDir, tasks, navigationContext) {
	const report = {
		checked: 0,
		repaired: 0,
		missingFiles: [],
		invalidFiles: [],
	};

	for (const task of tasks) {
		if (task.duplicate) {
			continue;
		}

		if (!fs.existsSync(task.outputPath)) {
			report.missingFiles.push({
				lineNumber: task.lineNumber,
				url: task.url,
				outputPath: task.outputPath,
			});
			continue;
		}

		const navigation = navigationContext.get(task.index) || { prev: "无", next: "无" };
		const currentContent = fs.readFileSync(task.outputPath, "utf8");
		const nextContent = replaceNavigationBlock(currentContent, navigation);

		report.checked += 1;

		if (nextContent !== currentContent) {
			fs.writeFileSync(task.outputPath, nextContent, "utf8");
			report.repaired += 1;
		}

		const verifiedContent = fs.readFileSync(task.outputPath, "utf8");
		if (!verifyNavigationBlock(verifiedContent, navigation)) {
			report.invalidFiles.push({
				lineNumber: task.lineNumber,
				outputPath: task.outputPath,
			});
		}
	}

	return report;
}

function printSummary(results, navigationReport = null) {
	const stats = {
		total: results.length,
		duplicate: 0,
		skipped: 0,
		generated: 0,
		failed: 0,
	};

	console.log("\n=== 本次生成概览 ===");
	for (const result of results) {
		const number = String(result.lineNumber ?? result.index + 1).padStart(3, "0");
		const filename = result.outputPath ? path.basename(result.outputPath) : "-";

		if (result.status === "duplicate") {
			stats.duplicate += 1;
			console.log(`${number} SKIPPED duplicate ${result.url}`);
		} else if (result.status === "skipped") {
			stats.skipped += 1;
			console.log(`${number} SKIPPED exists ${filename} <- ${result.url}`);
		} else if (result.status === "failed") {
			stats.failed += 1;
			console.log(`${number} FAILED ${result.url}: ${result.error}`);
		} else if (result.status === "generated") {
			stats.generated += 1;
			console.log(`${number} GENERATED ${filename} <- ${result.url}`);
		} else if (result.status === "pending") {
			console.log(`${number} PENDING ${filename} <- ${result.url}`);
		} else {
			console.log(`${number} ${String(result.status).toUpperCase()} ${result.url}`);
		}
	}

	console.log("\n--- 统计 ---");
	console.log(`列表总行数: ${stats.total}`);
	console.log(`重复 URL 跳过: ${stats.duplicate}`);
	console.log(`已存在跳过: ${stats.skipped}`);
	console.log(`本次新增生成: ${stats.generated}`);
	console.log(`失败: ${stats.failed}`);

	if (navigationReport) {
		console.log("\n--- 导航校验 ---");
		console.log(`已检查: ${navigationReport.checked}`);
		console.log(`已修复: ${navigationReport.repaired}`);
		console.log(`缺失文件: ${navigationReport.missingFiles.length}`);
		console.log(`校验失败: ${navigationReport.invalidFiles.length}`);

		for (const missingFile of navigationReport.missingFiles) {
			console.log(
				`NAV MISSING ${String(missingFile.lineNumber).padStart(3, "0")} ${missingFile.outputPath} <- ${missingFile.url}`,
			);
		}

		for (const invalidFile of navigationReport.invalidFiles) {
			console.log(
				`NAV INVALID ${String(invalidFile.lineNumber).padStart(3, "0")} ${invalidFile.outputPath}`,
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
			tasks.map((task) => {
				if (task.duplicate || task.status === "skipped") {
					return task;
				}
				return { ...task, status: "pending" };
			}),
		);
		console.log(`\n待生成任务数: ${tasks.filter((task) => task.status === "pending").length}`);
		return;
	}

	const runnableTasks = tasks.filter((task) => task.status === "pending");
	const navigationContext = buildNavigationContext(tasks);
	const processed = await runWithConcurrency(runnableTasks, config.maxConcurrency, (task) =>
		processTask(task, promptTemplate, navigationContext),
	);
	const processedByIndex = new Map(processed.map((result) => [result.index, result]));
	const results = tasks.map((task) => processedByIndex.get(task.index) || task);
	const navigationReport = repairNavigation(config.outputDir, tasks, navigationContext);

	printSummary(results, navigationReport);
	if (
		processed.some((result) => result.status === "failed") ||
		navigationReport.missingFiles.length > 0 ||
		navigationReport.invalidFiles.length > 0
	) {
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
	buildNavigationBlock,
	buildTaskQueue,
	getNavLabel,
	getNavLink,
	getSlug,
	parseDocumentList,
	parseWorkflowConfig,
	repairNavigation,
	replaceNavigationBlock,
	runWithConcurrency,
	verifyNavigationBlock,
};
