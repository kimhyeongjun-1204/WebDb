const db = require('./db');
var sanitizeHtml = require('sanitize-html'); 

function authIsOwner(req,res){
    var name = 'Guest';
    var login = false;
    var cls = 'NON';
    var loginid= ''; 

    if(req.session.is_logined){ 
        name = req.session.name;
        login = true;
        cls = req.session.cls ;
        loginid = req.session.loginid; 
    }

    return {name,login,cls,loginid}
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
    // 특정 상품 구매 버튼 클릭함 => 결제 창으로 이동
    purchasedetail : (req,res) => {
        var { login, name, cls,loginid } = authIsOwner(req, res);
        
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
                method: 'purchase',
                loginid : loginid  
            };


            res.render('mainFrame', context, (err, html) => {
                    if (err) throw err;
                    res.end(html);
                });

        })


    }, 

    // 결제 처리 
    purchase_process : (req,res) => {
        var post = req.body; 
        var loginid = sanitizeHtml(post.loginid); // 사용자 아이디 
        var mer_id = sanitizeHtml(post.mer_id); // 상품 ID
        var price = sanitizeHtml(post.price); // 상품 가격
        var quantity = sanitizeHtml(post.num); // 구매 수량
        var total = price * quantity;  // 총 가격 
        console.log(loginid); 
        //결제 시간 생성 
        const date = new Date();
        const formattedDate = formatDate(date);

        db.query(`insert into purchase (loginid,mer_id,date,price,point,qty,total,payYN,cancel,refund) values (?,?,?,?,?,?,?,'N','N','N');`, [loginid,mer_id,formattedDate,price,0,quantity,total],(err,results) => {
            if(err) throw err; 
            res.redirect('/purchase') // Purchase List 페이지로 이동 
        })
        
    }, 

    //구매 목록 조회 
    purchaselist : (req,res) => {
        var { login, name, cls,loginid } = authIsOwner(req, res);

        var sql1 = `SELECT purchase.*, product.name,product.image FROM purchase JOIN product ON purchase.mer_id = product.mer_id WHERE purchase.loginid = ?;` // loginid가 loginid와 같은 행만 가져옴      
        var sql2 = `select * from boardtype;`;
        var sql3 = 'select * from code;';

        db.query(sql1+sql2+sql3, [loginid],(err, results) => {
            var context = { 
                who: name,
                login: login,
                cls: cls, 
                body: 'purchase',
                purchases: results[0], 
                boardtype: results[1],
                codes: results[2],
            };


            res.render('mainFrame', context, (err, html) => {
                    if (err) throw err;
                    res.end(html);
                });  
        
        })
        


    }, 
    // 특정 구매 상품 구매 취소 
    cancel : (req,res) => { 
        var purchaseId = req.params.purchaseId; 
        db.query('update purchase set cancel=? where purchase_id=?', ['Y',purchaseId ], (err,results) => {
            if(err) throw err;
            res.redirect('/purchase'); 
        })
    }, 

    /* 여기부터!!!!!!!!!!!!!!!!!!!1 */
    // 장바구니 페이지 
    cart : (req,res) => {
        var { login, name, cls,loginid } = authIsOwner(req, res);
        var sql1 = `select cart.*,product.image,product.name,product.price from cart join product on cart.mer_id = product.mer_id where cart.loginid=?;`
        var sql2 = `select * from boardtype;`;
        var sql3 = 'select * from code;';

        db.query(sql1+sql2+sql3,[loginid],(err, results) => {
            var context = { 
                who: name,
                login: login,
                cls: cls, 
                body: 'cart',
                carts : results[0], // 구매자가 담은 장바구니 목록 
                boardtype: results[1], 
                codes: results[2],
            };


            res.render('mainFrame', context, (err, html) => {
                    if (err) throw err;
                    res.end(html);
                });  
        
        })   
    },

    // 장바구니 담기 
    cart_process : (req,res) => {
        var post = req.body; 
        var loginid = sanitizeHtml(post.loginid); 
        var mer_id = sanitizeHtml(post.mer_id);//상품 조회
        const date = new Date();
        const formattedDate = formatDate(date);

        db.query(`select * from cart where mer_id=${mer_id}`, (err,result) => {
            if(err) throw err; 
            if(result.length > 0) {
                return res.send(`
                    <script>
                        alert("장바구니에 이미 있는 제품입니다.");
                        window.location.href = "/purchase/cart";
                    </script>
                `);
            }else {
                db.query('insert into cart (loginid,mer_id,date) values (?,?,?)',[loginid,mer_id,formattedDate],(err1,result) => {
                    if(err1) throw err1; 
                    res.redirect("/purchase/cart"); 
                })
            }
        })
    }, 

    // 장바구니 체크박스 구매 처리 
    multi_purchase_process : (req,res) => {
        var { login, name, cls,loginid } = authIsOwner(req, res);

        //select_product
        var post = req.body; 
        var select_product = post.select_product; 
        var price = post.price; 
        var cart_id = post.cart_id; 
        var qty = post.qty; 

        //1개일때 => 배열로 변환 
        if (!Array.isArray(select_product)) {
            select_product = [select_product];
            price = [price];
            cart_id = [cart_id];
            qty = [qty];
        }
    
        const date = new Date();
        const formattedDate = formatDate(date);
        
        if(select_product === undefined) { 
            return res.send(`
                <script>
                    alert("구매할 상품을 선택해주세요.");
                    window.location.href = "/purchase/cart";
                </script>
            `)
        }


        for(var i=0;i<select_product.length;i++) {
            var total = price[i] * qty[i]; 
            var sql1 = `insert into purchase (loginid,mer_id,date,price,point,qty,total,payYN,cancel,refund) values (?,?,?,?,?,?,?,?,?,?);`;
            var arr = [loginid, select_product[i], formattedDate, price[i],0,qty[i], total, 'N','N','N',cart_id[i]]; 
            var sql2 = 'delete from cart where cart_id=?;'

            db.query(sql1+sql2, arr,(err,results) => {
                if(err) throw err; 
            })
        }

        res.redirect('/purchase/cart');
    }, 

    // 장바구니 체크박스 삭제 처리
    multi_delete_process : (req,res) => {

    }


} 