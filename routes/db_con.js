var mysql = require("mysql2/promise");
var config = require("./db_info").real;

module.exports = function() {
  return {
    init: async function() {
      return await mysql.createConnection({
        host: config.host,
        port: config.port,
        user: config.user,
        password: config.password,
        database: config.database
      });
    },

    test_open: async function(con) {
      await con.connect(function(err) {
        if (err) {
          console.error("mysql connection error : " + err);
        } else {
          console.info("mysql is connected successfully.");
        }
      });
    }
  };
};
