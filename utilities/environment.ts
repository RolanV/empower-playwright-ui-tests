/**
 * Resolves the application base URL from the `evn` selector and its matching
 * *_URL variable. It takes the environment as a parameter and has no side
 * effects, so it can be checked without a browser or a network.
 */
const URL_VARIABLES = {
  qa: "QA_URL",
  stg: "STG_URL",
  uat: "UAT_URL",
} as const;

type EnvironmentName = keyof typeof URL_VARIABLES;

const SUPPORTED = Object.keys(URL_VARIABLES).join(", ");

function isEnvironmentName(value: string): value is EnvironmentName {
  return Object.prototype.hasOwnProperty.call(URL_VARIABLES, value);
}

export function resolveBaseURL(env: NodeJS.ProcessEnv): string {
  const selected = env.evn;
  if (!selected) {
    throw new Error(`No environment selected: set evn to one of ${SUPPORTED} (in .env or the shell).`);
  }
  if (!isEnvironmentName(selected)) {
    throw new Error(`Unsupported evn "${selected}": expected one of ${SUPPORTED}.`);
  }

  // Variable names are reported, never values, so errors cannot leak configuration.
  const variable = URL_VARIABLES[selected];
  const raw = env[variable];
  if (!raw) {
    throw new Error(`evn=${selected} requires ${variable} to be set.`);
  }

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error(`${variable} is not a valid absolute URL.`);
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error(`${variable} must use http or https.`);
  }
  if (url.search || url.hash) {
    throw new Error(`${variable} must not include a query string or fragment.`);
  }

  // Ending the base path with "/" makes "./route" resolve beneath it, so
  // https://host/app + "./tools" gives https://host/app/tools, matching the
  // previous string concatenation, and a trailing slash in the variable no
  // longer produces "//tools".
  if (!url.pathname.endsWith("/")) {
    url.pathname += "/";
  }
  return url.toString();
}
