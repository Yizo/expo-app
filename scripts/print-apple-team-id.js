#!/usr/bin/env node
/**
 * 打印本机 Apple Development 证书中的 Team ID（OU 字段）。
 * Personal Team 在 Xcode → Settings → Accounts 里通常不显示该 ID。
 *
 * 用法: node scripts/print-apple-team-id.js
 * 或:   pnpm team-id
 */
const { execFileSync, execSync } = require("node:child_process");

function run(cmd, args) {
	return execFileSync(cmd, args, { encoding: "utf8" }).trim();
}

const identities = run("security", ["find-identity", "-v", "-p", "codesigning"]);
const appleDevLines = identities
	.split("\n")
	.map((line) => line.trim())
	.filter((line) => line.includes("Apple Development:"));

if (appleDevLines.length === 0) {
	console.error(
		"未找到 Apple Development 证书。请先在 Xcode → Settings → Accounts 登录 Apple ID，并点击 Manage Certificates 创建 Development 证书。",
	);
	process.exit(1);
}

const seen = new Set();

for (const line of appleDevLines) {
	const nameMatch = line.match(/"([^"]+)"/);
	const commonName = nameMatch?.[1];
	if (!commonName) continue;

	let pem;
	try {
		pem = run("security", ["find-certificate", "-c", commonName, "-p"]);
	} catch {
		continue;
	}

	let subject;
	try {
		subject = execSync("openssl x509 -noout -subject -nameopt RFC2253", {
			encoding: "utf8",
			input: pem,
		}).trim();
	} catch {
		continue;
	}

	// subject=UID=...,CN=...,OU=<TeamID>,O=...,C=US
	const ou = subject.match(/(?:^|,)OU=([^,]+)/)?.[1]?.trim();
	const email = commonName.match(/Apple Development:\s*(.+?)\s*\(/)?.[1]?.trim();
	const org = subject.match(/(?:^|,)O=([^,]+)/)?.[1]?.trim();

	if (!ou || seen.has(ou)) continue;
	seen.add(ou);

	console.log(`Team ID: ${ou}`);
	if (email) console.log(`  Apple ID: ${email}`);
	if (org) console.log(`  Name: ${org}`);
	console.log(`  Certificate: ${commonName}`);
	console.log("");
}

if (seen.size === 0) {
	console.error("已找到证书，但未能解析 OU（Team ID）。");
	process.exit(1);
}

console.log("把 Team ID 填到 app.config.ts → ios.appleTeamId");
