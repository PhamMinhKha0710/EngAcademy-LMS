const fs = require('fs');
const path = require('path');

/**
 * Extract the body of a specific test case from the test file source.
 */
function extractTestCode(testFilePath, testTitle) {
    try {
        const src = fs.readFileSync(testFilePath, 'utf8');
        const escaped = testTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const pattern = new RegExp(
            `test\\(['"\`]${escaped}['"\`]\\s*,\\s*async\\s*\\(\\)\\s*=>\\s*\\{`
        );
        const startMatch = pattern.exec(src);
        if (!startMatch) return null;

        let start = startMatch.index + startMatch[0].length;
        let depth = 1;
        let i = start;
        while (i < src.length && depth > 0) {
            if (src[i] === '{') depth++;
            else if (src[i] === '}') depth--;
            i++;
        }
        return src.slice(start, i - 1).trim();
    } catch (e) {
        return null;
    }
}

/** Escape HTML entities */
function escHtml(s) {
    return s
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

/**
 * Very simple server-side syntax highlighter.
 */
function highlight(code) {
    return code.split('\n').map((raw, idx) => {
        let line = escHtml(raw);
        line = line.replace(/\/\/([^\n]*)/g, '<span class="cmt">//$1</span>');
        line = line.replace(/(&quot;(?:[^&]|&(?!quot;))*?&quot;|&#039;(?:[^&]|&(?!#039;))*?&#039;|'[^']*')/g,
            m => '<span class="str">' + m + '</span>');
        line = line.replace(/\b(const|let|var|async|await|return|if|else|true|false|null|undefined|new|function|import|require|expect|describe|test|beforeAll|beforeEach|afterAll|afterEach)\b/g,
            '<span class="kw">$1</span>');
        line = line.replace(/(?<![a-zA-Z_$])(\d+)(?![a-zA-Z_$])/g,
            '<span class="num">$1</span>');
        const lineNum = `<span class="ln">${String(idx + 1).padStart(3, ' ')}</span>`;
        return lineNum + line;
    }).join('\n');
}

class CustomReporter {
    constructor(globalConfig, options) {
        this._globalConfig = globalConfig;
        this._options = options;
    }

    onRunComplete(testContexts, results) {
        const testFilePath = path.join(__dirname, 'Tests', 'main.e2e.test.js');
        const screenshotDir = path.join(__dirname, 'Screenshots');

        // ── Build row data & Rename Screenshots ───────────────────────────────
        const rows = [];
        results.testResults.forEach(suite => {
            suite.testResults.forEach(test => {
                const item = test.ancestorTitles[0] || 'E2E Testing';
                const subItemRaw = test.ancestorTitles[1] || '';
                const subItem = subItemRaw.replace(/PHẦN \d+:\s*/, '');

                let id = 'TC-E2E';
                let description = test.title;
                const m1 = test.title.match(/\b(TC-[A-Z0-9-]+)\b/);
                const m2 = test.title.match(/\b(\d+)\.\s*/);

                if (m1) { id = m1[1]; description = test.title.replace(m1[0], '').replace(/^:\s*/, '').trim(); }
                else if (m2) { id = `TC-${m2[1].padStart(2, '0')}`; description = test.title.replace(m2[0], '').trim(); }

                const execTime = test.duration ? test.duration + ' ms' : '< 1 ms';
                const isPassed = test.status === 'passed';
                const statusStr = isPassed ? 'passed' : 'failed';

                // Vietnamese Expected Output
                let expectedOutput = isPassed
                    ? 'Hệ thống xử lý mượt mà, không gặp lỗi kịch bản.'
                    : 'Các bước thực hiện thành công, dữ liệu được ghi nhận.';

                const descLower = description.toLowerCase();
                if (descLower.includes('đăng nhập thành công') || descLower.includes('luồng người dùng'))
                    expectedOutput = 'Chuyển hướng thành công, hiển thị thông tin người dùng.';
                else if (descLower.includes('sai mật khẩu'))
                    expectedOutput = 'Hiển thị thông báo lỗi, giữ nguyên trang đăng nhập.';
                else if (descLower.includes('thiếu username') || descLower.includes('thiếu password'))
                    expectedOutput = 'Trình duyệt ngăn chặn submit, báo lỗi trường trống.';
                else if (descLower.includes('đăng xuất'))
                    expectedOutput = 'Xóa session/token, quay về trang chủ hoặc login.';
                else if (descLower.includes('từ khóa hợp lệ'))
                    expectedOutput = 'Danh sách kết quả hiển thị khớp với từ khóa.';
                else if (descLower.includes('không có kết quả') || descLower.includes('ký tự đặc biệt'))
                    expectedOutput = 'Hiển thị giao diện "Empty State" (không tìm thấy).';
                else if (descLower.includes('từ khóa trống'))
                    expectedOutput = 'Hiển thị toàn bộ danh sách hoặc giữ nguyên trạng thái.';

                const rawCode = extractTestCode(testFilePath, test.title) || '// Source code not found';
                const highlightedCode = highlight(rawCode);

                // Rename screenshot file: ID.png -> ID_status.png
                try {
                    const oldPath = path.join(screenshotDir, `${id}.png`);
                    const newPath = path.join(screenshotDir, `${id}_${statusStr}.png`);
                    if (fs.existsSync(oldPath)) {
                        if (fs.existsSync(newPath)) fs.unlinkSync(newPath);
                        fs.renameSync(oldPath, newPath);
                    }
                } catch (e) { }

                rows.push({ id, statusStr, item: item.replace(/KỊCH BẢN KIỂM THỬ E2E TOÀN DIỆN.*/, 'Toàn bộ E2E'), subItem, description, execTime, expectedOutput, isPassed, highlightedCode });
            });
        });

        // ── Build table rows ──────────────────────────────────────────────────
        let tableRows = '';
        rows.forEach((r, idx) => {
            const statusHtml = r.isPassed
                ? '<span class="badge badge-passed">Đạt</span>'
                : '<span class="badge badge-failed">Lỗi</span>';
            tableRows += `
                    <tr>
                        <td><span class="id-badge">${escHtml(r.id)}</span></td>
                        <td style="font-weight:500;font-size:13px">${escHtml(r.item)}</td>
                        <td class="subitem-col">${escHtml(r.subItem)}</td>
                        <td class="desc-col">${escHtml(r.description)}</td>
                        <td style="font-family:monospace;font-size:13px">${r.execTime}</td>
                        <td class="expected-col">${r.expectedOutput}</td>
                        <td>${statusHtml}</td>
                        <td><button class="action-btn" onclick="openCode(${idx})">&#128269; Mã Test</button></td>
                    </tr>`;
        });

        const codeArrayJson = JSON.stringify(
            rows.map(r => ({ id: r.id, desc: r.description, hl: r.highlightedCode }))
        );

        // ── Full HTML ─────────────────────────────────────────────────────────
        const html = `<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Báo cáo Kiểm thử E2E</title>
    <style>
        :root{--primary:#4f46e5;--success:#10b981;--danger:#ef4444;--bg:#f3f4f6;--border:#e5e7eb;--main:#1f2937;--muted:#6b7280}
        *{box-sizing:border-box;margin:0;padding:0}
        body{font-family:'Inter',-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif;background:var(--bg);color:var(--main);padding:30px}
        .container{max-width:1400px;margin:0 auto;background:#fff;border-radius:12px;box-shadow:0 10px 15px -3px rgba(0,0,0,.1),0 4px 6px -2px rgba(0,0,0,.05);overflow:hidden}
        .header{background:#1e1b4b;color:#fff;padding:25px 30px;display:flex;justify-content:space-between;align-items:center}
        .header h1{font-size:24px;font-weight:600;margin:0}
        .summary-cards{display:flex;gap:20px;padding:25px 30px;background:#fafafa;border-bottom:1px solid var(--border)}
        .card{flex:1;background:#fff;border:1px solid var(--border);border-radius:8px;padding:20px;text-align:center;box-shadow:0 1px 3px rgba(0,0,0,.05)}
        .card-value{font-size:32px;font-weight:700;margin-bottom:5px}
        .card-label{font-size:13px;color:var(--muted);text-transform:uppercase;letter-spacing:.5px;font-weight:600}
        .c-total .card-value{color:var(--primary)}.c-pass .card-value{color:var(--success)}.c-fail .card-value{color:var(--danger)}
        .table-wrapper{padding:30px;overflow-x:auto}
        table{width:100%;border-collapse:collapse;font-size:14px}
        th,td{padding:14px 16px;text-align:left;border-bottom:1px solid var(--border);line-height:1.5}
        th{background:#312e81;color:#fff;font-weight:600;text-transform:uppercase;font-size:12px;letter-spacing:.5px;white-space:nowrap;position:sticky;top:0}
        tr:hover td{background:#f8fafc}
        .id-badge{display:inline-block;background:#e0e7ff;color:#3730a3;padding:4px 8px;border-radius:4px;font-weight:600;font-family:monospace;font-size:13px;white-space:nowrap}
        .badge{display:inline-block;padding:5px 10px;border-radius:20px;font-weight:600;font-size:12px;text-align:center;min-width:80px}
        .badge-passed{background:#d1fae5;color:#065f46}.badge-failed{background:#fee2e2;color:#991b1b}
        .action-btn{display:inline-flex;align-items:center;gap:5px;background:var(--primary);color:#fff;border:none;cursor:pointer;padding:7px 13px;border-radius:6px;font-size:12px;font-weight:600;transition:background .2s,transform .1s;white-space:nowrap}
        .action-btn:hover{background:#4338ca;transform:translateY(-1px)}.action-btn:active{transform:translateY(0)}
        .desc-col{max-width:280px}.subitem-col{color:#4338ca;font-weight:500;font-size:13px}.expected-col{font-size:13px;color:var(--muted)}
        /* Modal */
        .overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:1000;align-items:center;justify-content:center}
        .overlay.open{display:flex}
        .modal{background:#1e1e2e;border-radius:12px;width:92%;max-width:800px;max-height:82vh;display:flex;flex-direction:column;box-shadow:0 25px 50px rgba(0,0,0,.45);overflow:hidden}
        .modal-hd{display:flex;justify-content:space-between;align-items:center;padding:15px 20px;background:#181825;border-bottom:1px solid #313244}
        .modal-badge{background:#313244;color:#89b4fa;padding:3px 10px;border-radius:4px;font-size:13px;font-weight:700;font-family:monospace}
        .modal-title{color:#cdd6f4;font-size:13px;font-weight:600;font-family:monospace;margin-left:10px}
        .modal-close{background:#45475a;border:none;color:#cdd6f4;width:28px;height:28px;border-radius:50%;font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .2s}
        .modal-close:hover{background:#ef4444;color:#fff}
        .modal-body{overflow-y:auto;padding:20px}
        pre{background:transparent;color:#cdd6f4;font-family:'Fira Code','Cascadia Code',Consolas,monospace;font-size:13px;line-height:1.75;white-space:pre-wrap;word-break:break-all}
        .ln{color:#45475a;user-select:none;display:inline-block;min-width:36px;text-align:right;margin-right:14px;font-size:12px}
        .kw{color:#cba6f7}.str{color:#a6e3a1}.cmt{color:#6c7086;font-style:italic}.num{color:#fab387}
    </style>
</head>
<body>
<div class="container">
    <div class="header">
        <h1>Báo cáo Kiểm thử Tự động E2E</h1>
        <div style="font-size:14px;opacity:.8">Dự án: English Learning System</div>
    </div>
    <div class="summary-cards">
        <div class="card c-total"><div class="card-value">${results.numTotalTests}</div><div class="card-label">Tổng Case</div></div>
        <div class="card c-pass"><div class="card-value">${results.numPassedTests}</div><div class="card-label">Thành công</div></div>
        <div class="card c-fail"><div class="card-value">${results.numFailedTests}</div><div class="card-label">Thất bại</div></div>
    </div>
    <div class="table-wrapper">
        <table>
            <thead><tr>
                <th width="8%">Mã TC</th>
                <th width="12%">Items</th>
                <th width="15%">Sub-Items</th>
                <th width="22%">Nội dung kiểm thử</th>
                <th width="8%">Thời gian</th>
                <th width="15%">Kết quả mong đợi</th>
                <th width="10%">Kết quả</th>
                <th width="10%">Hành động</th>
            </tr></thead>
            <tbody>${tableRows}</tbody>
        </table>
    </div>
</div>

<!-- Modal -->
<div class="overlay" id="overlay" onclick="closeOnBg(event)">
    <div class="modal">
        <div class="modal-hd">
            <div style="display:flex;align-items:center">
                <span class="modal-badge" id="mBadge"></span>
                <span class="modal-title" id="mTitle"></span>
            </div>
            <button class="modal-close" onclick="closeModal()">&#10005;</button>
        </div>
        <div class="modal-body"><pre id="mCode"></pre></div>
    </div>
</div>

<script>
var DATA = ${codeArrayJson};
function openCode(i){
    var d=DATA[i]||{};
    document.getElementById('mBadge').textContent=d.id||'TC';
    document.getElementById('mTitle').textContent=' \u2014 '+d.desc;
    document.getElementById('mCode').innerHTML=d.hl||'// not found';
    document.getElementById('overlay').classList.add('open');
}
function closeModal(){document.getElementById('overlay').classList.remove('open');}
function closeOnBg(e){if(e.target.id==='overlay')closeModal();}
document.addEventListener('keydown',function(e){if(e.key==='Escape')closeModal();});
</script>
</body>
</html>`;

        const reportDir = path.join(__dirname, 'Reports');
        if (!fs.existsSync(reportDir)) fs.mkdirSync(reportDir, { recursive: true });

        const reportPath = path.join(reportDir, 'test-report.html');
        fs.writeFileSync(reportPath, html, 'utf8');
        console.log('\n✅ [CustomReporter] Created custom HTML report at: ' + reportPath + '\n');
    }
}

module.exports = CustomReporter;
