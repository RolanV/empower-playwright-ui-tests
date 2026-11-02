// Offline unit tests for utilities/errorSignatures.ts, the patterns TC-31 uses to
// look for visible error markers. They apply the same matching rule as TC-31
// (pattern.test(text)) to synthetic in-memory strings: no browser, no network.
// Passing tests show only that these examples behave as expected; they do not
// show that every error format, or every disclosure risk, is covered.
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ERROR_SIGNATURES } from "../utilities/errorSignatures.ts";

const matches = (text: string): string[] =>
  ERROR_SIGNATURES.filter(([, pattern]) => pattern.test(text)).map(([label]) => label);

describe("ERROR_SIGNATURES: definitions", () => {
  it("has a unique label for every pattern", () => {
    const labels = ERROR_SIGNATURES.map(([label]) => label);
    assert.equal(new Set(labels).size, labels.length);
  });

  // A global or sticky regex keeps lastIndex between test() calls, so repeated
  // checks of the same text could give different answers.
  it("uses no stateful (g or y) flags", () => {
    for (const [label, pattern] of ERROR_SIGNATURES) {
      assert.ok(!pattern.global && !pattern.sticky, `${label} uses a stateful flag: ${pattern.flags}`);
    }
  });
});

describe("ERROR_SIGNATURES: detects known error formats", () => {
  const examples: Array<[string, string]> = [
    ["JavaScript stack frame", "TypeError: x is undefined\n    at Object.render (https://cdn.example.test/app.min.js:1:2345)"],
    ["JavaScript stack frame", "    at https://cdn.example.test/chunk.js?v=3:10:7"],
    ["JavaScript stack frame", "at handler (/srv/app/server.ts:42:13)"],
    ["Java stack frame", "at com.example.web.LoginController.handle(LoginController.java:88)"],
    [".NET stack frame", "at Example.Web.Controllers.HomeController.Index() in C:\\src\\HomeController.cs:line 27"],
    ["Python traceback", "Traceback (most recent call last):\n  File \"app.py\", line 3"],
    ["Uncaught JavaScript error", "Uncaught TypeError: Cannot read properties of null"],
    ["Uncaught JavaScript error", "Uncaught (in promise) DOMException: aborted"],
    ["Java uncaught exception", "Exception in thread \"main\" java.lang.IllegalStateException"],
    ["Qualified exception class", "java.lang.NullPointerException"],
    ["Qualified exception class", "System.NullReferenceException: Object reference not set"],
    ["ASP.NET error page", "Server Error in '/' Application."],
    ["ASP.NET error page", "An unhandled exception occurred while processing the request."],
    ["PHP error", "Fatal error: Uncaught Exception: boom in /var/www/html/index.php:12"],
    ["PHP error", "Warning: include(x.php): failed to open stream in /var/www/a.php on line 4"],
    ["SQLSTATE code", "SQLSTATE[42S02]: Base table or view not found"],
    ["Oracle error code", "ORA-00942: table or view does not exist"],
    ["MySQL syntax error", "You have an error in your SQL syntax; check the manual"],
    ["SQL Server error", "Unclosed quotation mark after the character string 'abc'."],
    ["PostgreSQL syntax error", "ERROR:  syntax error at or near \"FROM\""],
  ];

  for (const [label, text] of examples) {
    it(`${label}: ${JSON.stringify(text.split("\n").pop()!.trim()).slice(0, 70)}`, () => {
      assert.ok(matches(text).includes(label), `expected "${label}", got [${matches(text).join(", ")}]`);
    });
  }

  it("has at least one detecting example for every pattern", () => {
    const covered = new Set(examples.map(([label]) => label));
    const uncovered = ERROR_SIGNATURES.map(([label]) => label).filter((label) => !covered.has(label));
    assert.deepEqual(uncovered, []);
  });
});

describe("ERROR_SIGNATURES: ignores ordinary page text", () => {
  const ordinary = [
    "We deliver exceptional service to every investor.",
    "All plans are eligible, with the exception of legacy accounts.",
    "Exceptions apply. See plan documents for details.",
    "Our engineers bring deep SQL Server experience.",
    "Stack your savings with automatic contributions.",
    "Meet us at Empower (Greenwood Village) at 9:30 (MT).",
    "Call 1-800-555-0100 at noon (12:30:00) for help.",
    "Warning: investing involves risk, including loss of principal.",
    "Error: the page you requested could not be found.",
    "An uncaught opportunity: start saving today.",
    "Visit system.example.test for status updates.",
    "Use a traceback-free workflow (most recent updates first).",
    "Our ORA-style planning tool gives clear answers.",
    "Read our SQL error handling guide in the developer docs.",
    // Previously a false positive: "at <script-url>:line:col" inside a sentence.
    "Download our guide at https://www.example.test/guide.js:1:2 today.",
    "Exceptional Retirement Planning Error-Free Since 2014",
    "System.Exceptional is our new planner.",
  ];

  for (const text of ordinary) {
    it(JSON.stringify(text).slice(0, 72), () => {
      assert.deepEqual(matches(text), []);
    });
  }
});
