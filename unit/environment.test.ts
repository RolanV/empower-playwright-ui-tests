// Offline unit tests for utilities/environment.ts, run with Node's built-in
// test runner (npm run test:unit). They call resolveBaseURL with plain objects,
// so no browser, Playwright fixture, network or real environment is involved.
// This folder is outside Playwright's testDir, so it is not counted in the
// 31-test browser inventory.
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { resolveBaseURL } from "../utilities/environment.ts";

const SUPPORTED = "qa, stg, uat";

describe("resolveBaseURL: environment selection", () => {
  it("qa selects QA_URL", () => {
    const env = { evn: "qa", QA_URL: "https://qa.example.test", STG_URL: "https://stg.example.test", UAT_URL: "https://uat.example.test" };
    assert.equal(resolveBaseURL(env), "https://qa.example.test/");
  });

  it("stg selects STG_URL", () => {
    const env = { evn: "stg", QA_URL: "https://qa.example.test", STG_URL: "https://stg.example.test", UAT_URL: "https://uat.example.test" };
    assert.equal(resolveBaseURL(env), "https://stg.example.test/");
  });

  it("uat selects UAT_URL", () => {
    const env = { evn: "uat", QA_URL: "https://qa.example.test", STG_URL: "https://stg.example.test", UAT_URL: "https://uat.example.test" };
    assert.equal(resolveBaseURL(env), "https://uat.example.test/");
  });

  it("does not modify the environment object it is given", () => {
    const env = { evn: "qa", QA_URL: "https://qa.example.test/app" };
    const before = { ...env };
    resolveBaseURL(env);
    assert.deepEqual(env, before);
  });
});

describe("resolveBaseURL: rejected selectors", () => {
  it("fails clearly when evn is missing", () => {
    assert.throws(() => resolveBaseURL({ QA_URL: "https://qa.example.test" }), {
      message: `No environment selected: set evn to one of ${SUPPORTED} (in .env or the shell).`,
    });
  });

  it("treats an empty evn as missing", () => {
    assert.throws(() => resolveBaseURL({ evn: "", QA_URL: "https://qa.example.test" }), {
      message: /^No environment selected/,
    });
  });

  it("rejects an unsupported evn and lists the supported values", () => {
    assert.throws(() => resolveBaseURL({ evn: "prod", QA_URL: "https://qa.example.test" }), {
      message: `Unsupported evn "prod": expected one of ${SUPPORTED}.`,
    });
  });

  it("matches evn case-sensitively", () => {
    assert.throws(() => resolveBaseURL({ evn: "QA", QA_URL: "https://qa.example.test" }), {
      message: /^Unsupported evn "QA"/,
    });
  });

  it("does not accept inherited object keys as environment names", () => {
    for (const name of ["toString", "constructor", "__proto__"]) {
      assert.throws(() => resolveBaseURL({ evn: name }), { message: new RegExp(`^Unsupported evn "${name}"`) });
    }
  });
});

describe("resolveBaseURL: required URL", () => {
  it("rejects a missing URL variable for the selected environment", () => {
    assert.throws(() => resolveBaseURL({ evn: "qa" }), { message: "evn=qa requires QA_URL to be set." });
  });

  it("rejects an empty URL variable", () => {
    assert.throws(() => resolveBaseURL({ evn: "uat", UAT_URL: "" }), { message: "evn=uat requires UAT_URL to be set." });
  });

  it("does not fall back to another environment's URL", () => {
    assert.throws(() => resolveBaseURL({ evn: "stg", QA_URL: "https://qa.example.test" }), {
      message: "evn=stg requires STG_URL to be set.",
    });
  });
});

describe("resolveBaseURL: URL validation", () => {
  for (const raw of ["not a url", "qa.example.test", "/relative/path", "//qa.example.test"]) {
    it(`rejects a value that is not an absolute URL: ${JSON.stringify(raw)}`, () => {
      assert.throws(() => resolveBaseURL({ evn: "qa", QA_URL: raw }), { message: "QA_URL is not a valid absolute URL." });
    });
  }

  for (const raw of ["ftp://qa.example.test", "file:///etc/hosts", "ws://qa.example.test", "javascript:alert(1)"]) {
    it(`rejects a non-HTTP(S) scheme: ${raw}`, () => {
      assert.throws(() => resolveBaseURL({ evn: "qa", QA_URL: raw }), { message: "QA_URL must use http or https." });
    });
  }

  it("accepts plain http", () => {
    assert.equal(resolveBaseURL({ evn: "qa", QA_URL: "http://localhost.invalid" }), "http://localhost.invalid/");
  });

  for (const raw of ["https://qa.example.test/?lang=en", "https://qa.example.test/#top", "https://qa.example.test/app?x=1#y"]) {
    it(`rejects a query string or fragment: ${raw}`, () => {
      assert.throws(() => resolveBaseURL({ evn: "qa", QA_URL: raw }), {
        message: "QA_URL must not include a query string or fragment.",
      });
    });
  }
});

describe("resolveBaseURL: trailing-slash normalization", () => {
  const cases: Array<[string, string]> = [
    ["https://qa.example.test", "https://qa.example.test/"],
    ["https://qa.example.test/", "https://qa.example.test/"],
    ["https://qa.example.test/app", "https://qa.example.test/app/"],
    ["https://qa.example.test/app/", "https://qa.example.test/app/"],
    ["https://qa.example.test:8443/a/b", "https://qa.example.test:8443/a/b/"],
  ];
  for (const [raw, expected] of cases) {
    it(`${raw} -> ${expected}`, () => {
      assert.equal(resolveBaseURL({ evn: "qa", QA_URL: raw }), expected);
    });
  }

  // The specs navigate with page.goto("./route"), which Playwright resolves
  // against baseURL with standard URL rules.
  it("lets ./route resolve beneath a base path", () => {
    const base = resolveBaseURL({ evn: "qa", QA_URL: "https://qa.example.test/app" });
    assert.equal(new URL("./login-v1", base).href, "https://qa.example.test/app/login-v1");
  });

  it("does not produce a double slash when the URL already ends with /", () => {
    const base = resolveBaseURL({ evn: "qa", QA_URL: "https://qa.example.test/app/" });
    assert.equal(new URL("./login-v1", base).href, "https://qa.example.test/app/login-v1");
  });
});

describe("resolveBaseURL: error messages do not disclose URL values", () => {
  const secret = "s3cr3t-token";
  const leakingValues: Array<[string, string]> = [
    ["an invalid URL", `not a url ${secret}`],
    ["a rejected scheme with credentials", `ftp://user:${secret}@qa.example.test`],
    ["credentials and a query string", `https://user:${secret}@qa.example.test/?key=${secret}`],
    ["a fragment", `https://qa.example.test/#${secret}`],
  ];
  for (const [label, raw] of leakingValues) {
    it(`does not echo the value of QA_URL for ${label}`, () => {
      assert.throws(
        () => resolveBaseURL({ evn: "qa", QA_URL: raw }),
        (error: unknown) => {
          assert.ok(error instanceof Error);
          assert.ok(!error.message.includes(secret), `message leaked the URL value: ${error.message}`);
          assert.match(error.message, /QA_URL/);
          return true;
        },
      );
    });
  }

  it("names only the variable when another environment's URL holds a secret", () => {
    assert.throws(
      () => resolveBaseURL({ evn: "stg", QA_URL: `https://user:${secret}@qa.example.test` }),
      (error: unknown) => error instanceof Error && !error.message.includes(secret),
    );
  });
});
