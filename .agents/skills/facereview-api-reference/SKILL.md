---
name: facereview-api-reference
description: API contract reference for the FaceReview frontend workspace. Use when endpoint contracts, request or response fields, auth requirements, enums, pagination, schemas, or backend behavior must be confirmed while working on the frontend. This repository contains frontend code only, so read the live OpenAPI spec at https://facereview-api.winterholic.net/openapi.json instead of guessing from local code or stale snapshots.
---

# FaceReview API Reference

This repository contains frontend code only. Assume backend implementation details are unavailable locally.

## Core Rules

- Do not guess API facts from frontend code. Check the live OpenAPI spec first.
- Prefer `https://facereview-api.winterholic.net/openapi.json` over local snapshots or stale type definitions.
- If the OpenAPI spec cannot be fetched, do not invent fields or behavior. State the limitation explicitly.

## Default Workflow

1. Find the current screen, hook, state, or client code under `src/` that consumes the API.
2. If the contract matters at all, query the spec with `node .agents/skills/facereview-api-reference/scripts/openapi-query.mjs ...`.
3. Confirm the path, method, auth, request body, response schema, and enums before changing frontend code.
4. If the frontend implementation disagrees with the spec, align the frontend to the spec and note the mismatch in the result when relevant.

## OpenAPI Lookup Commands

Start with the smallest lookup that answers the question.

- Summary: `node .agents/skills/facereview-api-reference/scripts/openapi-query.mjs summary`
- Keyword search: `node .agents/skills/facereview-api-reference/scripts/openapi-query.mjs find login`
- Endpoint details: `node .agents/skills/facereview-api-reference/scripts/openapi-query.mjs path POST /api/v2/auth/login`
- Schema details: `node .agents/skills/facereview-api-reference/scripts/openapi-query.mjs schema LoginRequest`

Read `references/api-workflow.md` only when tag mapping or lookup strategy is needed.

## Implementation Guidance

- When adding or changing API calls, stay consistent with the existing client, shared error handling, and auth storage pattern.
- If `security` includes `BearerAuth`, treat the endpoint as authenticated and keep the UI flow aligned with that requirement.
- Use enums, pagination fields, and nullable behavior exactly as defined in the spec.
- Keep mock data and test doubles aligned with OpenAPI field names and types.

## Reporting

- When reporting API facts, include the HTTP method and path whenever possible.
- If a contract change affects frontend behavior, also check which screens or files consume that contract.
