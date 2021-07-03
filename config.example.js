
module.exports = {
  host: 'https://example.com',
  db: {
    host: '',
    port: '',
    name: '',
    username: '',
    password: '',
  },
  email: {
    defaultFromAddress: 'support@example.com',
  },
  nodemailer: {
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    timeout: 30,
    auth: {
      user: 'admin@example.com',
      pass: 'test1234',
    },
  },
  imapFlow: {
    host: 'mail.example.com',
    port: 993,
    secure: true,
    auth: {
      user: `testing@example.com`,
      pass: 'test1234'
    }
  },
};
