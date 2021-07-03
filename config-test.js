
module.exports = {
  host: 'https://example.com',
  db: {
    host: '127.0.0.1',
    port: 3123,
    name: 'teachagogo_dev_test',
    username: 'root',
    password: 'toor',
  },
  email: {
    defaultFromAddress: 'support@example.com',
  },
  nodemailer: {
    host: '',
    port: 465,
    secure: true,
    timeout: 30,
    auth: {
      user: '',
      pass: '',
    },
  },
  imapFlow: {
    host: '',
    port: 993,
    secure: true,
    auth: {
      user: '',
      pass: ''
    }
  },
};
