const nodemailer = require('nodemailer');

const mailConfig = {
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'abigail85@ethereal.email',
        pass: '75Hfj5mrM4XQB5NK6f'
    }
};

module.exports = nodemailer.createTransport(mailConfig);