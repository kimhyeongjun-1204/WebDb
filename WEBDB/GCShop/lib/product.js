const { redirect } = require('react-router-dom');
var db = require('./db');
var sanitizeHtml = require('sanitize-html'); 
const path = require('path');

 function authIsOwner(req,res){
    var name = 'Guest';
    var login = false;
    var cls = 'NON';
     if (req.session.is_logined) { 
        name = req.session.name;
        login = true;
        cls = req.session.cls;
    }
    
    return {name,login,cls}
} 
// product.js

module.exports = {
    view: (req, res) => {
        var {name, login, cls} = authIsOwner(req,res);
        var sql1 = `select * from boardtype;`;
        var sql2 = `select * from product;`;
        var sql3 = 'select * from code;';
        
        db.query(sql1+sql2+sql3, (err,results) => {
            var context = {
                who : name,
                login : login,
                body : 'product',
                cls : cls,
                products: results[1],
                type: 'product', 
                boardtype: results[0],
                codes: results[2]  
            };
            

            req.app.render('mainFrame',context, (err, html)=>{
                if(err) console.log(err); 
                res.end(html); 
            }) 
        })


    },

    create: (req, res) => {
        var {name, login, cls} = authIsOwner(req,res);

        var sql1 = `select * from boardtype;`;
        var sql2 = `select * from code;`;

        db.query(sql1 + sql2, (err, results) => {
            var context = {
                who : name,
                login : login,
                body : 'productCU',
                cls : cls,
                codes: results[1], // 코드 데이터 넘겨주기 
                method: 'create', // 메소드 : 입력 수정 
                product: '',
                boardtype: results[0],
            };
            
            req.app.render('mainFrame',context, (err, html)=>{
                if(err) console.log(err); 
                res.end(html); 
            })
        })

        
    },

    create_process: (req, res) => {
        var post = req.body; 
        var category = sanitizeHtml(post.category);
        var name = sanitizeHtml(post.name);
        var price = sanitizeHtml(post.price);
        var stock = sanitizeHtml(post.stock);
        var brand = sanitizeHtml(post.brand);
        var supplier = sanitizeHtml(post.supplier);
        var sale_yn = sanitizeHtml(post.sale_yn);
        var sale_price = sanitizeHtml(post.sale_price);
        // 파일 경로 저장함 
        var image = req.file ? (path.join('image', req.file.filename)) : null;

        const main_id = category.slice(0, 4); // 첫 4자리: main_id
        const sub_id = category.slice(4, 8);
        console.log(main_id, sub_id); 

        db.query('insert into product (main_id,sub_id,name,price,stock,brand,supplier,image,sale_yn,sale_price) values (?,?,?,?,?,?,?,?,?,?)', 
            [main_id,sub_id,name,price,stock,brand,supplier,image,sale_yn,sale_price],(err, product) => {
                if(err) console.log(err); 
                res.redirect('/product/view'); 
        })
    },

    update: (req, res) => {
        var {name, login, cls} = authIsOwner(req,res);
        var merId = req.params.merId; 
        var sql1 = 'select * from code;';
        var sql2 = 'select * from product where mer_id=?;';
        var sql3 = `select * from boardtype;`;
        
        db.query(sql1 + sql2+sql3,[merId],(err, results) => {
            var context = {
                who : name,
                login : login,
                body : 'productCU',
                cls : cls,
                codes: results[0], // 코드 데이터 넘겨주기 
                method: 'update', // 메소드 : 입력 수정 
                product: results[1],
                boardtype: results[2] 
            };

            req.app.render('mainFrame',context, (err, html)=>{
                if(err) console.log(err); 
                res.end(html); 
            })
        })

       
    },

    update_process: (req, res) => {
        var post = req.body; 
        var category = sanitizeHtml(post.category);
        var name = sanitizeHtml(post.name);
        var price = sanitizeHtml(post.price);
        var stock = sanitizeHtml(post.stock);
        var brand = sanitizeHtml(post.brand);
        var supplier = sanitizeHtml(post.supplier);
        var sale_yn = sanitizeHtml(post.sale_yn);
        var sale_price = sanitizeHtml(post.sale_price);
        var mer_id = sanitizeHtml(post.mer_id) // 기본키  
        console.log(post); 
        var image = req.file ? (path.join('image', req.file.filename)) : null;

        const main_id = category.slice(0, 4); // 첫 4자리: main_id
        const sub_id = category.slice(4, 8);

        db.query('update product set main_id=?, sub_id=?,name=?,price=?,stock=?,brand=?,supplier=?,image=?,sale_yn=?,sale_price=? where mer_id=?',
            [main_id,sub_id,name,price,stock,brand,supplier,image,sale_yn,sale_price,mer_id],(err, product) => {
                if(err) console.log(err); 
                res.redirect('/product/view'); 
            }
        )
    },

    delete_process: (req, res) => {
        var merId = req.params.merId; 

        db.query('delete from product where mer_id=?',[merId], (err,product) => {
            if(err) console.log(err); 
            res.redirect('/product/view'); 
        })

    }
};
