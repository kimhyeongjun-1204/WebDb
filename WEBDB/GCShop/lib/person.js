var db = require('./db');
var sanitizeHtml = require('sanitize-html'); 
const path = require('path');
const { redirect } = require('react-router-dom');

function authIsOwner(req, res) {
    var name = 'Guest';
    var login = false;
    var cls = 'NON';
    if (req.session.is_logined) { 
        name = req.session.name;
        login = true;
        cls = req.session.cls;
    }
    return { name, login, cls };
}

module.exports = {
    // 조회 기능
    view: (req, res) => {
        var {name, login, cls} = authIsOwner(req,res); 

        var sql1 = `select * from boardtype;`;
        var sql2 = `select * from person;`; 
        var sql3 = 'select * from code;';
        db.query(sql1 + sql2+sql3, (err,results) => {
            if(err) throw err; 
            var context = {
                who : name, 
                login : login, 
                cls : cls, 
                body : 'person',
                person : results[1], 
                boardtype: results[0],
                codes: results[2] 
            }

            req.app.render('mainFrame',context, (err, html)=>{
                if(err) console.log(err); 
                res.end(html); 
            })
        })


    },
    // 생성 폼 표시 기능
    create: (req, res) => {
        var {name, login, cls} = authIsOwner(req,res); 
        var sql1 = `select * from boardtype;`;
        var sql2 = 'select * from code;';
        
        db.query(sql1+sql2, (err, results) => {
            var context = {
                who : name, 
                login : login, 
                cls : cls, 
                body : 'personCu',
                method: 'create',
                person: '',
                boardtype: results[0],
                codes: results[1] 

            }

            req.app.render('mainFrame',context, (err, html)=>{
                if(err) console.log(err); 
                res.end(html); 
            })
        })
    },
    // 생성 처리 기능
    create_process: (req, res) => {
        var post = req.body;
        var sLoginid = sanitizeHtml(post.loginid);
        var sPassword = sanitizeHtml(post.password);
        var sName = sanitizeHtml(post.name);
        var sAddress = sanitizeHtml(post.address);
        var sTel = sanitizeHtml(post.tel);
        var sBirth = sanitizeHtml(post.birth);
        var sclass = sanitizeHtml(post.class); 
        var sgrade = sanitizeHtml(post.grade); 

        db.query('insert into person values (?,?,?,?,?,?,?,?)', [sLoginid, sPassword, sName, sAddress, sTel, sBirth, sclass, sgrade],(err,person) => {
            if(err) throw err; 
            res.redirect('/person/view'); 
        })
    },
    // 수정 폼 표시 기능
    update: (req, res) => {
        var {name, login, cls} = authIsOwner(req,res); 
        var loginid = req.params.loginId; 
        var sql1 = `select * from boardtype;`;
        var sql2 = `select * from person where loginid = ?;`;
        var sql3 = 'select * from code;';

        db.query(sql1 + sql2+sql3,[loginid], (err,results) => {
            if(err) throw err; 
            var context = {
                who : name, 
                login : login, 
                cls : cls, 
                body : 'personCu',
                method: 'update',
                person: results[1],
                boardtype: results[0],
                codes: results[2] 
            }
            
            req.app.render('mainFrame',context, (err, html)=>{
                if(err) console.log(err); 
                res.end(html); 
            })    
        })
        
    },
    // 수정 처리 기능
    update_process: (req, res) => {
        var post = req.body;
        var oLoginid = sanitizeHtml(post.oLoginid); // 기존 아이디 
        var sLoginid = sanitizeHtml(post.loginid); // 변경되는 아이디 
        var sPassword = sanitizeHtml(post.password);
        var sName = sanitizeHtml(post.name);
        var sAddress = sanitizeHtml(post.address);
        var sTel = sanitizeHtml(post.tel);
        var sBirth = sanitizeHtml(post.birth);
        var sclass = sanitizeHtml(post.class); 
        var sgrade = sanitizeHtml(post.grade); 
        
        db.query('update person set loginid=?,password = ?, name = ?, address = ?, tel = ?, birth = ?, class = ?, grade = ? WHERE loginid = ?',
            [sLoginid,sPassword, sName, sAddress, sTel, sBirth, sclass, sgrade, oLoginid], (err,results) => {
                if(err) throw err; 
                res.redirect('/person/view'); 
            }); 
    },

    // 삭제 처리 기능
    delete_process: (req, res) => {
        var loginid = req.params.loginId; 
        db.query('delete from person where loginid=?', [loginid], (err, results) => {
            if(err) throw err; 
            res.redirect('/person/view'); 
        })
    }
};
