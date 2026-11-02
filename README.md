# Empower QA Automation Framework

[![Playwright Tests](https://github.com/RolanV/empower-playwright-ui-tests/actions/workflows/playwright.yml/badge.svg?branch=main)](https://github.com/RolanV/empower-playwright-ui-tests/actions/workflows/playwright.yml)

A Playwright + TypeScript UI automation framework for the public pages of [empower.com](https://www.empower.com), built by **Rolan Vataev** as a QA automation portfolio project.

> **Independent project.** This repository is not affiliated with, endorsed by, or sponsored by Empower. It is an educational portfolio project. The UI tests only read public pages and link attributes: they do not log in, submit forms or touch any customer account. It is not a security audit of the site.

## Current status

| Area | Status |
|---|---|
| UI tests | 27 Playwright tests defined (18 `@smoke`, 9 `@regression`) |
| Framework unit tests | 76 offline tests, run in CI on every push and pull request |
| CI | Type-checks, runs the unit tests and lists the UI tests. It installs no browser and sends no request to the website |
| Browser execution | Not run against an authorized target; the current UI tests have no recorded pass/fail result |

---

## Technology stack

| Tool | Version | Role |
|---|---|---|
| `@playwright/test` | 1.56.0 | UI test runner, browser automation and assertions |
| `typescript` | 7.0.2 | Type checking only (`tsc --noEmit`); Playwright and Node transpile at run time |
| Node.js | 24 in CI | Runtime. The unit tests use Node's built-in TypeScript type stripping, so Node 24 is recommended (`package.json` does not declare an `engines` field) |
| Node test runner | built into Node | `node:test` and `node:assert` for the framework unit tests; no third-party test library |
| `dotenv` | 17.2.3 | Loads environment variables from `.env` |
| `@types/node` | 24.7.0 | Node type definitions |
| GitHub Actions | `ubuntu-24.04` | Offline static checks |

Versions are the ones locked in `package-lock.json`.

## Framework architecture

### Page Object Model

Page objects in `pages/` declare locators as class fields and expose small actions and getters. Assertions stay in the tests.

| Class | Responsibility |
|---|---|
| `BasePage` | Holds the Playwright `Page` passed to its constructor (one per test) and provides protected `locator()` and `frameLocator()` helpers |
| `HomePage` | Home page: first `h2` heading, footer Privacy, Contact and About links, meta description and images, with getters such as `getMetaDescriptionContent()` and `getImageAlt()` |
| `LoginPage` | `/login-v1` "choose your login" page: `h1` heading and the "Log in" links, with getters for the option count and individual link `href` values |
| `NavigationPage` | Site header: login link, "Open an account" link and `clickLogin()` |

### Fixtures

- **`utilities/UITestUtils.ts`** extends Playwright's `test` and overrides the built-in `page` fixture. Before each test it opens the configured base URL and fails setup if the navigation returns no response or a non-2xx status. The error reports the status only, never the URL. Most specs import `test` and `expect` from here.
- **`tests/epic02-navigation/user-story02-page-routing.spec.ts`** uses Playwright's base `test` instead, because each test opens its route directly and checks the HTTP response itself.
- **`utilities/APITestUtils.ts`** defines an API request fixture. It is not used by any test yet.

### Environment resolver

`utilities/environment.ts` exports `resolveBaseURL(env)`, which `playwright.config.ts` uses for `use.baseURL`. It:

- selects the URL variable from `evn` (`qa`, `stg` or `uat`; case-sensitive);
- requires the selected variable to be set and to be an absolute `http` or `https` URL without a query string or fragment;
- adds a trailing `/` to the path, so `page.goto("./route")` resolves beneath a base path;
- reports variable names in its errors, never their values.

### Error-signature utility

`utilities/errorSignatures.ts` exports `ERROR_SIGNATURES`, a list of 14 labelled regular expressions for visible error markers: JavaScript, Java, .NET and Python stack traces, uncaught exceptions, ASP.NET and PHP error pages, and SQL error messages. TC-31 checks the home page text against them. Each pattern requires a recognizable error format rather than a bare word, so ordinary copy such as "exceptional service" does not match.

### Unit tests

`unit/` holds framework unit tests that run on Node's built-in test runner with in-memory inputs only:

| File | Tests | What it checks |
|---|---|---|
| `unit/environment.test.ts` | 36 | `resolveBaseURL`: environment selection, rejected selectors, required URLs, URL validation, trailing-slash handling and that error messages do not disclose URL values |
| `unit/errorSignatures.test.ts` | 40 | `ERROR_SIGNATURES`: unique labels and no stateful regex flags, 20 error examples that must match, one example per pattern, and 17 ordinary sentences that must not match |

`unit/` is outside Playwright's `testDir`, so these tests are not part of the UI test inventory.

### Playwright configuration

`playwright.config.ts` loads `.env` with `dotenv`, sets `baseURL` through the resolver and uses:

- `testDir: ./tests`, `fullyParallel: true`, `workers: 4`, `retries: 1`, and `forbidOnly` when `CI` is set;
- the HTML reporter, with traces and videos kept, and screenshots taken, only on failure;
- an `Accept-Language: en-US` request header;
- one project, **Google Chrome** (`channel: 'chrome'`, 1800 × 1000 viewport), based on Playwright's `Desktop Chrome` device descriptor. That descriptor sets a fixed desktop Chrome user-agent string; the config adds no custom user agent of its own.

---

## Environment configuration

The environment selector is spelled **`evn`** in this project. Copy the template and set the selector plus the matching URL variable:

```bash
cp .env.example .env
```

| `evn` | URL variable |
|---|---|
| `qa` | `QA_URL` |
| `stg` | `STG_URL` |
| `uat` | `UAT_URL` |

```dotenv
evn=qa
QA_URL=https://qa.example.com
STG_URL=https://stg.example.com
UAT_URL=https://uat.example.com
```

The values above are placeholders from `.env.example`. `.env` is git-ignored. Variables already set in the shell take precedence over `.env`, so a single run can target another environment without editing the file:

```bash
evn=stg STG_URL=https://stg.example.com npm run test:smoke
```

`.env.example` also lists `USERNAME`, `PASSWORD`, `API_BASE_URL` and `API_AUTH_TOKEN`. No current test uses them.

## Installation and commands

```bash
npm ci
npx playwright install chrome      # the config uses the installed Google Chrome channel
```

### Offline checks (no browser, no network)

| Command | What it does |
|---|---|
| `npm run typecheck` | TypeScript check of all project files (`tsc --noEmit`) |
| `npm run test:unit` | Runs the 76 framework unit tests in `unit/` |
| `evn=qa QA_URL=http://localhost.invalid npx playwright test --list --reporter=list` | Lists the UI tests without running them. Output ends with `Total: 27 tests in 6 files` |

`localhost.invalid` uses the reserved `.invalid` domain, so the listing cannot reach any site even by mistake.

### UI test execution (opens a browser and sends requests)

Run these only against a target you are authorized to test.

| Command | Selection |
|---|---|
| `npm run test:all` | All 27 UI tests |
| `npm run test:smoke` / `npm run test:regression` | `@smoke` (18) / `@regression` (9) |
| `npm run test:homepage` / `test:navigation` / `test:login` | By area: 9 / 8 / 5 tests |
| `npm run test:accessibility` / `test:security` | By check type: 2 / 3 tests |
| `npm run test:all:headed` / `test:smoke:headed` | All or smoke tests with a visible browser |
| `npm run report` | Opens the last HTML report |

---

## Test coverage

### UI tests: 27 defined

| Epic | Spec | Tests | Tags |
|---|---|---|---|
| **EPIC-01** Home page | Page load | TC-01, TC-02 | `@homepage @smoke` |
| | Footer links | TC-06 – TC-09 | `@homepage @regression` |
| **EPIC-02** Navigation | Nav links | TC-10 – TC-12 | `@navigation @smoke`, plus `@homepage` per test |
| | Page routing | TC-13 – TC-17 | `@navigation @regression` |
| **EPIC-03** Login page | Login options | TC-18 – TC-22 | `@login @smoke` |
| **EPIC-04** Smoke checks | SEO | TC-23 – TC-25 | `@smoke @seo` |
| | Accessibility | TC-27, TC-28 | `@smoke @accessibility` |
| | Security surface | TC-29 – TC-31 | `@smoke @security` |

**18 `@smoke` + 9 `@regression` = 27 tests.** The tags do not overlap, so `test:regression` runs only the 9 regression tests. TC-03 – TC-05 and TC-26 were removed as exact duplicates of TC-10 – TC-12 and TC-02; the remaining IDs were not renumbered.

### What the UI checks verify

- **Routing (TC-13 – TC-17).** Each route must return a successful HTTP status **and** a matching title, so a branded error page is not accepted as success.
- **Login options (TC-18 – TC-22).** The login page heading, at least five "Log in" links, and the target of three of them. TC-20 and TC-22 compare the parsed **hostname** with `empower-retirement.com`. TC-21 accepts an `href` containing `personalcapital` or `empower-retirement`, because its expected domain has not been verified.
- **SEO (TC-23 – TC-25).** A meta description longer than 50 characters once trimmed, a non-blank `og:title`, and a login-page canonical URL whose hostname is on `empower.com`.
- **Accessibility (TC-27, TC-28).** At least one image on the home page, an `alt` attribute on each of the first 10 images (`alt=""` is accepted for decorative images), and a visible login-page `h1` with text. This is not an accessibility audit.
- **Security surface (TC-29 – TC-31).** TC-29 and TC-30 check that the configured base URL is `https://` and that the home or login page ends on an `https:` URL. They do **not** test HTTP-to-HTTPS redirects, HSTS, TLS configuration or security headers. TC-31 checks the home page's visible text against the 14 error signatures only.

### Framework unit tests: 76 executed

| Suite | Tests |
|---|---|
| Environment resolver | 36 |
| Error signatures | 40 |

The unit tests exercise the framework's own logic, such as URL resolution and pattern matching, with in-memory inputs. They pass in CI on every push and pull request. They say nothing about the website: only running the 27 UI tests in a browser against a target can show whether the site behaves as the tests expect.

---

## CI/CD pipeline

`.github/workflows/playwright.yml` runs on pushes and pull requests targeting `main`. Its single job, **Static Checks (offline spec discovery)**, runs on `ubuntu-24.04` with Node 24:

1. `npm ci` installs the locked dependencies.
2. `npm run typecheck` runs `tsc --noEmit`.
3. `npm run test:unit` runs the 76 framework unit tests.
4. `npx playwright test --list` lists the UI tests with `evn=qa` and the placeholder `QA_URL=http://localhost.invalid`. This parses every spec, resolves imports and page objects, and loads the config, including the environment resolver.
5. **Guard test inventory** fails the job unless the listing reports exactly `27 tests in 6 files`, `@smoke` 18 tests in 4 files and `@regression` 9 tests in 2 files. When tests are added or removed on purpose, update the expected values in the same commit.

The workflow does **not** install or launch a browser, run any UI test or send any request to the website. A green check means the framework compiles, its unit tests pass and the UI test inventory is intact. It does not mean the UI tests pass.

## Limitations

- **No browser validation.** The UI tests have not been run against an authorized target, so there is no current evidence that they pass. Browser-based UI test execution is intentionally disabled in GitHub Actions. Local UI test commands remain available but must only be run against a target the user is authorized to test.
- **Fragile selectors.** Several locators depend on page structure and may need maintenance:
  - the header login link is the first `span` with the exact class `z-10`;
  - the footer Privacy item is the fourth `li` with a specific class list;
  - the login options are selected by position;
  - the hero heading is the first `h2`.
- **Weak URL checks.** TC-07 and TC-12 accept any URL containing `privacy` or `login`.
- **Navigation through the home page.** The `page` fixture always opens the home page first, including for tests that then go straight to `/login-v1`: the login-options spec, TC-25, TC-28 and TC-30. Whether that first visit sets cookies or consent state the login page relies on is unverified.
- **Fixture setup is strict.** If the site answers automated browsers with a non-2xx page, every fixture-based test fails at setup with that status.
- **TC-31 is narrow.** It checks only the visible home page text for the 14 defined error signatures. It misses other formats, for example asynchronous or Firefox-style stack frames, Ruby or Go traces, and lowercase SQL messages. It does not cover hidden markup, headers, the console or other pages.
- **Not a security assessment.** The `@security` tests check a few observable properties of two pages. They are not penetration testing, a vulnerability scan or an audit of the site.
- **Unused code.** `utilities/APITestUtils.ts` and `BasePage.frameLocator()` are present but unused.

---

## Project structure

```text
pages/
  BasePage.ts                  Holds the Page; protected locator / frameLocator helpers
  HomePage.ts                  Home page locators and getters
  LoginPage.ts                 /login-v1 login-selection page
  NavigationPage.ts            Site header navigation
tests/
  epic01-homepage/             user-story01-page-load.spec.ts, user-story02-footer.spec.ts
  epic02-navigation/           user-story01-nav-links.spec.ts, user-story02-page-routing.spec.ts
  epic03-login/                user-story01-login-options.spec.ts
  epic04-smoke/                user-story01-seo-accessibility.spec.ts
unit/
  environment.test.ts          Environment resolver unit tests (36)
  errorSignatures.test.ts      Error-signature unit tests (40)
utilities/
  UITestUtils.ts               UI fixture: opens the base URL and checks the response
  APITestUtils.ts              API request fixture (not used by any test yet)
  environment.ts               resolveBaseURL: evn and *_URL to baseURL
  errorSignatures.ts           Error-signature patterns used by TC-31
.github/workflows/
  playwright.yml               Offline static-checks workflow
  prompts/                     Locator-generation prompt templates (not used by the workflow)
playwright.config.ts           Browser project, retries, workers, reporter
tsconfig.json                  TypeScript compiler options (type-check only)
.env.example                   Environment template with placeholder values
```

## Design decisions

**Why a custom `page` fixture?** It centralizes the first navigation and its response check, so every test starts on a verified page without repeated setup.

**Why an epic / user-story folder structure?** It maps tests to Agile tickets, which makes it easy to find coverage for a given story.

**Why unit-test the framework itself?** The environment resolver and the error signatures are logic that every UI run depends on. Testing them offline catches regressions, such as a pattern that matches ordinary text, without needing a browser or a test target.

**Why do smoke tests include SEO and accessibility checks?** Financial-services sites carry regulatory and reputational exposure beyond functional bugs. A missing `alt` attribute or a broken canonical URL may never appear in a functional test run but still matters.
