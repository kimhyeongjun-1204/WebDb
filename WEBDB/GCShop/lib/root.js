const db = require('./db');
var sanitizeHtml = require('sanitize-html'); 

function authIsOwner(req,res){
    var name = 'Guest';
    var login = false;
    var cls = 'NON';
    if(req.session.is_logined){ 
        name = req.session.name;
        login = true;
        cls = req.session.cls ;
    }
    return {name,login,cls}
}

function getLoginId(req,res) {
    var loginid = ''; 
    if (req.session.is_logined) { 
        loginid = req.session.loginid; 
    }
    return loginid; 
}

module.exports = {
    home : (req,res)=>{ 
        var {login, name, cls} = authIsOwner(req,res)
        var sql1 = `select * from boardtype;`;
        var sql2 = `select * from product;`
        var sql3 = 'select * from code;'

        db.query(sql1 + sql2+sql3,(error,results)=>{
            var context = { 
                who : name,
                login: login,
                body : 'product.ejs',
                cls: cls, 
                products : results[1], 
                type: 'root',
                boardtype: results[0],
                codes: results[2]  
            };

            res.render('mainFrame',context,(err,html)=>{
                res.end(html)
            }); //render end
        }); //query end
 
    },

    // 코드의 main,sub 아이디가 일치하는 상품만을 조회 
    categoryview: (req, res) => { 
        var { login, name, cls } = authIsOwner(req, res);
        var main_id = req.params.main_id; // main_id와 sub_id와 일치하는 상품만을 조회
        var sub_id = req.params.sub_id;
    
        var sql1 = `select * from boardtype;`;
        var sql2 = 'select * from product where main_id = ? and sub_id = ?;';
        var sql3 = 'select * from code;';
    
        db.query(sql1 + sql2 + sql3, [main_id, sub_id], (err, results) => {
            if (err) throw err;
    
            var context = { 
                who: name,
                login: login,
                body: 'product.ejs',
                cls: cls, 
                products: results[1],
                type: 'root',
                boardtype: results[0],
                codes: results[2]
            };
    
            res.render('mainFrame', context, (err, html) => {
                if (err) throw err;
                res.end(html);
            });
        });
    },

    search : (req,res) => {
        var { login, name, cls } = authIsOwner(req, res);
        var body = req.body; 

        var sql1 = `select * from boardtype;`;
        var sql2 = 'select * from code;';
        var sql3 = `select * from product
                where name like '%${body.search}%' or
                brand like '%${body.search}%' or
                supplier like '%${body.search}%';`

        db.query(sql1 + sql2+sql3,(err, results) => {

            var context = { 
                who: name,
                login: login,
                body: 'product.ejs',
                cls: cls, 
                products: results[2],
                type: 'root',
                boardtype: results[0],
                codes: results[1]
            };

            res.render('mainFrame', context, (err, html) => {
                if (err) throw err;
                res.end(html);
            });
        }) 
    },

    detail: (req,res) => {
        var { login, name, cls } = authIsOwner(req, res);
        var loginid = getLoginId(req,res); 

        var merId = req.params.merId; 

        var sql1 = `select * from product where mer_id=${merId};`
        var sql2 = `select * from boardtype;`;
        var sql3 = 'select * from code;';

        db.query(sql1+sql2+sql3, (err, results) => {
            var context = { 
                who: name,
                login: login,
                body: 'productDetail',
                cls: cls, 
                product: results[0][0], // 조회한 특정 상품 
                boardtype: results[1],
                codes: results[2],
                method: 'detail',
                loginid : loginid  
            };


            res.render('mainFrame', context, (err, html) => {
                    if (err) throw err;
                    res.end(html);
                });

        })
    },

    
    

}