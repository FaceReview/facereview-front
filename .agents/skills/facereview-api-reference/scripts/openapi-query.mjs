#!/usr/bin/env node

const SPEC_URL =
  process.env.FACEREVIEW_OPENAPI_URL ||
  "https://facereview-api.winterholic.net/openapi.json";

async function loadSpec() {
  const response = await fetch(SPEC_URL, {
    headers: { accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch OpenAPI spec: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

function usage() {
  console.log(
    [
      "Usage:",
      "  node openapi-query.mjs summary",
      "  node openapi-query.mjs list [tag]",
      "  node openapi-query.mjs find <keyword>",
      "  node openapi-query.mjs path <METHOD> <PATH>",
      "  node openapi-query.mjs schema <SchemaName>",
    ].join("\n"),
  );
}

function refName(ref) {
  if (!ref || typeof ref !== "string") {
    return null;
  }

  const parts = ref.split("/");
  return parts[parts.length - 1] || null;
}

function resolveRef(spec, ref) {
  if (!ref || typeof ref !== "string" || !ref.startsWith("#/")) {
    return null;
  }

  return ref
    .slice(2)
    .split("/")
    .reduce((current, segment) => (current ? current[segment] : null), spec);
}

function schemaLabel(schema) {
  if (!schema) {
    return "unknown";
  }

  if (schema.$ref) {
    return refName(schema.$ref);
  }

  if (schema.type === "array") {
    return `array<${schemaLabel(schema.items)}>`;
  }

  if (schema.type === "object" && schema.additionalProperties) {
    return `object<${schemaLabel(schema.additionalProperties)}>`;
  }

  if (schema.enum) {
    return `enum(${schema.enum.join(", ")})`;
  }

  return schema.type || "object";
}

function operationEntries(spec) {
  const entries = [];

  for (const [path, methods] of Object.entries(spec.paths || {})) {
    for (const [method, operation] of Object.entries(methods || {})) {
      entries.push({
        path,
        method: method.toUpperCase(),
        operation,
      });
    }
  }

  return entries;
}

function printSummary(spec) {
  const entries = operationEntries(spec);
  const secured = entries.filter(({ operation }) => Array.isArray(operation.security) && operation.security.length > 0);
  const tags = (spec.tags || []).map((tag) => tag.name);

  console.log(`title: ${spec.info?.title || "unknown"}`);
  console.log(`version: ${spec.info?.version || "unknown"}`);
  console.log(`openapi: ${spec.openapi || "unknown"}`);
  console.log(`paths: ${Object.keys(spec.paths || {}).length}`);
  console.log(`operations: ${entries.length}`);
  console.log(`secured_operations: ${secured.length}`);
  console.log(`tags: ${tags.join(", ")}`);
}

function printList(spec, tagFilter) {
  const normalizedTag = tagFilter ? tagFilter.toLowerCase() : null;
  const entries = operationEntries(spec).filter(({ operation }) => {
    if (!normalizedTag) {
      return true;
    }

    return (operation.tags || []).some((tag) => tag.toLowerCase() === normalizedTag);
  });

  for (const { method, path, operation } of entries) {
    const tags = (operation.tags || []).join(", ");
    console.log(`${method} ${path}${tags ? ` [${tags}]` : ""}${operation.summary ? ` - ${operation.summary}` : ""}`);
  }
}

function printFind(spec, rawKeyword) {
  const keyword = rawKeyword.toLowerCase();
  const entries = operationEntries(spec).filter(({ path, method, operation }) => {
    const haystack = [path, method, operation.summary || "", ...(operation.tags || [])]
      .join(" ")
      .toLowerCase();

    return haystack.includes(keyword);
  });

  if (entries.length === 0) {
    console.log(`No matches for "${rawKeyword}"`);
    return;
  }

  for (const { method, path, operation } of entries) {
    const tags = (operation.tags || []).join(", ");
    console.log(`${method} ${path}${tags ? ` [${tags}]` : ""}${operation.summary ? ` - ${operation.summary}` : ""}`);
  }
}

function printParameters(parameters) {
  if (!Array.isArray(parameters) || parameters.length === 0) {
    console.log("parameters: none");
    return;
  }

  console.log("parameters:");
  for (const parameter of parameters) {
    const label = schemaLabel(parameter.schema);
    const required = parameter.required ? "required" : "optional";
    const description = parameter.description ? ` - ${parameter.description}` : "";
    console.log(`  - ${parameter.in} ${parameter.name}: ${label} (${required})${description}`);
  }
}

function printRequestBody(spec, requestBody) {
  if (!requestBody) {
    console.log("requestBody: none");
    return;
  }

  const resolvedBody = requestBody.$ref ? resolveRef(spec, requestBody.$ref) : requestBody;
  const required = resolvedBody?.required ? "required" : "optional";
  console.log(`requestBody: ${required}`);

  for (const [contentType, content] of Object.entries(resolvedBody?.content || {})) {
    console.log(`  - ${contentType}: ${schemaLabel(content.schema)}`);
  }
}

function printResponses(spec, responses) {
  console.log("responses:");

  for (const [status, response] of Object.entries(responses || {})) {
    const resolvedResponse = response.$ref ? resolveRef(spec, response.$ref) : response;
    const lines = [];

    for (const [contentType, content] of Object.entries(resolvedResponse?.content || {})) {
      lines.push(`${contentType}: ${schemaLabel(content.schema)}`);
    }

    console.log(`  - ${status}: ${resolvedResponse?.description || "no description"}${lines.length ? ` | ${lines.join(", ")}` : ""}`);
  }
}

function printPath(spec, rawMethod, rawPath) {
  const method = rawMethod.toLowerCase();
  const operation = spec.paths?.[rawPath]?.[method];

  if (!operation) {
    console.log(`Operation not found: ${rawMethod.toUpperCase()} ${rawPath}`);
    return;
  }

  console.log(`operation: ${rawMethod.toUpperCase()} ${rawPath}`);
  console.log(`summary: ${operation.summary || "none"}`);
  console.log(`tags: ${(operation.tags || []).join(", ") || "none"}`);
  console.log(
    `security: ${
      Array.isArray(operation.security) && operation.security.length > 0
        ? operation.security.map((item) => Object.keys(item).join(",")).join(" | ")
        : "none"
    }`,
  );

  const pathParameters = spec.paths?.[rawPath]?.parameters || [];
  const operationParameters = operation.parameters || [];
  printParameters([...pathParameters, ...operationParameters]);
  printRequestBody(spec, operation.requestBody);
  printResponses(spec, operation.responses);
}

function printSchema(spec, schemaName) {
  const schema = spec.components?.schemas?.[schemaName];

  if (!schema) {
    console.log(`Schema not found: ${schemaName}`);
    return;
  }

  const seen = new Set();

  function walk(currentSchema, indent, label) {
    const prefix = " ".repeat(indent);

    if (currentSchema.$ref) {
      const name = refName(currentSchema.$ref);
      console.log(`${prefix}${label}: ${name}`);

      if (seen.has(name)) {
        return;
      }

      seen.add(name);
      const resolved = resolveRef(spec, currentSchema.$ref);
      if (resolved) {
        walk(resolved, indent + 2, `${name} fields`);
      }
      return;
    }

    if (currentSchema.type === "array") {
      console.log(`${prefix}${label}: array<${schemaLabel(currentSchema.items)}>`);
      if (currentSchema.items) {
        walk(currentSchema.items, indent + 2, "items");
      }
      return;
    }

    if (currentSchema.type === "object" || currentSchema.properties || currentSchema.additionalProperties) {
      console.log(`${prefix}${label}: object`);
      const required = new Set(currentSchema.required || []);

      for (const [name, property] of Object.entries(currentSchema.properties || {})) {
        const requiredLabel = required.has(name) ? "required" : "optional";
        const description = property.description ? ` - ${property.description}` : "";
        console.log(`${prefix}  - ${name}: ${schemaLabel(property)} (${requiredLabel})${description}`);
      }

      if (currentSchema.additionalProperties) {
        console.log(`${prefix}  additionalProperties: ${schemaLabel(currentSchema.additionalProperties)}`);
      }
      return;
    }

    console.log(`${prefix}${label}: ${schemaLabel(currentSchema)}`);
  }

  walk(schema, 0, schemaName);
}

async function main() {
  const [command, ...args] = process.argv.slice(2);

  if (!command) {
    usage();
    process.exitCode = 1;
    return;
  }

  try {
    const spec = await loadSpec();

    switch (command) {
      case "summary":
        printSummary(spec);
        break;
      case "list":
        printList(spec, args[0]);
        break;
      case "find":
        if (!args[0]) {
          usage();
          process.exitCode = 1;
          return;
        }
        printFind(spec, args.join(" "));
        break;
      case "path":
        if (args.length < 2) {
          usage();
          process.exitCode = 1;
          return;
        }
        printPath(spec, args[0], args[1]);
        break;
      case "schema":
        if (!args[0]) {
          usage();
          process.exitCode = 1;
          return;
        }
        printSchema(spec, args[0]);
        break;
      default:
        usage();
        process.exitCode = 1;
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}

await main();
