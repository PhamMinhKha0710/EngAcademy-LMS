---
name: git-conventional-commits
description: Generates and edits commit messages following the Conventional Commits specification (v1.0.0); suggests type, scope, and description; enforces project git rules (branch from dev, feature/<name>, no Co-authored-by Cursor on remote). Use when the user asks to write or edit a commit message, when preparing a commit, when reviewing diffs to suggest a message, or when asking about the project's commit or git conventions.
---

# Git – Conventional Commits

## Format

Commit message structure (from [Conventional Commits v1.0.0](https://www.conventionalcommits.org/en/v1.0.0/)):

```
<type>[(optional scope)]: <description>

[optional body]

[optional footer(s)]
```

- **Type**: Required. Noun: `feat`, `fix`, or other (see below).
- **Scope**: Optional. Noun in parentheses describing the part of the codebase (e.g. `frontend`, `admin`, `backend`, `api`). In this repo, common scopes are `backend`, `frontend`, `admin`, `api`, `test`, `docs`.
- **Description**: Required. Short summary in imperative mood ("add" not "added"), no period at the end.
- **Body**: Optional. One blank line after the description; extra context.
- **Footer**: Optional. One blank line after body; e.g. `BREAKING CHANGE:`, `Refs: #123`.

## Types

- **feat**: New feature (SemVer MINOR).
- **fix**: Bug fix (SemVer PATCH).
- **docs**: Documentation only.
- **style**: Formatting, missing semicolons, etc.; no code logic change.
- **refactor**: Code change that is not a fix nor a new feature.
- **perf**: Performance improvement.
- **test**: Adding or updating tests.
- **chore**: Build, tooling, dependencies, config.
- **ci**: CI config or scripts.
- **build**: Build system or external deps.

Use `feat` and `fix` when they apply; use the others for clarity.

## Breaking changes

- In footer: `BREAKING CHANGE: <description>` (or token `BREAKING-CHANGE:`).
- In subject: add `!` after type/scope, e.g. `feat(api)!: remove legacy endpoint`.

## Quick examples

```
feat(admin): add CRUD page for schools
fix(backend): prevent NPE in ExamResult when exam is null
docs: update API section in README
refactor(frontend): extract auth hook from Login page
```

## Project rules

Aligned with [.agent/workflows/create-feature-branch.md](../../../.agent/workflows/create-feature-branch.md):

1. **Branches**: Create feature branches from `dev`; name them `feature/<feature-name>` (e.g. `feature/setup-admin`).
2. **No Cursor co-author on remote**: Do not push commits whose message contains `Co-authored-by: Cursor <cursoragent@cursor.com>`. If present, amend or rebase to remove that line before pushing.

## Workflow when writing a commit message

1. Review the diff or context of the change.
2. Choose **type** and **scope** from the change.
3. Write a short **description** in imperative mood.
4. Ensure the suggested message does **not** include `Co-authored-by: Cursor <cursoragent@cursor.com>`.

## More

- Full spec and examples: [reference.md](reference.md)
- More commit examples for this repo: [examples.md](examples.md)
