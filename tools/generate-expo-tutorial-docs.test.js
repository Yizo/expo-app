const test = require('node:test');
const assert = require('node:assert/strict');

const {
	discoverTutorials,
	getOutputFilename,
	resolveNextTutorialUrl,
} = require('./generate-expo-tutorial-docs');

const baseUrl = 'https://docs.expo.dev/tutorial';

test('resolves a tutorial link from a Next step section', () => {
	const markdown = `
## Next step

We're ready to continue.

[Start](/tutorial/create-your-first-app)
`;

	assert.equal(
		resolveNextTutorialUrl(markdown, baseUrl),
		'https://docs.expo.dev/tutorial/create-your-first-app.md',
	);
});

test('resolves a tutorial link whose label starts with Next', () => {
	const markdown = '[Next: Add navigation](/tutorial/add-navigation)';

	assert.equal(
		resolveNextTutorialUrl(markdown, baseUrl),
		'https://docs.expo.dev/tutorial/add-navigation.md',
	);
});

test('returns null when there is no Next tutorial link', () => {
	assert.equal(resolveNextTutorialUrl('## Summary\n\nFinished.', baseUrl), null);
});

test('rejects invalid and external Next paths', () => {
	assert.equal(resolveNextTutorialUrl('[Next: Guide](/guides/setup)', baseUrl), null);
	assert.equal(
		resolveNextTutorialUrl('[Next: Other](https://example.com/tutorial/other)', baseUrl),
		null,
	);
});

test('reports the current URL when a Next tutorial URL cannot be parsed', async () => {
	await assert.rejects(
		discoverTutorials({
			startUrl: 'https://docs.expo.dev/tutorial/introduction.md',
			baseUrl,
			fetchPage: async () => '[Next: Other](https://example.com/tutorial/other)',
		}),
		/Failed to parse Next tutorial URL at https:\/\/docs\.expo\.dev\/tutorial\/introduction\.md/,
	);
});

test('does not duplicate an existing markdown suffix', () => {
	assert.equal(
		resolveNextTutorialUrl('[Next: Continue](/tutorial/configuration.md)', baseUrl),
		'https://docs.expo.dev/tutorial/configuration.md',
	);
	assert.equal(
		getOutputFilename('https://docs.expo.dev/tutorial/configuration.md'),
		'configuration.md',
	);
});

test('stops when a Next URL has already been visited', async () => {
	const pages = new Map([
		[
			'https://docs.expo.dev/tutorial/introduction.md',
			'[Next: Continue](/tutorial/second)',
		],
		[
			'https://docs.expo.dev/tutorial/second.md',
			'[Next: Restart](/tutorial/introduction)',
		],
	]);

	const result = await discoverTutorials({
		startUrl: 'https://docs.expo.dev/tutorial/introduction.md',
		baseUrl,
		fetchPage: async (url) => pages.get(url),
	});

	assert.deepEqual(
		result.map((page) => page.url),
		[
			'https://docs.expo.dev/tutorial/introduction.md',
			'https://docs.expo.dev/tutorial/second.md',
		],
	);
});

test('fails when the maximum page count is exceeded', async () => {
	await assert.rejects(
		discoverTutorials({
			startUrl: 'https://docs.expo.dev/tutorial/one.md',
			baseUrl,
			maxPages: 2,
			fetchPage: async (url) => {
				if (url.endsWith('/one.md')) return '[Next: Two](/tutorial/two)';
				if (url.endsWith('/two.md')) return '[Next: Three](/tutorial/three)';
				return 'Done';
			},
		}),
		/Maximum page limit \(2\) reached at https:\/\/docs\.expo\.dev\/tutorial\/three\.md/,
	);
});
