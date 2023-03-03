const config = {
    DIRECTORY_TO_WATCH: 'test', // 监控的目录
    ALERT_THRESHOLD: 60 * 60 * 1000, // 1小时
    INTERVAL_TIME: 60 * 1000, // 1分钟
    EMAIL_ACCOUNT: 'gslbexwy@qq.com', // 发件人邮箱
    EMAIL_PASSWORD: 'tehkcadh', // 发件人邮箱密码
    EMAIL_RECIPIENT: ['kvkwsumy@qq.com'], // 收件人邮箱
    EMAIL_TITLE: 'title', // 邮件标题
    EMAIL_CONTENT: 'content', // 邮件内容
    INTERVAL_TIME: 5 * 1000, // 1分钟
    MONITOR_TYPE: ".js" //  监控的文件类型
}


module.exports = config