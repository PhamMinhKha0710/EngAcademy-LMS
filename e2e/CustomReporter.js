const fs = require('fs');
const path = require('path');

// ANSI Color Codes
const colors = {
    reset: "\x1b[0m",
    bold: "\x1b[1m",
    blue: "\x1b[34m",
    green: "\x1b[32m",
    red: "\x1b[31m",
    cyan: "\x1b[36m",
    yellow: "\x1b[33m",
    gray: "\x1b[90m"
};

const logInfo = (msg) => console.log(`${colors.blue}[INFO]${colors.reset} ${msg}`);
const logBold = (msg) => console.log(`${colors.blue}[INFO]${colors.reset} ${colors.bold}${msg}${colors.reset}`);

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
        this._startTime = Date.now();
    }

    onRunStart(results, options) {
        logInfo("Scanning for projects...");
        logInfo(`${colors.blue}-------------------< ${colors.cyan}com.englishlearn:english-learning-frontend ${colors.blue}>-------------------${colors.reset}`);
        logBold("Building English Learning Platform 1.0.0");
        logInfo("  from package.json");
        logInfo(`${colors.blue}--------------------------------[ ${colors.cyan}e2e ${colors.blue}]---------------------------------${colors.reset}`);
        logInfo("");
    }

    onTestStart(test) {
        logInfo(`${colors.blue}--- ${colors.cyan}surefire:3.1.2:test ${colors.reset}${colors.bold}(default-test)${colors.reset}${colors.blue} @ english-learning-frontend ---${colors.reset}`);
        logInfo(`${colors.bold}T E S T S${colors.reset}`);
        logInfo(`${colors.blue}-------------------------------------------------------${colors.reset}`);
        logInfo(`Running ${colors.bold}${path.basename(test.path)}${colors.reset}`);
    }

    onTestResult(test, testResult) {
        const time = (testResult.perfStats.end - testResult.perfStats.start) / 1000;
        const total = testResult.numPassingTests + testResult.numFailingTests + testResult.numPendingTests;
        logInfo(`Tests run: ${colors.bold}${total}${colors.reset}, Failures: ${colors.red}${testResult.numFailingTests}${colors.reset}, Errors: 0, Skipped: ${testResult.numPendingTests}, Time elapsed: ${time.toFixed(3)} s -- in ${colors.bold}${path.basename(test.path)}${colors.reset}`);
        logInfo("");
    }

    onRunComplete(testContexts, results) {
        const screenshotDir = path.join(__dirname, 'Screenshots');

        // ── Print Maven-style Results Summary ──
        logInfo("Results:");
        logInfo("");
        const statusColor = results.numFailedTests > 0 ? colors.red : colors.green;
        logInfo(`Tests run: ${results.numTotalTests}, Failures: ${statusColor}${results.numFailedTests}${colors.reset}, Errors: 0, Skipped: ${results.numPendingTests}`);
        logInfo("");
        logInfo(`${colors.blue}------------------------------------------------------------------------${colors.reset}`);
        
        if (results.numFailedTests > 0) {
            logInfo(`${colors.red}${colors.bold}BUILD FAILURE${colors.reset}`);
        } else {
            logInfo(`${colors.green}${colors.bold}BUILD SUCCESS${colors.reset}`);
        }
        
        logInfo(`${colors.blue}------------------------------------------------------------------------${colors.reset}`);
        
        const totalTime = (Date.now() - this._startTime) / 1000;
        logInfo(`Total time:  ${totalTime.toFixed(3)} s`);
        
        const now = new Date();
        const offset = -now.getTimezoneOffset();
        const diff = offset >= 0 ? '+' : '-';
        const pad = (num) => String(num).padStart(2, '0');
        const timestamp = now.getFullYear() +
            '-' + pad(now.getMonth() + 1) +
            '-' + pad(now.getDate()) +
            'T' + pad(now.getHours()) +
            ':' + pad(now.getMinutes()) +
            ':' + pad(now.getSeconds()) +
            diff + pad(Math.floor(Math.abs(offset) / 60)) +
            ':' + pad(Math.abs(offset) % 60);
            
        logInfo(`Finished at: ${timestamp}`);
        logInfo(`${colors.blue}------------------------------------------------------------------------${colors.reset}`);

        // ── Original HTML logic ──
        const rows = [];
        results.testResults.forEach(suite => {
            const testFilePath = suite.testFilePath; 
            suite.testResults.forEach(test => {
                let id = 'TC-E2E';
                let description = test.title;
                const m1 = test.title.match(/\b(TC-[A-Z0-9-]+)\b/);
                const m2 = test.title.match(/\b(\d+)\.\s*/);

                if (m1) { id = m1[1]; description = test.title.replace(m1[0], '').replace(/^:\s*/, '').trim(); }
                else if (m2) { id = `TC-${m2[1].padStart(2, '0')}`; description = test.title.replace(m2[0], '').trim(); }

                const isPassed = test.status === 'passed';
                const statusStr = isPassed ? 'passed' : 'failed';
                const suffix = isPassed ? '_passed' : '_failed';

                // Detect screenshot
                const screenshotName = `${id}${suffix}.png`;
                const screenshotPathFull = path.join(screenshotDir, screenshotName);
                const hasScreenshot = fs.existsSync(screenshotPathFull);
                const screenshotRelPath = hasScreenshot ? `../Screenshots/${screenshotName}` : null;

                // Format execution time (HH:mm:ss)
                const startTime = new Date(suite.perfStats.start);
                const testTimeStr = pad(startTime.getHours()) + ":" + pad(startTime.getMinutes()) + ":" + pad(startTime.getSeconds());

                const rawCode = extractTestCode(testFilePath, test.title) || '// Source code not found';
                const highlightedCode = highlight(rawCode);

                const suiteName = path.basename(testFilePath);
                const titleParts = test.title.split('|');
                const tcName = titleParts[0].trim();
                const tcContent = titleParts[1] ? titleParts[1].trim() : "Hệ thống xử lý mượt mà, không gặp lỗi kịch bản.";

                rows.push({ 
                    id, 
                    statusStr, 
                    item: suiteName, 
                    description: tcName, 
                    execTime: test.duration ? test.duration + ' ms' : '< 1 ms',
                    testTime: testTimeStr,
                    expectedOutput: tcContent, 
                    isPassed, 
                    highlightedCode, 
                    screenshot: screenshotRelPath 
                });
            });
        });

        let tableRows = '';
        let globalIndex = 0;
        rows.forEach((r, idx) => {
            const screenshotBtn = r.screenshot 
                ? `<button class="action-btn" style="background:#10b981;margin-left:5px" onclick="openMedia(${globalIndex}, 'img')">📸 Ảnh</button>`
                : '';
            tableRows += `
                    <tr>
                        <td><span class="id-badge">${escHtml(r.id)}</span></td>
                        <td style="font-weight:500;font-size:13px">${escHtml(r.item)}</td>
                        <td class="desc-col" style="font-weight:600">${escHtml(r.description)}</td>
                        <td style="font-family:monospace;font-size:13px">${r.testTime}</td>
                        <td style="font-family:monospace;font-size:13px">${r.execTime}</td>
                        <td class="expected-col">${escHtml(r.expectedOutput)}</td>
                        <td><span class="badge badge-${r.statusStr}">${r.isPassed ? 'Đạt' : 'Lỗi'}</span></td>
                        <td>
                            <div style="display:flex">
                                <button class="action-btn" onclick="openMedia(${globalIndex}, 'code')">🔍 Mã</button>
                                ${screenshotBtn}
                            </div>
                        </td>
                    </tr>`;
            globalIndex++;
        });

        const dataJson = JSON.stringify(rows);

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
        th{background:#312e81;color:#fff;font-weight:600;text-transform:uppercase;font-size:11px;letter-spacing:.5px;white-space:nowrap;position:sticky;top:0}
        tr:hover td{background:#f8fafc}
        .id-badge{display:inline-block;background:#e0e7ff;color:#3730a3;padding:4px 8px;border-radius:4px;font-weight:600;font-family:monospace;font-size:13px;white-space:nowrap}
        .badge{display:inline-block;padding:5px 10px;border-radius:20px;font-weight:600;font-size:12px;text-align:center;min-width:80px}
        .badge-passed{background:#d1fae5;color:#065f46}.badge-failed{background:#fee2e2;color:#991b1b}
        .action-btn{display:inline-flex;align-items:center;gap:5px;background:var(--primary);color:#fff;border:none;cursor:pointer;padding:7px 10px;border-radius:6px;font-size:11px;font-weight:600;transition:background .2s,transform .1s;white-space:nowrap}
        .action-btn:hover{background:#4338ca;transform:translateY(-1px)}.action-btn:active{transform:translateY(0)}
        .desc-col{max-width:280px}.expected-col{font-size:13px;color:var(--muted)}
        /* Modal */
        .overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:1000;align-items:center;justify-content:center}
        .overlay.open{display:flex}
        .modal{background:#fff;border-radius:12px;width:95%;max-width:1100px;max-height:90vh;display:flex;flex-direction:column;box-shadow:0 25px 50px rgba(0,0,0,.45);overflow:hidden}
        .modal-hd{display:flex;justify-content:space-between;align-items:center;padding:15px 20px;background:#1e1b4b;color:#fff}
        .modal-badge{background:rgba(255,255,255,.2);color:#fff;padding:3px 10px;border-radius:4px;font-size:13px;font-weight:700;font-family:monospace}
        .modal-title{color:#fff;font-size:14px;font-weight:600;margin-left:10px}
        .modal-close{background:rgba(255,255,255,.2);border:none;color:#fff;width:28px;height:28px;border-radius:50%;font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .2s}
        .modal-close:hover{background:#ef4444;color:#fff}
        .modal-body{overflow-y:auto;padding:20px;background:#1e1e2e;color:#cdd6f4}
        .modal-body.img-mode{background:#f3f4f6;display:flex;justify-content:center}
        .modal-body.img-mode img{max-width:100%;height:auto;border-radius:8px;box-shadow:0 4px 6px -1px rgba(0,0,0,.1)}
        pre{background:transparent;color:#cdd6f4;font-family:'Fira Code','Cascadia Code',Consolas,monospace;font-size:13px;line-height:1.75;white-space:pre-wrap;word-break:break-all}
        .ln{color:#45475a;user-select:none;display:inline-block;min-width:36px;text-align:right;margin-right:14px;font-size:12px}
        .kw{color:#cba6f7}.str{color:#a6e3a1}.cmt{color:#6c7086;font-style:italic}.num{color:#fab387}
    </style>
</head>
<body>
<div class="container">
    <div class="header">
        <h1>Báo cáo Kiểm thử Tự động E2E</h1>
        <div style="text-align:right">
            <div style="font-size:14px;font-weight:600">Dự án: English Learning System</div>
            <div style="font-size:12px;opacity:.8;margin-top:4px">Ngày xuất: ${now.toLocaleString('vi-VN')}</div>
        </div>
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
                <th width="12%">Tệp Test</th>
                <th width="15%">Tên Kịch Bản</th>
                <th width="8%">Giờ Test</th>
                <th width="8%">Thời lượng</th>
                <th width="30%">Nội dung thực hiện</th>
                <th width="8%">Kết quả</th>
                <th width="11%">Hành động</th>
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
        <div class="modal-body" id="mBody"></div>
    </div>
</div>

<script>
var DATA = ${dataJson};
function openMedia(i, mode){
    var d=DATA[i]||{};
    document.getElementById('mBadge').textContent=d.id||'TC';
    document.getElementById('mTitle').textContent=' \u2014 '+d.description;
    var body = document.getElementById('mBody');
    body.innerHTML = '';
    body.className = 'modal-body';

    if(mode === 'code'){
        body.innerHTML = '<pre>' + (d.highlightedCode || '// not found') + '</pre>';
    } else {
        body.className = 'modal-body img-mode';
        body.innerHTML = '<img src="' + d.screenshot + '" alt="Screenshot">';
    }
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
        logInfo(`Created custom HTML report at: ${colors.cyan}${reportPath}${colors.reset}`);
    }
}

module.exports = CustomReporter;
