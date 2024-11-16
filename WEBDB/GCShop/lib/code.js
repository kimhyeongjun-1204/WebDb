const { redirect } = require('react-router-dom');
var db = require('./db');
 var sanitizeHtml = require('sanitize-html'); 

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

 module.exports = {
    view : (req,res) => {
        var {name, login, cls} = authIsOwner(req,res);
        var sql1 = `select * from boardtype;`;
        var sql2 = `select * from code;`; 

        db.query(sql1 + sql2, (err, results) => {

            var context = {
                who : name,
                login : login,
                body : 'code',
                cls : cls,
                codes: results[1],
                boardtype: results[0]
            };
            

            req.app.render('mainFrame',context, (err, html)=>{
                if(err) console.log(err); 
                res.end(html); 
            }) 

        })
    },

    create : (req,res) => {
        var {name, login, cls} = authIsOwner(req,res);
        var main = '', sub = '', start = '', end = '',main_name='',sub_name='';
        var sql1 = `select * from boardtype;`;
        var sql2 = `select * from code;`; 
        
        db.query(sql1+sql2, (err, results) => {

            var context = {
                who : name,
                login : login,
                body : 'codeCU',
                title: '코드 입력',
                cls : cls,
                main : main,
                sub: sub, 
                start: start, 
                end: end,
                main_name: main_name,
                sub_name: sub_name, 
                boardtype: results[0],
                codes: results[1] 
            };

            req.app.render('mainFrame',context, (err, html)=>{
                if(err) console.log(err); 
                res.end(html); 
            }) 
        }); 
    }, 

    create_process: (req,res) => {
        var post = req.body; 
        var sMainId = sanitizeHtml(post.main_id);
        var sSubId = sanitizeHtml(post.sub_id);
        var sMainName = sanitizeHtml(post.main_name);
        var sSubName = sanitizeHtml(post.sub_name);
        var sStart = sanitizeHtml(post.start);
        var sEnd = sanitizeHtml(post.end);

        db.query('insert into code(main_id, sub_id, main_name, sub_name, start, end) values (?,?,?,?,?,?)',
            [sMainId, sSubId, sMainName, sSubName, sStart, sEnd], (err,code) => {
                if(err) console.log(err); 
                res.redirect('/code/view'); 
            })
    },

    update : (req,res) => {
        var {name, login, cls} = authIsOwner(req,res);
        const { main, sub, start, end } = req.params;

        var sql1 = `select * from boardtype;`;
        var sql2 = `select main_name, sub_name from code where main_id=? AND sub_id=? AND start=?;`; 
        var sql3 = `select * from code;`; 

        db.query(sql1 + sql2+sql3,[main,sub,start] ,(err, results) => {
            var main_name = results[1][0].main_name; 
            var sub_name = results[1][0].sub_name; 

            var context = {
                who : name,
                login : login,
                body : 'codeCU',
                title: '코드 수정',
                cls : cls,
                main : main,
                sub: sub, 
                start: start, 
                end: end,
                main_name : main_name,
                sub_name: sub_name,
                boardtype: results[0],
                codes : results[2]
            };
            
            req.app.render('mainFrame',context, (err, html)=>{
                if(err) console.log(err); 
                res.end(html); 
            }) 
        })
        
    }, 

    update_process: (req,res) => {
        var post = req.body; 
        var sMainId = sanitizeHtml(post.main_id);
        var sSubId = sanitizeHtml(post.sub_id);
        var sMainName = sanitizeHtml(post.main_name);
        var sSubName = sanitizeHtml(post.sub_name);
        var sStart = sanitizeHtml(post.start);
        var sEnd = sanitizeHtml(post.end);
        
        db.query('update code set main_name=?, sub_name=?, end=? where main_id=? and sub_id=? and start=?', 
            [sMainName,sSubName,sEnd,sMainId,sSubId,sStart],(err,code) => {
                if(err) console.log(err); 
                res.redirect('/code/view');
            }
        )

    }, 

    delete_process: (req,res) => {
        var {name, login, cls} = authIsOwner(req,res);
        const { main, sub, start, end } = req.params;

        db.query('delete from code where main_id=? and sub_id=? and start=?', [main,sub,start], (err, code) => {
            res.redirect('/code/view'); 
        })
    }






 }