/**
 * generate-pdf.js
 * Run after test:e2e to convert the HTML report to PDF using Puppeteer.
 * Usage: node e2e/generate-pdf.js
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

(async () => {
    const reportDir = path.join(__dirname, 'Reports');
    const htmlPath = path.join(reportDir, 'test-report.html');
    const pdfPath = path.join(reportDir, 'test-report.pdf');

    if (!fs.existsSync(htmlPath)) {
        console.error('❌ [PDF] HTML report not found at: ' + htmlPath);
        process.exit(1);
    }

    console.log('\n📄 [PDF] Generating PDF from HTML report...');

    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // Load the local HTML file
    await page.goto('file:///' + htmlPath.replace(/\\/g, '/'), {
        waitUntil: 'networkidle0',
        timeout: 30000
    });

    // Wait a bit for animations / fonts to settle
    await new Promise(r => setTimeout(r, 1500));

    await page.pdf({
        path: pdfPath,
        format: 'A4',
        landscape: true,          // landscape for wide table
        printBackground: true,    // include background colors
        margin: {
            top: '15mm',
            right: '12mm',
            bottom: '15mm',
            left: '12mm'
        },
        displayHeaderFooter: true,
        headerTemplate: `
            <div style="font-size:9px;color:#888;width:100%;text-align:right;padding-right:16px">
                E2E Test Report
            </div>`,
        footerTemplate: `
            <div style="font-size:9px;color:#888;width:100%;text-align:center">
                Page <span class="pageNumber"></span> of <span class="totalPages"></span>
            </div>`
    });

    await browser.close();

    console.log('✅ [PDF] Report saved to: ' + pdfPath + '\n');
})();
