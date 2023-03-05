const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const config = require('./config');

console.log(config);
console.log("\n");

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

    let mailtimestamp = new Date();

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log(mailtimestamp + ':Email sent: ' + info.response);
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

// 只在程序启动时执行一次，令其与 check 结果一致，避免第一次 check 时发送邮件
let lastTraversedTime = traverseDirectory(config.DIRECTORY_TO_WATCH, config.MONITOR_TYPE);
// 只在程序启动时执行一次，获得当前时间
let lastChangeTime = new Date().getTime();
// 用于避免重复发送邮件，且第一次不发送邮件
let warningMailFlag = false;

function check() {
    const thisTraversedTime = traverseDirectory(config.DIRECTORY_TO_WATCH, config.MONITOR_TYPE);
    const thisCheckingTime = new Date().getTime();

    // 显示最新修改时间距离当前时间的差值
    var diff = thisCheckingTime - thisTraversedTime;
    var h = ('0' + Math.floor(diff / 1000 / 60 / 60)).slice(-2);
    var m = ('0' + Math.floor(diff / 1000 / 60 % 60)).slice(-2);
    var s = ('0' + Math.floor(diff % 60000) / 1000).slice(-6);
    // process.stdout.write("Status: " + h + ":" + m + ":" + s + "\r");
    console.log("Status: " + h + ":" + m + ":" + s + "\r");

    if (thisTraversedTime !== lastTraversedTime) { // 最新修改时间有变化，说明文件更新了，重置三项状态
        warningMailFlag = true; //默认是 false，只有第一次文件更新后才开始启动邮件标记
        lastChangeTime = thisTraversedTime;
        lastTraversedTime = thisTraversedTime; // 更新最新修改时间
    } else { // 无更新则检查时间和邮件发送状态
        if (thisCheckingTime - lastChangeTime > config.ALERT_THRESHOLD && warningMailFlag) {
            sendEmail();
            warningMailFlag = false;
        }
    }

}

check();

setInterval(check, config.INTERVAL_TIME);
