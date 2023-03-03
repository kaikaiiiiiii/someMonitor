const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const config = require('./config');

console.log(config);


let lastFileCreatedTime = null;

function sendEmail() {
    const transporter = nodemailer.createTransport({
        host: "smtp.qq.com",
        port: 587,
        secure: false,
        auth: {
            user: EMAIL_ACCOUNT,
            pass: EMAIL_PASSWORD,
        },
    });

    const mailOptions = {
        from: EMAIL_ACCOUNT,
        to: EMAIL_RECIPIENT,
        subject: 'title',
        text: 'content',
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

function traverseDirectory(dirPath) {
    const files = fs.readdirSync(dirPath, { withFileTypes: true });

    files.forEach((file) => {
        const filePath = path.join(dirPath, file.name);
        if (file.isDirectory() && !fs.lstatSync(filePath).isSymbolicLink()) {
            traverseDirectory(filePath);
        } else {
            const fileModifiedTime = fs.statSync(filePath).mtime.getTime();
            if (!lastFileCreatedTime || fileModifiedTime > lastFileCreatedTime) {
                lastFileCreatedTime = fileModifiedTime;
            }
        }
    });
}

function saveHistory() {
    const now = new Date();
    const history = `${now.getFullYear()}-${(now.getMonth() + 1)
        .toString()
        .padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} ${now
            .getHours()
            .toString()
            .padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now
                .getSeconds()
                .toString()
                .padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}`;

    fs.writeFileSync('history.txt', history);
}

function readHistory() {
    try {
        const history = fs.readFileSync('history.txt', 'utf-8').trim();
        return new Date(history);
    } catch (err) {
        return null;
    }
}

function startPolling() {
    traverseDirectory(DIRECTORY_TO_WATCH);

    let shouldSendEmail = false;

    if (!lastFileCreatedTime) {
        lastFileCreatedTime = new Date().getTime();
    }

    const lastRunTime = readHistory() || new Date();
    const elapsedTime = new Date().getTime() - lastRunTime.getTime();

    if (elapsedTime > ALERT_THRESHOLD) {
        shouldSendEmail = true;
    }

    saveHistory();

    if (shouldSendEmail) {
        //sendEmail();
    }

    setTimeout(startPolling, ALERT_THRESHOLD);
}

startPolling();
