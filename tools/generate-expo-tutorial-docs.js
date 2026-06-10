const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const DEFAULT_WORKFLOW_PATH = path.resolve(__dirname, '../doc/workflows.md');
const DEFAULT_MAX_PAGES = 50;

function parseWorkflowConfig(markdown, workflowPath = DEFAULT_WORKFLOW_PATH) {
	const values = {};

	for (const key of ['START_URL', 'BASE_URL', 'PROMPT_TEMPLATE', 'OUTPUT_DIR']) {
		const match = markdown.match(new RegExp(`^${key}\\s*=\\s*(.+?)\\s*$`, 'm'));
		if (!match) {
			throw new Error(`Missing ${key} in ${workflowPath}`);
		}
		values[key] = match[1];
	}

	const workflowDir = path.dirname(workflowPath);
	const startUrl = new URL(values.START_URL).toString();
	const baseUrl = new URL(values.BASE_URL).toString().replace(/\/$/, '');

	return {
		startUrl,
		baseUrl,
		promptTemplatePath: path.resolve(workflowDir, values.PROMPT_TEMPLATE),
		outputDir: path.resolve(workflowDir, values.OUTPUT_DIR),
	};
}

function findMarkdownLink(text) {
	const linkPattern = /\[[^\]]+\]\(([^)\s]+)(?:\s+["'][^"']*["'])?\)/g;
	let match;

	while ((match = linkPattern.exec(text)) !== null) {
		if (/tutorial/i.test(match[1])) {
			return match[1];
		}
	}

	return null;
}

function findNextTutorialPath(markdown) {
	const lines = markdown.split(/\r?\n/);

	for (let index = 0; index < lines.length; index += 1) {
		if (!/^#{1,6}\s+Next steps?\s*$/i.test(lines[index])) {
			continue;
		}

		const section = [];
		for (let cursor = index + 1; cursor < lines.length; cursor += 1) {
			if (/^#{1,6}\s+/.test(lines[cursor])) {
				break;
			}
			section.push(lines[cursor]);
		}

		const pathFromSection = findMarkdownLink(section.join('\n'));
		if (pathFromSection) {
			return pathFromSection;
		}
	}

	for (const line of lines) {
		const nextLink = line.match(/\[\s*Next\b[^\]]*\]\(([^)\s]+)(?:\s+["'][^"']*["'])?\)/i);
		if (nextLink && /tutorial/i.test(nextLink[1])) {
			return nextLink[1];
		}

		if (/^\s*Next(?:\s+steps?)?\b/i.test(line)) {
			const pathFromLine = findMarkdownLink(line);
			if (pathFromLine) {
				return pathFromLine;
			}
		}
	}

	return null;
}

function resolveNextTutorialUrl(markdown, baseUrl) {
	const tutorialPath = findNextTutorialPath(markdown);
	if (!tutorialPath) {
		return null;
	}

	let base;
	let candidate;
	try {
		base = new URL(baseUrl);
		candidate = new URL(tutorialPath, `${baseUrl.replace(/\/$/, '')}/`);
	} catch {
		return null;
	}

	const basePath = base.pathname.replace(/\/$/, '');
	if (candidate.origin !== base.origin || !candidate.pathname.startsWith(`${basePath}/`)) {
		return null;
	}

	let slug;
	try {
		slug = decodeURIComponent(candidate.pathname.split('/').filter(Boolean).at(-1) || '');
	} catch {
		return null;
	}

	slug = slug.replace(/\.md$/i, '');
	if (!/^[a-z0-9][a-z0-9-]*$/i.test(slug)) {
		return null;
	}

	return `${baseUrl.replace(/\/$/, '')}/${slug}.md`;
}

async function discoverTutorials({
	startUrl,
	baseUrl,
	maxPages = DEFAULT_MAX_PAGES,
	fetchPage,
}) {
	const visitedUrls = new Set();
	const pages = [];
	let currentUrl = startUrl;

	while (currentUrl) {
		if (visitedUrls.has(currentUrl)) {
			break;
		}
		if (visitedUrls.size >= maxPages) {
			throw new Error(`Maximum page limit (${maxPages}) reached at ${currentUrl}`);
		}

		visitedUrls.add(currentUrl);

		let source;
		try {
			source = await fetchPage(currentUrl);
		} catch (error) {
			throw new Error(`Failed to read ${currentUrl}: ${error.message}`);
		}

		pages.push({ url: currentUrl, source });
		const nextTutorialPath = findNextTutorialPath(source);
		const nextUrl = resolveNextTutorialUrl(source, baseUrl);
		if (nextTutorialPath && !nextUrl) {
			throw new Error(
				`Failed to parse Next tutorial URL at ${currentUrl}: ${nextTutorialPath}`,
			);
		}
		if (!nextTutorialPath || visitedUrls.has(nextUrl)) {
			break;
		}

		currentUrl = nextUrl;
	}

	return pages;
}

