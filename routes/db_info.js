module.exports = (function () {
    return {
      local: { // localhost
        host: 'localhost',
        port: '5306',
        user: 'nfcstar',
        password: 'nfcstar',
        database: 'nfcstar'
      },
      real: { // real server db info
        host: '',
        port: '',
        user: '',
        password: '',
        database: ''
      },
      dev: { // dev server db info
        host: '',
        port: '',
        user: '',
        password: '',
        database: ''
      }
    }
  })();