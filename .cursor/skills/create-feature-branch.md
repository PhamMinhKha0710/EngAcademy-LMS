---
description: How to create a new feature branch from dev
---

## Steps

1. Make sure you are on the `dev` branch:
```bash
git checkout dev
git pull origin dev
```



2. Create a new feature branch from `dev`:
```bash
git checkout -b feature/<feature-name>
```

3. Make your changes and commit:
```bash
git add <files>
git commit -m "feat(<scope>): <description>"
```

4. Push the feature branch to remote:
```bash
git push -u origin feature/<feature-name>
```

> **IMPORTANT**: Always create feature branches from `dev`, never from `main` or other branches.
> Convention: `feature/<feature-name>` (e.g. `feature/setup-admin`, `feature/lesson-management`)
> **Không được** đẩy lên remote các commit có trong message dòng `Co-authored-by: Cursor <cursoragent@cursor.com>`. Nếu đã có, sửa message (amend hoặc rebase) hoặc xóa dòng đó trước khi push.
