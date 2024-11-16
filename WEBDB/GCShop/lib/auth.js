const { redirect } = require('react-router-dom');
var db = require('./db');
var sanitizeHtml = require('sanitize-html'); 

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
    login: (req, res) => {
        var { name, login, cls } = authIsOwner(req, res);
        var sql1 = `select * from boardtype;`;
        var sql3 = 'select * from code;';

        db.query(sql1 + sql3, (error, results) => {
            var context = {
                who: name,
                login: login,
                body: 'login',
                cls: cls,
                boardtype: results[0],
                codes: results[1] 
            };

            req.app.render('mainFrame', context, (err, html) => {
                res.end(html); 
            });
        });
    },

    login_process: (req, res) => {
        var post = req.body;
        var sntzedLoginid = sanitizeHtml(post.loginid);
        var sntzedPassword = sanitizeHtml(post.password);
        db.query('select count(*) as num from person where loginid = ? and password = ?', 
        [sntzedLoginid, sntzedPassword], (error, results) => {
            if (results[0].num === 1) {
                db.query('select name, class, loginid, grade from person where loginid = ? and password = ?', 
                [sntzedLoginid, sntzedPassword], (error, result) => {
                    req.session.is_logined = true;
                    req.session.loginid = result[0].loginid;
                    req.session.name = result[0].name;
                    req.session.cls = result[0].class;
                    req.session.grade = result[0].grade;
                    res.redirect('/');
                });
            } else {
                req.session.is_logined = false;
                req.session.name = 'Guest';
                req.session.cls = 'NON';
                res.redirect('/');   
            }
        });
    },

    logout_process: (req, res) => {
        req.session.destroy((err) => {
            res.redirect('/');
        });
    },

    // 회원가입 폼 
    register: (req, res) => {
        var { name, login, cls } = authIsOwner(req, res);

        if (login) {
            res.redirect('/');
        }

        var sql1 = `select * from boardtype;`;
        var sql3 = 'select * from code;';

        db.query(sql1 + sql3, (error, results) => { 
            var context = {
                who: name,
                login: login,
                body: 'personCU', //회원가입 폼 or 회원생성 
                cls: cls,
                method: '',
                person: '',
                boardtype: results[0],
                codes: results[1]
            };

            req.app.render('mainFrame', context, (err, html) => {
                res.end(html); 
            });
        });
    },

    // 회원가입 처리 
    register_process: (req, res) => {
        var post = req.body;
        var sLoginid = sanitizeHtml(post.loginid);
        var sPassword = sanitizeHtml(post.password);
        var sName = sanitizeHtml(post.name);
        var sAddress = sanitizeHtml(post.address);
        var sTel = sanitizeHtml(post.tel);
        var sBirth = sanitizeHtml(post.birth);

        // 아이디 중복 확인 
        db.query('select loginid from person', (err, ids) => {
            for (let i = 0; i < ids.length; i++) {
                if (sLoginid === ids[i].loginid) {
                    console.log('아이디가 중복되었습니다.');
                    return res.redirect('/');
                }
            }

            // 회원가입 
            db.query('INSERT INTO person (loginid, password, name, address, tel, birth, class, grade) VALUES (?, ?, ?, ?, ?, ?, "CST", "S")', 
            [sLoginid, sPassword, sName, sAddress, sTel, sBirth], (err, person) => {
                res.redirect('/');
            });
        });
    }
};
