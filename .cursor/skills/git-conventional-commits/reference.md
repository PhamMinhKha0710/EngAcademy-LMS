# Conventional Commits – Reference (v1.0.0)

Tóm tắt từ [conventionalcommits.org](https://www.conventionalcommits.org/en/v1.0.0/).

## Cấu trúc

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

- **type**: Bắt buộc. `feat` = tính năng mới, `fix` = sửa lỗi; các type khác (docs, style, refactor, perf, test, chore, ci, build) tùy chọn.
- **scope**: Tùy chọn. Danh từ trong ngoặc đơn, mô tả phần codebase.
- **description**: Bắt buộc. Tóm tắt ngắn, viết ở thể imperative (imperative mood).
- **body**: Tùy chọn. Cách dòng trống sau description; thêm ngữ cảnh.
- **footer**: Tùy chọn. Cách dòng trống sau body; format tương tự git trailer (token + `:` hoặc `#` + giá trị). Token dùng `-` thay khoảng trắng (vd. `Acked-by`). Ngoại lệ: `BREAKING CHANGE` có thể viết có dấu cách.

## Quy tắc chính (spec)

1. Commit MUST có prefix type (feat, fix, …), sau đó tùy chọn scope, tùy chọn `!`, rồi dấu hai chấm và space, rồi description.
2. Type `feat` MUST dùng khi thêm tính năng mới.
3. Type `fix` MUST dùng khi sửa lỗi.
4. Scope MAY có, là danh từ trong ngoặc đơn (vd. `fix(parser):`).
5. Description MUST ngay sau colon + space; là tóm tắt ngắn của thay đổi.
6. Body MAY có, bắt đầu bằng một dòng trống sau description.
7. Footer MAY có, mỗi dòng là token + `:<space>` hoặc `<space>#` + giá trị.
8. Breaking change: trong type/scope thêm `!` (vd. `feat!: ...`) HOẶC footer `BREAKING CHANGE: <mô tả>` (viết hoa BREAKING CHANGE).

## Ví dụ từ spec

**Description + breaking change footer:**
```
feat: allow provided config object to extend other configs

BREAKING CHANGE: `extends` key in config file is now used for extending other config files
```

**Scope + `!`:**
```
feat(api)!: send an email to the customer when a product is shipped
```

**Chỉ description:**
```
docs: correct spelling of CHANGELOG
```

**Scope:**
```
feat(lang): add Polish language
```

**Body + nhiều footer:**
```
fix: prevent racing of requests

Introduce a request id and a reference to latest request. Dismiss
incoming responses other than from latest request.

Reviewed-by: Z
Refs: #123
```

**Revert:**
```
revert: let us never again speak of the noodle incident

Refs: 676104e, a215868
```

## SemVer

- `fix` → PATCH
- `feat` → MINOR
- Commit có BREAKING CHANGE (bất kể type) → MAJOR
