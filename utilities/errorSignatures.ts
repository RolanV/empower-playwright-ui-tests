// Visible error markers checked by TC-31 (tests/epic04-smoke). Kept as plain data
// here so unit/errorSignatures.test.ts can check the patterns without a browser.
// Each pattern requires a recognizable error format rather than a bare word, so
// copy such as "exceptional service", "with the exception of" or "SQL Server
// experience" does not match. The list is deliberately narrow: it is not a
// complete catalogue of error or information-disclosure formats.
export const ERROR_SIGNATURES: ReadonlyArray<readonly [string, RegExp]> = [
  // Line-anchored: engines print each frame on its own line, so "at <script-url>:1:2" inside a sentence is not a frame.
  ["JavaScript stack frame", /^[ \t]*at (?:[\w$.<>\[\]]+ \()?(?:https?:\/\/|file:\/\/|webpack:\/\/|\/)[^\s()]+\.[cm]?[jt]sx?(?:\?[^\s()]*)?:\d+:\d+\)?/m],
  ["Java stack frame", /\bat (?:[A-Za-z_$][\w$]*\.)+[\w$<>]+\([\w$]+\.java:\d+\)/],
  [".NET stack frame", /\bat [\w.`<>\[\],]+\([^)\n]*\) in [^\n]+:line \d+/],
  ["Python traceback", /\bTraceback \(most recent call last\):/],
  ["Uncaught JavaScript error", /\bUncaught (?:\(in promise\) )?[A-Z]\w*(?:Error|Exception)\b/],
  ["Java uncaught exception", /\bException in thread "[^"\n]+"/],
  ["Qualified exception class", /\b(?:java|javax|jakarta|org|System|Microsoft)\.(?:[\w$]+\.)*[A-Z][\w$]*(?:Exception|Error)\b/],
  ["ASP.NET error page", /\bServer Error in '[^'\n]*' Application\b|\bAn unhandled exception occurred\b/],
  ["PHP error", /\b(?:Fatal error|Parse error|Warning|Notice): [^\n]{1,300}? in \S+\.php(?::\d+| on line \d+)/],
  ["SQLSTATE code", /\bSQLSTATE\[[0-9A-Z]{5}\]/],
  ["Oracle error code", /\bORA-\d{5}:/],
  ["MySQL syntax error", /\bYou have an error in your SQL syntax\b/],
  ["SQL Server error", /\bUnclosed quotation mark after the character string\b/],
  ["PostgreSQL syntax error", /\bERROR: +syntax error at or near\b/],
];
