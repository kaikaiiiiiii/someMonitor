const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const config = require('./config');

console.log(config);

function sendEmail() {
    const transporter = nodemailer.createTransport({
        host: "smtp.qq.com",
        port: 587,
        secure: false,
        auth: {
            user: config.EMAIL_ACCOUNT,
            pass: config.EMAIL_PASSWORD,
        },
    });

    const mailOptions = {
        from: config.EMAIL_ACCOUNT,
        to: config.EMAIL_RECIPIENT,
        subject: config.EMAIL_TITLE,
        text: config.EMAIL_CONTENT,
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

function traverseDirectory(dirPath, fileType) {
    let latestDate = null;

    function traverse(dirPath) {
        const files = fs.readdirSync(dirPath, { withFileTypes: true });

        for (const file of files) {
            const filePath = path.join(dirPath, file.name);

            if (file.isSymbolicLink()) { continue }; // 跳过符号链接目录

            if (file.isDirectory()) {
                traverse(filePath); // 递归遍历子目录
            } else if (!fileType || path.extname(filePath) === fileType) {
                const stats = fs.statSync(filePath);
                const modifiedDate = stats.mtime;

                if (!latestDate || modifiedDate > latestDate) {
                    latestDate = modifiedDate;
                }
            }
        }
    }

    traverse(dirPath);
    return latestDate;
}


let lastResult;
let lastTimestamp;
let warningShown = false;

function check() {
    const result = traverseDirectory(__dirname, '.js');
    const timestamp = new Date().getTime();
    var diff = timestamp - result;
    var h = Math.floor(diff / 1000 / 60 / 60);
    var m = Math.floor(diff / 1000 / 60 % 60);
    var s = Math.floor(diff % 60000) / 1000;
    process.stdout.write(h + ":" + m + ":" + s);
    if (result === lastResult && lastTimestamp && timestamp - lastTimestamp > config.ALERT_THRESHOLD && !warningShown) {
        sendEmail();
        warningShown = true;
    }

    if (result !== lastResult) {
        warningShown = false;
    }

    lastResult = result;
    lastTimestamp = timestamp;

}

check();

setInterval(check, config.INTERVAL_TIME);
