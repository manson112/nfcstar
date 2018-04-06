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
        host: 'nfcdbinstance.c81uecsarmxy.ap-northeast-2.rds.amazonaws.com',
        port: '5306',
        user: 'root',
        password: 'rootroot',
        database: 'nfcstar'
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