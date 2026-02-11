import fs from "node:fs";
import path from "node:path";

const distDir = path.resolve("dist");
const unsafeChars = /[<>/\u2028\u2029]/g;
const escapeMap = {
  "<": "\\u003C",
  ">": "\\u003E",
  "/": "\\u002F",
  "\u2028": "\\u2028",
  "\u2029": "\\u2029",
};

const escapeUnsafe = (value) => value.replace(unsafeChars, (match) => escapeMap[match] || match);

const collectHtmlFiles = (dir) => {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const next = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectHtmlFiles(next));
    } else if (entry.isFile() && entry.name.endsWith(".html")) {
      files.push(next);
    }
  }
  return files;
};

const replaceInlineState = (html) => {
  const pattern = /<script>window\.__INITIAL_STATE__=([^<]*)<\/script>/g;
  let changed = false;
  const nextHtml = html.replace(pattern, (_, raw) => {
    const rawTrimmed = raw.trim();
    if (!rawTrimmed) return _;
    try {
      const jsonString = JSON.parse(rawTrimmed);
      const safeJson = escapeUnsafe(jsonString);
      changed = true;
      return `<script type="application/json" id="__INITIAL_STATE__">${safeJson}</script>`;
    } catch {
      return _;
    }
  });
  return { html: nextHtml, changed };
};

if (!fs.existsSync(distDir)) {
  process.exit(0);
}

const htmlFiles = collectHtmlFiles(distDir);
htmlFiles.forEach((file) => {
  const contents = fs.readFileSync(file, "utf8");
  const { html, changed } = replaceInlineState(contents);
  if (changed) fs.writeFileSync(file, html, "utf8");
});