async function fetchPage(url) {
	const response = await fetch(url, {
		headers: { 'user-agent': 'expo-tutorial-doc-generator' },
	});

	if (!response.ok) {
		throw new Error(`HTTP ${response.status} ${response.statusText}`);
	}

	return response.text();
}

function getOutputFilename(url) {
	const filename = new URL(url).pathname.split('/').filter(Boolean).at(-1);
	if (!filename) {
		throw new Error(`Cannot derive a filename from ${url}`);
	}
	return filename.endsWith('.md') ? filename : `${filename}.md`;
}

function generateMarkdown({ prompt, source, projectRoot, currentUrl }) {
	const result = spawnSync(
		'codex',
		['exec', '--ephemeral', '--sandbox', 'read-only', '--color', 'never', prompt],
		{
			cwd: projectRoot,
			encoding: 'utf8',
			input: source,
			maxBuffer: 20 * 1024 * 1024,
		},
	);

	if (result.error) {
		throw new Error(`Failed to start Codex for ${currentUrl}: ${result.error.message}`);
	}
	if (result.status !== 0) {
		throw new Error(
			`Codex failed for ${currentUrl} with exit code ${result.status}: ${result.stderr.trim()}`,
		);
	}

	const content = result.stdout.trim();
	if (!content) {
		throw new Error(`Codex returned empty content for ${currentUrl}`);
	}

	return `${content}\n`;
}

function writeFileAtomic(outputPath, content) {
	const temporaryPath = `${outputPath}.tmp-${process.pid}-${Date.now()}`;

	try {
		fs.writeFileSync(temporaryPath, content, 'utf8');
		fs.renameSync(temporaryPath, outputPath);
	} finally {
		if (fs.existsSync(temporaryPath)) {
			fs.unlinkSync(temporaryPath);
		}
	}
}

function parseArguments(argv) {
	const options = {
		discoverOnly: false,
		force: false,
	};

	for (const argument of argv) {
		if (argument === '--discover-only') {
			options.discoverOnly = true;
		} else if (argument === '--force') {
			options.force = true;
		} else {
			throw new Error(`Unknown argument: ${argument}`);
		}
	}

	return options;
}

async function main(argv = process.argv.slice(2)) {
	const options = parseArguments(argv);
	const workflowMarkdown = fs.readFileSync(DEFAULT_WORKFLOW_PATH, 'utf8');
	const config = parseWorkflowConfig(workflowMarkdown, DEFAULT_WORKFLOW_PATH);

	if (!fs.existsSync(config.promptTemplatePath)) {
		throw new Error(`Prompt template not found: ${config.promptTemplatePath}`);
	}

	const pages = await discoverTutorials({
		startUrl: config.startUrl,
		baseUrl: config.baseUrl,
		fetchPage,
	});

	pages.forEach((page, index) => {
		console.log(`${String(index + 1).padStart(2, '0')} ${page.url}`);
	});

	if (options.discoverOnly) {
		console.log(`Discovered ${pages.length} tutorial pages. No files were written.`);
		return;
	}

	const promptTemplate = fs.readFileSync(config.promptTemplatePath, 'utf8');
	const projectRoot = path.resolve(path.dirname(DEFAULT_WORKFLOW_PATH), '..');
	const jobs = pages.map((page) => ({
		...page,
		outputPath: path.join(config.outputDir, getOutputFilename(page.url)),
	}));

	fs.mkdirSync(config.outputDir, { recursive: true });

	for (const job of jobs) {
		if (fs.existsSync(job.outputPath) && !options.force) {
			console.log(`Skip existing ${job.outputPath}`);
			continue;
		}

		const prompt = `${promptTemplate.replaceAll('{{url}}', job.url)}\n\n` +
			'当前官方文档原文已通过 stdin 提供。请以该原文为唯一内容来源。';
		const content = generateMarkdown({
			prompt,
			source: job.source,
			projectRoot,
			currentUrl: job.url,
		});

		writeFileAtomic(job.outputPath, content);
		console.log(`Generated ${job.outputPath}`);
	}
}

if (require.main === module) {
	main().catch((error) => {
		console.error(error.message);
		process.exitCode = 1;
	});
}

module.exports = {
	DEFAULT_MAX_PAGES,
	discoverTutorials,
	findNextTutorialPath,
	getOutputFilename,
	parseWorkflowConfig,
	resolveNextTutorialUrl,
};
