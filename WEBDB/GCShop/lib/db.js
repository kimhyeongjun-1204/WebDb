var mysql=require('mysql');

var db=mysql.createConnection({
  host :'localhost', //도메인 127.0.0.1 
  user :'root',
  password :'1204',
  database :'mydb',
  multipleStatements: true
})

db.connect();
module.exports=db;