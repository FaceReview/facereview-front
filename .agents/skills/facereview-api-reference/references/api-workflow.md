# FaceReview API Workflow

## Source of Truth

- Live spec URL: `https://facereview-api.winterholic.net/openapi.json`
- Confirmed metadata as of 2026-04-12:
  - title: `FaceReview API`
  - version: `v2`
  - openapi: `3.0.3`

## Confirmed Top-Level Tags

- `base`
- `auth`
- `home`
- `mypage`
- `watch`
- `admin`
- `test`

## Confirmed Auth Rule

- `components.securitySchemes.BearerAuth`
- type: `http`
- scheme: `bearer`
- bearerFormat: `JWT`

Protected endpoints declare `BearerAuth` in the operation `security` field.

## Recommended Lookup Flow

1. Find the screen, hook, or client code that consumes the API.
2. Use `find` to narrow candidate endpoints from keywords.
3. Use `path` to confirm the exact method, route, request, response, and security requirements.
4. Use `schema` when DTO or field-level typing matters.
5. Do not add fields that are not present in the spec.

## Command Examples

```bash
node .agents/skills/facereview-api-reference/scripts/openapi-query.mjs summary
node .agents/skills/facereview-api-reference/scripts/openapi-query.mjs find bookmark
node .agents/skills/facereview-api-reference/scripts/openapi-query.mjs path GET /api/v2/home/videos
node .agents/skills/facereview-api-reference/scripts/openapi-query.mjs schema BookmarkToggleResponse
```

## Interpretation Rules

- If `find` returns multiple candidates, verify the exact endpoint again with `path`.
- If an operation has multiple response status codes, check both the success case and the default error case.
- Use pagination fields such as `page`, `size`, `total`, and `has_next` exactly as defined in the schema.
- For admin UI work, verify both the `admin` tag and the presence of `BearerAuth`.
- Treat `test` tag endpoints as development-only unless there is a strong reason to surface them in real user flows.
