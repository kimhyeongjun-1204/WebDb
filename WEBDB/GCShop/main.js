//express와 views 정의
const express = require('express') ;
const app = express();

app.set('views',__dirname + '/views');
app.set('view engine','ejs');
//정적 파일 경로 설정 
app.use(express.static('public'));
 //사용자 정의 모듈

var rootRouter = require('./router/rootRouter');
var authRouter = require('./router/authRouter');
var codeRouter = require('./router/codeRouter'); 
var productRouter = require('./router/productRouter'); 
var personRouter = require('./router/personRouter')
var boardRouter = require('./router/boardRouter'); 
var purchaseRouter = require('./router/purchaseRouter'); 

var session = require('express-session');
var MySqlStore = require('express-mysql-session')(session);
var bodyParser = require('body-parser');    

// 과제 제출 이후 내 db 정보로 수정해야됨
var options = {
    host     : 'localhost',
    user     : 'root',
    password : '1204',
    database : 'mydb',
    multipleStatements: true
};
 
var sessionStore =new MySqlStore(options);
app.use(session({
    secret : 'keyboard cat',
    resave : false,
    saveUninitialized : true,
    store : sessionStore
}));
 
app.use(bodyParser.urlencoded({extended: false }));


app.use('/',rootRouter);
app.use('/auth',authRouter);
app.use('/code', codeRouter); 
app.use('/product', productRouter); 
app.use('/person', personRouter); 
app.use('/board', boardRouter); 
app.use('/purchase', purchaseRouter); 

app.get('/favicon.ico', (req,res)=>res.writeHead(404));
app.listen(3000, ()=>console.log('Example app listening on port 3000'));