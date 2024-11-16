var db = require('./db');
var sanitizeHtml = require('sanitize-html');
const path = require('path');

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

function getLoginId(req,res) {
    var loginid = ''; 
    if (req.session.is_logined) { 
        loginid = req.session.loginid; 
    }
    return loginid; 
}

// 날짜 포맷팅 함수
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');  // 월은 0부터 시작하므로 1을 더함
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${year}.${month}.${day} : ${hours}시 ${minutes}분 ${seconds}초`;
}

module.exports = {
    // /type/view
    typeview: (req, res) => {
        var {name, login, cls} = authIsOwner(req,res); 

        db.query('select * from boardtype;SELECT * FROM code;', (err,results) => {
            if(err) throw err; 
            var context = {
                who : name, 
                login : login, 
                cls : cls, 
                body : 'boardtype',
                boardtype : results[0],
                codes: results[1] 
            }

            req.app.render('mainFrame',context, (err, html)=>{
                if(err) console.log(err); 
                res.end(html); 
            })
        })
    },

    // /type/create
    typecreate: (req, res) => {
        var {name, login, cls} = authIsOwner(req,res);

        // Query for boardtype and codes
        db.query('SELECT * FROM boardtype; SELECT * FROM code;', (err, results) => {
            if (err) throw err;
            var context = {
                who: name,
                login: login,
                cls: cls,
                body: 'boardtypeCU',
                boardtype: results[0],
                method: 'create',
                codes: results[1] // Add codes to context
            };
            req.app.render('mainFrame', context, (err, html) => {
                if (err) console.log(err);
                res.end(html);
            });
        });
    },

    // /type/create_process
    typecreate_process: (req, res) => {
        var post = req.body;
        var sTitle = sanitizeHtml(post.title);
        var sDescription = sanitizeHtml(post.description);
        var sWrite_YN = sanitizeHtml(post.write_YN);
        var sRe_YN = sanitizeHtml(post.re_YN);
        var numPerPage = sanitizeHtml(post.numPerPage); 

        db.query(`insert into boardtype(title,description,write_YN,re_YN,numPerPage) values (?,?,?,?,?)`, 
            [sTitle,sDescription,sWrite_YN,sRe_YN,numPerPage],(err,results) => {
                if(err) throw err; 
                res.redirect('/board/type/view'); 
            } 
        )

    },

    // /type/update/:typeId
    typeupdate: (req, res) => {
        var {name, login, cls} = authIsOwner(req, res); 
        var type_id = req.params.typeId; 
    
        var sql1 = `SELECT * FROM boardtype WHERE type_id=?;`; 
        var sql2 = `SELECT * FROM boardtype;`;
        var sql3 = `SELECT * FROM code;`; // Additional query to fetch codes
    
        // Run the queries in sequence to get boardtype and codes
        db.query(sql1 + sql2 + sql3, [type_id], (err, results) => {
            if (err) throw err;
            
            var context = {
                who: name, 
                login: login, 
                cls: cls, 
                body: 'boardtypeCU',
                boardtype_id: results[0], // Specific board type
                boardtype: results[1], // All board types
                method: 'update',
                codes: results[2] // Add codes to context
            };
            
            req.app.render('mainFrame', context, (err, html) => {
                if (err) console.log(err); 
                res.end(html); 
            });
        });
    },
    

    // /type/update_process
    typeupdate_process: (req, res) => {
        var post = req.body;
        var sTitle = sanitizeHtml(post.title);
        var sDescription = sanitizeHtml(post.description);
        var sWrite_YN = sanitizeHtml(post.write_YN);
        var sRe_YN = sanitizeHtml(post.re_YN);
        var numPerPage = sanitizeHtml(post.numPerPage); 
        var type_id = post.type_id; 

        db.query('UPDATE boardtype SET title=?,description=?,write_YN=?,re_YN=?,numPerPage=? WHERE type_id=?', 
            [sTitle,sDescription,sWrite_YN,sRe_YN,numPerPage,type_id], (error, result) => {
            if (error) throw error;
            res.redirect('/board/type/view');
        });
    },

    // /type/delete/:typeId
    typedelete_process: (req, res) => {
        var typeId = req.params.typeId;
        db.query('DELETE FROM boardtype WHERE type_id=?', [typeId], (error, result) => {
            if (error) throw error;
            res.redirect('/board/type/view');
        });
    },
/* ============================================================================        */
    // /view/:typeId/:pNum
    view: (req, res) => {
        var {name, login, cls} = authIsOwner(req, res); 
    
        var typeId = req.params.typeId; // boardtype ID
        var pNum = req.params.pNum; // page number
        
        var sTypeId = sanitizeHtml(typeId); // sanitized boardtype ID
    
        var sql1 = `SELECT * FROM boardtype;`;
        var sql2 = `SELECT * FROM boardtype WHERE type_id=?;`;
        var sql3 = `SELECT COUNT(*) AS total FROM board WHERE type_id = ?;`; // Total post count
        var sql4 = `SELECT * FROM code;`; // Additional query to fetch codes
    
        // Run queries to get board types, total posts, and codes
        db.query(sql1 + sql2 + sql3 + sql4, [sTypeId, sTypeId], (error, results) => {
            if (error) throw error;
    
            var numPerPage = results[1][0].numPerPage; // Posts per page
            var offs = (pNum - 1) * numPerPage; // Offset for pagination
            var totalPages = Math.ceil(results[2][0].total / numPerPage); // Total pages
    
            db.query(`SELECT b.board_id AS board_id, b.title AS title, b.date AS date, p.name AS name
                      FROM board b INNER JOIN person p ON b.loginid = p.loginid 
                      WHERE b.type_id = ? ORDER BY date DESC, board_id DESC LIMIT ? OFFSET ?`,
                     [sTypeId, numPerPage, offs], (err, boards) => {
                
                if (err) throw err;
    
                var context = {
                    who: name, 
                    login: login, 
                    cls: cls, 
                    body: 'board',
                    boardtype: results[0], // All board types
                    boardtype_id: results[1], // Specific boardtype ID
                    boards: boards, // All posts for current boardtype
                    totalPages: totalPages, 
                    pNum: pNum, // Current page number
                    codes: results[3] // Add codes to context
                };
    
                req.app.render('mainFrame', context, (err, html) => {
                    if (err) console.log(err); 
                    res.end(html); 
                });
            });
        });
    },
    
    // /create/:typeId
    create: (req, res) => {
        var {name, login, cls} = authIsOwner(req,res); 
        var loginid = getLoginId(req,res); // 사용자 아이디 
        var typeId = req.params.typeId; // 게시물 유형(boardtype)
        var sTypeId = sanitizeHtml(typeId); 
        
        var sql1 = `select * from boardtype;`
        var sql2 = `select * from boardtype where type_id=?;`
        var sql3 = `SELECT * FROM code;`;

        db.query(sql1+sql2+sql3, [sTypeId], (error, results) => {
            var context = {
                who : name, 
                login : login, 
                cls : cls, 
                loginid : loginid, 
                body : 'boardCRU',
                boardtype : results[0],
                boardtype_id : results[1], // 어떤 게시판인지 
                codes: results[2], 
                method : 'create' 
            }

            req.app.render('mainFrame',context, (err, html)=>{
                if(err) console.log(err); 
                res.end(html); 
            })   

        });
    },

    // /create_process
    create_process: (req, res) => {
        var post = req.body; 
        const type_id = sanitizeHtml(post.type_id); // 게시판 유형 
        const loginid = sanitizeHtml(post.loginid); // 아이디 
        const title = sanitizeHtml(post.title); // 제목
        const content = sanitizeHtml(post.content); // 내용 
        const password = sanitizeHtml(post.password); // 암호 

        //현재 시간 저장 
        const date = new Date();
        const formattedDate = formatDate(date);
        
        db.query('insert into board(type_id,p_id,loginid,password,title,date,content) values(?,0,?,?,?,?,?)',
            [type_id,loginid,password,title,formattedDate,content], (err, results) => {
                if(err) throw err; 
                res.redirect(`/board/view/${type_id}/1`) // 페이지 1 수정 필요!!!
            }
        )
    },

    // /detail/:boardId/:pNum => 특정 게시물 조회 
    detail: (req, res) => {
        var {name, login, cls} = authIsOwner(req,res); 
        var loginid = getLoginId(req,res); 

        var board_id = req.params.boardId;
        var pNum = req.params.pNum; 
        
        var sBoardId = sanitizeHtml(board_id); 
        var sPNum = sanitizeHtml(pNum); 

        var sql1 = `select * from boardtype;`
        var sql2 = `select * from board where board_id=?;` 
        var sql3 = `SELECT * FROM code;`;

        db.query(sql1+sql2+sql3, [sBoardId], (error, results) => {
            if (error) throw error;
            var context = {
                who : name, 
                login : login, 
                cls : cls, 
                loginid: loginid, 
                body : 'boardCRU',
                boardtype : results[0], 
                board : results[1], // 특정 게시물
                pNum : sPNum, // 페이지 수 
                method : 'detail',
                codes: results[2]
            }

            req.app.render('mainFrame',context, (err, html)=>{
                if(err) console.log(err); 
                res.end(html); 
            })   
        });
    },

    // /update/:boardId/:typeId/:pNum
    update: (req, res) => {
        var {name, login, cls} = authIsOwner(req,res); 
        var boardId = req.params.boardId; // 특정 게시물
        var typeId = req.params.typeId; // 게시판 유형(boardtype)
        var pNum = req.params.pNum; 

        var sTypeId = sanitizeHtml(typeId); 
        var sBoardId = sanitizeHtml(boardId); 
        var sPNum = sanitizeHtml(pNum); 

        var sql1 = `select * from boardtype;`
        var sql2 = `select * from boardtype where type_id=?;`
        var sql3 = `select * from board where board_id=?;`
        var sql4 = `SELECT * FROM code;`;

        db.query(sql1+sql2+sql3+sql4, [sTypeId,sBoardId], (err, results) => {
            
            var context = {
                who : name, 
                login : login, 
                cls : cls, 
                body : 'boardCRU',
                boardtype : results[0],
                boardtype_id : results[1], // 어떤 게시판인지  
                board: results[2], 
                method : 'update',
                pNum : sPNum,
                codes: results[3]
            }
    
            req.app.render('mainFrame',context, (err, html)=>{
                if(err) console.log(err); 
                res.end(html); 
            })  

        })
         

    },

    // /update_process
    update_process: (req, res) => {
        var {name, login, cls} = authIsOwner(req,res); 

        var post = req.body; 
        var type_id = sanitizeHtml(post.type_id); // 게시판 종류 
        var title = sanitizeHtml(post.title); //제목 
        var content = sanitizeHtml(post.content); // 내용 
        var board_id = sanitizeHtml(post.board_id); // 게시글 ID
        
        if(cls === 'MNG') {
            db.query('update board set title=?,content=? where board_id=?',[title,content,board_id],
                (err, results) => {
                    if(err) throw err; 
            })
        }else {
            var password = sanitizeHtml(post.password); // 비밀번호 일치 검사 
            db.query('update board set title=?,content=? where board_id=? and password=?', 
                [title,content,board_id,password], (err,results) => {
                    if(err) throw err; 
                    // 결과가 0이면 일치하는 행이 없다는 의미
                    if (results.affectedRows === 0) {
                        return res.send(`
                            <script>
                                alert('비밀번호가 일치하지 않습니다.');
                                window.location.href = '/board/view/${type_id}/1';
                            </script>
                        `);
                    }
            })
        }
        res.redirect(`/board/view/${type_id}/1`);

    },

    // /delete/:boardId/:typeId
    delete_process: (req, res) => {
        var boardId = req.params.boardId;
        var typeId = req.params.typeId;
        var pNum = req.params.pNum; 

        db.query('DELETE FROM board WHERE board_id=?', [boardId], (error, result) => {
            if (error) throw error;
            res.redirect(`/board/view/${typeId}/1`);
        });
    }

};
