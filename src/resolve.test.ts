import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { resolveRedirect } from "./resolve.ts";

const table = [
  "",
  "g\twww.google.com\thttps://www.google.com/search?q={{{s}}}",
  "ddg\tduckduckgo.com\thttp://duckduckgo.com/?q={{{s}}}",
  "gh\tgithub.com\thttps://github.com/search?q={{{s}}}",
  "ghr\tgithub.com\thttps://github.com/{{{s}}}",
  "",
].join("\n");
const hot = table.slice(0, table.indexOf("\nghr\t") + 1);

const resolve = (query: string, defaultTrigger = "ddg") => resolveRedirect(query, defaultTrigger, table, true);

test("a search without a bang uses the default bang", () => {
  assert.equal(resolve("hello world"), "http://duckduckgo.com/?q=hello%20world");
  assert.equal(resolve("hello", "g"), "https://www.google.com/search?q=hello");
  assert.equal(resolve("hello", "gh"), "https://github.com/search?q=hello");
  assert.equal(resolve("hello", "not-a-bang"), "http://duckduckgo.com/?q=hello");
});

test("a bang works at any position and is removed from the search", () => {
  assert.equal(resolve("!gh unduck"), "https://github.com/search?q=unduck");
  assert.equal(resolve("t3 !gh unduck"), "https://github.com/search?q=t3%20unduck");
  assert.equal(resolve("unduck !GH"), "https://github.com/search?q=unduck");
});

test("a bang alone opens the site", () => {
  assert.equal(resolve("!gh"), "https://github.com");
});

test("slashes stay readable", () => {
  assert.equal(resolve("!ghr t3dotgg/unduck"), "https://github.com/t3dotgg/unduck");
});

test("an unknown bang stays in the search", () => {
  assert.equal(resolve("css !important"), "http://duckduckgo.com/?q=css%20!important");
});

test("a bang inside a word is not a bang", () => {
  assert.equal(resolve("Wacatac.B!gh"), "http://duckduckgo.com/?q=Wacatac.B!gh");
});

test("a partial table answers only what it knows", () => {
  assert.equal(resolveRedirect("hello", "ddg", hot, false), "http://duckduckgo.com/?q=hello");
  assert.equal(resolveRedirect("!gh unduck", "g", hot, false), "https://github.com/search?q=unduck");
  assert.equal(resolveRedirect("hello", "g", hot, false), "https://www.google.com/search?q=hello");
  assert.equal(resolveRedirect("!ghr t3dotgg/unduck", "g", hot, false), undefined);
  assert.equal(resolveRedirect("hello", "ghr", hot, false), undefined);
});


test("the shipped popular bangs include DuckDuckGo and custom overrides", () => {
  const shipped = readFileSync(new URL("../public/bangs.txt", import.meta.url), "utf8");
  const popular = `${shipped.split("\n", 151).join("\n")}\n`;
  assert.equal(resolveRedirect("hello", "ddg", popular, false), "http://duckduckgo.com/?q=hello");
  assert.equal(resolveRedirect("hello", "not-a-bang", shipped, true), "http://duckduckgo.com/?q=hello");
  assert.equal(resolveRedirect("!t3 hello", "ddg", popular, false), "https://www.t3.chat/new?q=hello");
  assert.equal(resolveRedirect("!npmx vite", "ddg", popular, false), "https://npmx.dev/search?q=vite");
});
