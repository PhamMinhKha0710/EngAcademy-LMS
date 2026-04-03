const imaps = require('imap-simple');
const simpleParser = require('mailparser').simpleParser;

const config = {
    imap: {
        user: 'dinhminh4424@gmail.com',
        password: 'nlsf rvcu gejt nxob',
        host: 'imap.gmail.com',
        port: 993,
        tls: true,
        authTimeout: 3000,
        tlsOptions: { rejectUnauthorized: false }
    }
};

async function getLatestOTP(timeoutSecs = 60) {
    return new Promise(async (resolve, reject) => {
        let connection;
        try {
            console.log(`\n[IMAP] Đang kết nối tới Gmail (dinhminh4424@gmail.com)...`);
            connection = await imaps.connect(config);
            await connection.openBox('INBOX');

            console.log(`[IMAP] Đã kết nối. Đang chờ email mới trong tối đa ${timeoutSecs} giây...`);

            const startTime = Date.now();

            while (Date.now() - startTime < timeoutSecs * 1000) {
                // Get emails from today
                const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
                
                const searchCriteria = [
                    'UNSEEN',
                    ['SINCE', since]
                ];

                const fetchOptions = {
                    bodies: ['HEADER', 'TEXT', ''],
                    markSeen: true
                };

                const messages = await connection.search(searchCriteria, fetchOptions);

                for (let item of messages) {
                    const all = item.parts.find(a => a.which === '');
                    const id = item.attributes.uid;
                    const idHeader = "Imap-Id: " + id + "\r\n";
                    const mail = await simpleParser(idHeader + all.body);

                    const subject = mail.subject || "";
                    if (subject.toLowerCase().includes('otp') || subject.toLowerCase().includes('mật khẩu') || subject.toLowerCase().includes('password')) {
                          const text = mail.text || mail.html || "";
                          const match = text.match(/\b\d{6}\b/);
                          if (match) {
                              const otp = match[0];
                              console.log(`[IMAP] Đã tìm thấy mã OTP: ${otp} trong email: "${subject}"\n`);
                              connection.end();
                              return resolve(otp);
                          }
                    }
                }

                // Chờ 5 giây trước khi check lại
                await new Promise(r => setTimeout(r, 5000));
            }
            connection.end();
            reject(new Error(`[IMAP] Timeout: Không thể tìm thấy mã OTP sau ${timeoutSecs} giây.`));
        } catch (error) {
            console.error("[IMAP] Lỗi:", error.message);
            if (connection) {
                connection.end();
            }
            reject(error);
        }
    });
}

module.exports = { getLatestOTP };
