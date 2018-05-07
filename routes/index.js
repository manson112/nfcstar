var express = require('express');

//
var socketApi = require('../socketApi');
var io = socketApi.io;

//underscore
var _ = require('underscore');

//multipart
var formidable = require('formidable');

//로그인 
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var flash = require('connect-flash');

//라우터 변수
var router = express.Router();

//fcm
var admin = require("firebase-admin");
var serviceAccount = require("../key/nfcstar-e7670-firebase-adminsdk-v3vfz-2baefe1916.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://nfcstar-e7670.firebaseio.com"
});


//DB
var create = require('./createquery');
var mysql_dbc = require('./db_con')();
var connection = mysql_dbc.init();

mysql_dbc.test_open(connection);


//로그인 설정
passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (user, done) {
    done(null, user);
});

passport.use('login', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
}, function (req, username, password, done) {

    process.nextTick(function () {
        connection.query("SELECT * FROM POSMST WHERE POSID='" + username + "';", function (err, rows) {
            var user = rows[0];
            if (err) {
                return done(err);
            }
            if (!user) {
                return done(null, false, { ResultCode: '200', msg: 'Incorrect username.' });
            }
            if (user.POSPW !== password) {
                return done(null, false, { ResultCode: '200', msg: 'Incorrect password.' });
            }
            return done(null, user);
        });
    })
}));

//Image upload
const multer = require('multer');
var imageFilter = function (req, file, cb) {
    // accept image only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/images/');
    },
    filename: function (req, file, cb) {
        cb(null, "_" + new Date().valueOf() + file.originalname);
    }
});
var upload = multer({ storage: storage, fileFilter: imageFilter });


format = function date2str(x, y) {
    var z = {
        M: x.getMonth() + 1,
        d: x.getDate(),
        h: x.getHours(),
        m: x.getMinutes(),
        s: x.getSeconds()
    };
    y = y.replace(/(M+|d+|h+|m+|s+)/g, function(v) {
        return ((v.length > 1 ? "0" : "") + eval('z.' + v.slice(-1))).slice(-2)
    });

    return y.replace(/(y+)/g, function(v) {
        return x.getFullYear().toString().slice(-v.length)
    });
}

format_next = function date2str(x, y) {
    var z = {
        M: x.getMonth() + 2,
        d: x.getDate(),
        h: x.getHours(),
        m: x.getMinutes(),
        s: x.getSeconds()
    };
    y = y.replace(/(M+|d+|h+|m+|s+)/g, function(v) {
        return ((v.length > 1 ? "0" : "") + eval('z.' + v.slice(-1))).slice(-2)
    });

    return y.replace(/(y+)/g, function(v) {
        return x.getFullYear().toString().slice(-v.length)
    });
}

//전체 페이지 목록
var pages = [{ url: '/addstore', name: '가게 등록(업체, 관리자)' },
            { url: '/addadmin', name: '관리자 등록' },
            { url: '/adduser', name: '회원 등록' },
            { url: '/addfloor', name: "층 등록(로그인 필요)" },
            { url: '/addtable', name: "테이블 등록(로그인 필요)" },
            { url: '/addcategory', name: "카테고리 등록(로그인 필요)" },
            { url: '/addproduct', name: "제품 등록(로그인 필요)" },
            { url: '/addoption', name: "옵션 등록(로그인 필요)" },
            { url: '/addset', name: "세트 등록(로그인 필요)" },
            { url: '/addevent', name: "이벤트 등록(로그인 필요)" },
            { url: '/addcall', name: "호출 등록(로그인 필요)" },
            { url: '/addncall2url', name: "NCALL2 동영상 추가"},
            { url: '/addvan', name: "밴 등록(업체, 관리자)" },
            { url: '/addpos', name: "포스 등록(업체, 관리자)" },
            { url: '/addcpn', name: "업체 등록(관리자)" },
            { url: '/dbcheck', name: "DB 확인" },
            { url: '/init', name: "테이블 생성" },
            { url: '/login', name: "로그인" }
        ];

/* GET home page. */
router.get('/', function (req, res, next) {
    var user = "";
    if (req.isAuthenticated()) {
        user = req.user.POSID;
        let posid = req.user.ID;
        let date = new Date();
        let dat = date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate(); 
        res.render('index', { title: 'NFC STAR', STOSEQ: req.user.STOSEQ, USER:user, DATE:dat, POSID:posid});
    } else {
        res.redirect('/login');
    }
});


//GET pages
router.get('/dbcheck', function (req, res, next) {

    var query = "show tables;";
    var tables = [];
    var total = [];
    connection.query(query, function (err, rows, fields) {
        if (err) { console.error(err);}
        else {
            for (var i = 0; i < rows.length; i++) {
                tables.push(rows[i].Tables_in_nfcstar);
            }
            for (var j = 0; j < tables.length; j++) {
                var tmpquery = "select * from " + tables[j] + ";";
                connection.query(tmpquery, function (err, rows, fields) {
                    if (err) { console.error(err); }
                    var tbl = new Object();

                    tbl.name = fields[0].table;
                    tbl.row = [];

                    for (var h = 0; h < rows.length; h++) {
                        var tmprow = [];
                        var r = JSON.stringify(rows[h]);
                        var j = JSON.parse(r);
                        for (var k in j) {
                            tmprow.push(j[k]);
                        }
                        tbl.row.push(tmprow);
                    }
                    tbl.col = [];
                    connection.query("SHOW COLUMNS FROM " + fields[0].table, function (err, rows, fields) {
                        for (var c = 0; c < rows.length; c++) {
                            tbl.col.push(rows[c].Field);
                        }
                    });

                    total.push(tbl);
                });
            }
            setTimeout(function () {
                res.render('dbcheck', { title: 'Database Check', tables: total });
            }, 1000);
        }
    });

});

router.get('/addstore', function (req, res, next) {
    res.render('addstore', { title: 'Add Store' });
});

router.get('/adduser', function (req, res, next) {
    res.render('adduser', { title: 'Add User' });
});

router.get('/addvan', function (req, res, next) {
    var query = "select ID, STONAM from STOMST;";
    var stoinfos = [];

    var init = new Object();
    init.STOSEQ = 0;
    init.STONAM = "-- 선택 --";
    stoinfos.push(init);

    connection.query(query, function (err, rows, fields) {
        if (err) {
            { console.error(err); }
        } else {
            for (var i = 0; i < rows.length; i++) {
                var sto = new Object();
                sto.STOSEQ = rows[i].ID;
                sto.STONAM = rows[i].STONAM;
                stoinfos.push(sto);
            }
            console.log(stoinfos);
            res.render('addvan', { title: 'Add Van', stoinfos: stoinfos });
        }
    });
});

router.get('/addpos', function (req, res, next) {
    var query = "select ID, STONAM from STOMST;";
    var stoinfos = [];

    var init = new Object();
    init.STOSEQ = 0;
    init.STONAM = "-- 선택 --";
    stoinfos.push(init);

    connection.query(query, function (err, rows, fields) {
        if (err) { console.error(err); }
        else {
            console.log(rows);
            for (var i = 0; i < rows.length; i++) {
                var sto = new Object();
                sto.STOSEQ = rows[i].ID;
                sto.STONAM = rows[i].STONAM;
                stoinfos.push(sto);
            }
            res.render('addpos', { title: 'Add Pos', stoinfos: stoinfos });
        }
    });
});
router.get('/addadmin', function (req, res, next) {
    res.render('addadmin', { title: 'Add Admin' });
});

router.get('/addcpn', function (req, res, next) {
    res.render('addcpn', { title: 'Add CPN' });
});

router.get('/login', function (req, res, next) {
    console.log(req.flash('error'));
    if (req.user) {
        res.send('already login');
    } else {
        res.render('login', {title: 'NFCSTAR'});
    }
});
router.post('/login', passport.authenticate('login', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}));
router.get('/logout', function(req, res, next){
    req.logout();
    req.session.save(function(){
        res.redirect('/login');
    });
});
router.get('/count', function(req, res, next){
    if(req.session.count) {
        req.session.count++;
    } else {
        req.session.count = 1;
    }

    res.send('count: ' + req.session.count);

});


router.get('/addfloor', function (req, res, next) {
    if (req.isAuthenticated()) {
        var stoinfos = [];
        connection.query("SELECT STONAM FROM STOMST WHERE ID=" + req.user.STOSEQ + ";", function (err, rows, fields) {
            if (err) {
                console.error(err);
            } else {
                if (rows.length == 0) {
                    var obj = new Object;
                    obj.STOSEQ = 0;
                    obj.STONAM = "가게를 등록해주세요";
                    stoinfos.push(obj);
                } else {
                    var obj = new Object;
                    obj.STOSEQ = req.user.STOSEQ;
                    obj.STONAM = rows[0].STONAM;
                    stoinfos.push(obj);
                }
                res.render('addfloor', { title: 'Add Floor', stoinfos: stoinfos });
            }
        });
    } else {
        res.redirect('/login');
    }

});
router.get('/addfloor_admin', function (req, res, next) {
    var query = "select ID, STONAM from STOMST;";
    var stoinfos = [];

    var init = new Object();
    init.STOSEQ = 0;
    init.STONAM = "-- 선택 --";
    stoinfos.push(init);

    connection.query(query, function (err, rows, fields) {
        if (err) {
            console.error(err);
        } else {
            for (var i = 0; i < rows.length; i++) {
                var sto = new Object();
                sto.STOSEQ = rows[i].ID;
                sto.STONAM = rows[i].STONAM;
                stoinfos.push(sto);
            }
            console.log(stoinfos);
            res.render('addfloor', { title: 'Add Floor', stoinfos: stoinfos });
        }
    });
});

router.get('/addtable', function (req, res, next) {
    if (req.isAuthenticated()) {
        var STOSEQ = req.user.STOSEQ;
        var query = "select ID, FLRNAM from STOFLR where STOSEQ="+STOSEQ+" order by ORDNUM;";
        var flrinfos = [];

        var init = new Object();
        init.FLRSEQ = 0;
        init.FLRNAM = "-- 선택 --";
        flrinfos.push(init);
        connection.query(query, function (err, rows, fields) {
            if (err) {
                console.error(err)
            } else {
                for (var i = 0; i < rows.length; i++) {
                    var flr = new Object();
                    flr.FLRSEQ = rows[i].ID;
                    flr.FLRNAM = rows[i].FLRNAM;
                    flrinfos.push(flr);
                }
                res.render('addtable', { title: stoseq + ' Add Table', flrinfos: flrinfos, stoseq: STOSEQ });
            }
        });
    } else {
        res.redirect('/login');
    }
});
router.get('/addtable/:stoseq', function (req, res, next) {
    var STOSEQ = req.params.stoseq;
    var query = "select ID, FLRNAM from STOFLR where STOSEQ="+STOSEQ+" order by ORDNUM;";
    var flrinfos = [];

    var init = new Object();
    init.FLRSEQ = 0;
    init.FLRNAM = "-- 선택 --";
    flrinfos.push(init);
    connection.query(query, function (err, rows, fields) {
        if (err) {
            console.error(err);
        } else {
            for (var i = 0; i < rows.length; i++) {
                var flr = new Object();
                flr.FLRSEQ = rows[i].ID;
                flr.FLRNAM = rows[i].FLRNAM;
                flrinfos.push(flr);
            }
            res.render('addtable', { title: stoseq + ' Add Table', flrinfos: flrinfos, stoseq: STOSEQ });
        }
    });
});


router.get('/addproduct', function (req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.redirect('/login');
    }
}, function (req, res, next) {
    var STOSEQ = req.user.STOSEQ;
    var query = "select ID, CATNAM, CATNUM from CATMST where STOSEQ="+STOSEQ+" order by ORDNUM;";
    var category = [];

    connection.query(query, function (err, rows, fields) {
        if (err) {
            console.error(err);
        } else {
            if (rows.length == 0) {
                var obj = new Object;
                obj.CATSEQ = 0;
                obj.CATNAM = "카테고리를 등록해주세요";
                obj.CATNUM = 0;
                category.push(obj);
            } else {
                for (var i = 0; i < rows.length; i++) {
                    var obj = new Object;
                    obj.CATSEQ = rows[i].ID;
                    obj.CATNAM = rows[i].CATNAM;
                    obj.CATNUM = rows[i].CATNUM;
                    category.push(obj);
                }
            }
            var query = "select ID, CATNAM from OPTCAT where STOSEQ="+STOSEQ+" order by ORDNUM;";
            var optcat = [];

            connection.query(query, function (err, rows, fields) {
                if (err) console.error(err);
                if (rows.length == 0) {
                    var obj = new Object;
                    obj.OPTCATSEQ = 0;
                    obj.CATNAM = "옵션을 등록해주세요";
                    optcat.push(obj);
                } else {
                    let init_option = new Object;
                    init_option.OPTCATSEQ = 0;
                    init_option.CATNAM = "";
                    optcat.push(init_option);
                    for (var i = 0; i < rows.length; i++) {
                        let obj = new Object;
                        obj.OPTCATSEQ = rows[i].ID;
                        obj.CATNAM = rows[i].CATNAM;
                        optcat.push(obj);
                    }
                }
                res.render('addproduct', { title: 'Add Product', categories: category, optioncategories: optcat });
            });
        }
    });
});

router.get('/addcategory', function (req, res, next) {
    if (req.isAuthenticated()) {
        res.render('addcategory', { title: 'Add Category' });
    } else {
        res.redirect('/login');
    }
});

router.get('/addoption', function (req, res, next) {
    if (req.isAuthenticated()) {
        res.render('addoption', { title: 'Add Option' });
    } else {
        res.redirect('/login');
    }
});

router.get('/addset', function (req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.redirect('/login');
    }
}, function (req, res, next) {
    let STOSEQ = req.user.STOSEQ;
    let products = [];
    let query = "select ID, PRDNAM, PRDCST from PRDMST where STOSEQ="+STOSEQ+" ;";
    connection.query(query, function (err, rows, fields) {
        if (err) {
            console.error(err);
        } else {
            if (rows.length == 0) {
                var obj = new Object;
                obj.PRDSEQ = 0;
                obj.PRDNAM = "등록된 제품이 없습니다";
                obj.PRDCST = 0;
                products.push(obj);
            } else {
                for (var i = 0; i < rows.length; i++) {
                    var obj = new Object;
                    obj.PRDSEQ = rows[i].ID;
                    obj.PRDNAM = rows[i].PRDNAM;
                    obj.PRDCST = rows[i].PRDCST;
                    products.push(obj);
                }
            }
            res.render('addset', { title: 'Add Set', products: products });
        }
        
    });

});

router.get('/addevent', function (req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.redirect('/login');
    }
}, function (req, res, next) {
    var STOSEQ = req.user.STOSEQ;
    var products = [];
    var query = "select ID, PRDNAM from PRDMST where STOSEQ=" + STOSEQ + ";";

    var tmp = new Object;
    tmp.PRDSEQ = 0;
    tmp.PRDNAM = "이동할 제품";
    products.push(tmp);

    connection.query(query, function (err, rows, fields) {
        if (err) console.error(err);
        for (var i = 0; i < rows.length; i++) {
            var obj = new Object;
            obj.PRDSEQ = rows[i].ID;
            obj.PRDNAM = rows[i].PRDNAM;
            products.push(obj);
        }
        res.render('addevent', { title: 'Add Event', products: products });
    });
});

router.get('/addcall', function (req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.redirect('/login');
    }
}, function (req, res, next) {
    res.render('addcall', { title: 'Add Call' });
});

router.get('/addncall2url', function(req, res, next){
    if (req.isAuthenticated()) {
        next();
    } else {
        res.redirect('/login');
    }
}, function (req, res, next) {
    res.render('addncall2url', { title: 'Add NCall2 URL' });
});

router.get('/ncall2setting', function(req, res, next){
    if (req.isAuthenticated()) {
        next();
    } else {
        res.redirect('/login');
    } 
}, function (req, res, next) {
    let STOSEQ = req.user.STOSEQ;
    let q = "select * from NCALL2INFO where STOSEQ=" + STOSEQ + ";";
    
    connection.query(q, function(err, rows, fields){
        if(err) console.error(err);
        res.render('ncall2setting', { title: 'NCall2 Setting', showtime: rows[0].SHOWTIME });
    });
});

//웹 페이지 

router.post('/imageUpload', function(req, res, next){

    let page = "";
    let image = "";

    let form = new formidable.IncomingForm();
    form.encoding = "utf-8";
    form.uploadDir = "./public/images/";
    form.keepExtensions = true;
    form.maxFieldsSize = 12 * 1024 * 1024;

    form.parse(req, function (err, fields, files) {
        if (err) {
            console.log(err);
            let obj = new Object;
            obj.ResultCode = 200;
            obj.msg = "사진 전송에 실패하였습니다";
            console.log(obj);
            res.send(obj);
        }
    });
    
    form.on('error', function (err) {
        console.log(err);
        console.log("fdafasf");
        let obj = new Object;
        obj.ResultCode = 200;
        obj.msg = "사진 전송에 실패하였습니다";
        res.send(obj);
    }).on('field', function (field, value) {
        if (field === 'page') page = value;
    }).on('fileBegin', function (name, file) {
        file.path = form.uploadDir + "_" + new Date().valueOf() + file.name;
        image = file.path;
        image = image.replace("./public/images/", "");
    }).on('file', function (field, file) {
    }).on('progress', function (bytesReceived, bytesExpected) {

    }).on('end', function (req, ress) {
        console.log('form end:\n\n');
        
        let obj = new Object;
        obj.result="success";
        obj.file=image;
        res.send(obj);
        
    });
}); 

//상점 정보
router.get('/pos/setup/storeInfo', function(req, res, next){
    if(req.isAuthenticated()){
        let q = "select REGNUM, CHFNAM, STOTYP, STOITM, STOTEL, STOFAX, STOEML, STOHPG, STLOGO, STOZIP, STOADD, STDADD from STOMST where ID="+ req.user.STOSEQ +";"
        connection.query(q, function(err, rows, fields){
            if(err) {
                console.error(err);
                res.render('error', { message: '에러', error:err });
            } else {
                let REGNUM = rows[0].REGNUM;
                let CHFNAM = rows[0].CHFNAM;
                let STOTYP = rows[0].STOTYP;
                let STOITM = rows[0].STOITM;
                let STOTEL = rows[0].STOTEL;
                let STOFAX = rows[0].STOFAX;
                let STOEML = rows[0].STOEML;
                let STOHPG = rows[0].STOHPG;
                let STLOGO = rows[0].STLOGO;
                let STOZIP = rows[0].STOZIP;
                let STOADD = rows[0].STOADD;
                let STDADD = rows[0].STDADD;
                res.render('storeInfo', {REGNUM:REGNUM,
                                            CHFNAM:CHFNAM,
                                            STOTYP:STOTYP,
                                            STOITM:STOITM,
                                            STOTEL:STOTEL,
                                            STOFAX:STOFAX,
                                            STOEML:STOEML,
                                            STOHPG:STOHPG,
                                            STLOGO:STLOGO,
                                            STOZIP:STOZIP,
                                            STOADD:STOADD,
                                            STDADD:STDADD
                                        });
            }
        });
    } else {
        res.redirect('/login');
    }
});
//상점 설정
router.get('/pos/setup/storeSetup', function(req, res, next) {
    if(req.isAuthenticated()){
        let q = "select STLOGO, SALMTH, STOSTR, STOEND from STOMST where ID=" + req.user.STOSEQ +";";
        connection.query(q, function(err, rows, fields){
            if(err) {
                console.error(err);
            } else {
                let STLOGO = rows[0].STLOGO;
                let SALMTH = rows[0].SALMTH;
                let STOSTR = rows[0].STOSTR;
                let STOEND = rows[0].STOEND;
                let TBLFLG = "F";
                let DLVFLG = "F";
                if(SALMTH == "1") {
                    TBLFLG = "T";
                } else if (SALMTH == "2") {
                    DLVFLG = "T";
                } else {
                    TBLFLG = "T";
                    DLVFLG = "T";
                }
                res.render('storeSetup', {STLOGO:STLOGO,
                                            TBLFLG: TBLFLG,
                                            DLVFLG: DLVFLG,
                                            STOSTR: STOSTR,
                                            STOEND: STOEND            
                                    });
            }
        });
    } else {
        res.redirect('/login');
    }
});
router.post('/pos/setup/storeSetup_proc', function(req, res, next){
    let STOSEQ = req.user.STOSEQ;
    let TBLFLG = req.body.TBLFLG;
    let DLVFLG = req.body.DLVFLG;
    let DLVAMT = req.body.DLVAMT;
    let DLVSTR = req.body.DLVSTR;
    let DLVEND = req.body.DLVEND;
    let SETFLG = req.body.SETFLG;
    let HALFLG = req.body.HALFLG;
    let HOMIMG = req.body.HOMIMG;

    let salmth = 0;
    if(TBLFLG == "Y" && DLVFLG == "Y"){
        salmth = 3;
    } else if (TBLFLG == "N" && DLVFLG == "Y"){
        salmth = 2;
    } else if (TBLFLG == "Y" && DLVFLG == "N") {
        salmth = 1;
    }

    let q = "update STOMST set STLOGO='"+ HOMIMG +"', SALMTH='"+ salmth +"' where ID="+ STOSEQ +";";
    connection.query(q, function(errs, rows, fields){
        if(errs) {
            let data = new Object;
            data.msg = "저장에 실패했습니다";
            console.error(errs);
            res.send(data);
        } else {
            let data = new Object;
            data.msg = "저장되었습니다";
            console.log(data);
            res.send(data);
        }
    });
});
//회원 정보
router.get('/pos/setup/userEdit', function(req, res, next){
    if(req.isAuthenticated()){
        let posid = req.user.POSID;
        let q = "select * from POSMST where POSID='" + posid + "';";
        connection.query(q, function(err, rows, fields){
            if(err) {
                console.error(err);
            } else {
                let POSNAM = rows[0].POSNAM;
                let POSID = rows[0].POSID;
                res.render('userEdit', {POSID: POSID, POSNAM: POSNAM});        
            }
        });
    } else {
        res.redirect('/login');
    }
});
router.post('/pos/setup/userEdit_proc', function(req, res, next){
    if(req.isAuthenticated()){
        let NOWPWD = req.body.NOWPWD;
        let CHGPWD = req.body.CHGPWD;
        let CHKPWD = req.body.CHKPWD;
        let data = new Object;

        let q = "select POSPW from POSMST where POSID = '"+ req.user.POSID +"';";
        connection.query(q, function(err, rows, fields){
            if(err) {
                console.error(err);
                data.msg="정보를 불러오는 데 실패했습니다";
                res.send(data);
            } else {
                if(NOWPWD == rows[0].POSPW) {
                    if(CHGPWD == CHKPWD) {
                        let q2 = "update POSMST set POSPW='"+ CHGPWD +"' where POSID='"+ req.user.POSID +"';";
                        connection.query(q2, function(err, rows, fields){
                            if(err) {
                                console.error(err);
                            } else {
                                data.msg="변경 완료";
                                res.send(data);
                            }
                        });
                    } else {
                        data.msg="두 패스워드를 같이 입력해주세요";
                        res.send(data);
                    }
                } else {
                    data.msg="현재 비밀번호를 확인해주세요";
                    res.send(data);                    
                }
            }
        });
    } else {
        res.redirect('/login');
    }
});

//직원
router.get('/pos/setup/employee', function(req, res, next) {
    if(req.isAuthenticated()){
        res.render('employee', {});
    } else {
        res.redirect('/login');
    }
});

//테이블
router.get('/pos/setup/table', function(req, res, next){
    if(req.isAuthenticated()){
        res.render('table', {});
    } else {
        res.redirect('/login');
    }
});
router.post('/pos/setup/floor_proc', function(req, res, next){
    //층 추가
    let STOSEQ = req.user.STOSEQ;
    let savgvn = req.body.SAVGBN;

    if(savgvn == "I"){
        let q="select ORDNUM from STOFLR where STOSEQ="+ STOSEQ +" order by ORDNUM desc limit 1;";
        connection.query(q, function(err, rows, fields){
            if(err) {
                console.error(err);
            } else {
                let ORDNUM = 1;
                if(rows.length == 0) {
                    ORDNUM = 1;
                } else {
                    ORDNUM = rows[0].ORDNUM + 1;
                }
                let FLRNAM = ORDNUM + "층";

                let flrnam = "임시";
                var q2 = "INSERT INTO STOFLR (STOSEQ, FLRNAM, ORDNUM) VALUES (" + STOSEQ + ", '" + FLRNAM + "', " + ORDNUM + ");";
                
                connection.query(q2, function(err, rows, fields){
                    if(err) {
                        console.error(err);
                    } else {
                        let obj = new Object;
                        obj.result = "success";
                        res.send(obj);
                    }
                });
            }
        });
    } else if(savgvn == "D") {
        let flrseq = req.body.FLRSEQ;
        let q = "delete from STOFLR where ID="+flrseq+" and STOSEQ="+STOSEQ+";";
        let q2 = "delete from TBLSTO where FLRSEQ="+flrseq+" and STOSEQ="+STOSEQ+";";
        connection.query(q, function(err, rows, fields){
            if(err) {
                console.error(err);
            } else {
                connection.query(q2, function(err, rows, fields){
                    if(err) {
                        console.error(err);
                    } else {
                        let obj = new Object;
                        obj.result = "success";
                        res.send(obj);
                    }
                });
            }
        });
    } else if(savgvn == "M") {
        
    } else if(savgvn == "P") {

    } else if(savgvn == "U") {
        let FLRSEQ = req.body.FLRSEQ;
        let FLRNAM = req.body.FLRNAM;

        let q="update STOFLR set FLRNAM='"+ FLRNAM +"' where ID="+ FLRSEQ +";";
        connection.query(q, function(err, rows, fields){
            if(err){
                console.error(err);
                res.send();
            } else {
                let obj = new Object;
                obj.result="success";
                res.send(obj);
            }
        });

    }
});
router.post('/pos/setup/floor_select', function(req, res, next){
    let STOSEQ = req.user.STOSEQ;
    let table = [];
    let q = "select * from STOFLR where STOSEQ="+ STOSEQ +" order by ORDNUM;";
    connection.query(q, function(err, rows, fields){
        if(err) {
            console.error(err);
        } else {
            for(let i=0; i<rows.length; i++){
                let obj = new Object;
                obj.FLRSEQ = rows[i].ID;
                obj.FLRNAM = rows[i].FLRNAM;
                table.push(obj);
            }
            res.send(table);
        }
    });
    
});
router.post('/pos/setup/dialog/table01', function(req, res, next){
    let STOSEQ = req.user.STOSEQ;
    res.render('dialog_floorUpdate', {FLRSEQ: req.body.FLRSEQ});
});
router.post('/pos/setup/table_select', function(req, res, next){
    let STOSEQ = req.user.STOSEQ;
    let flrseq = req.body.FLRSEQ;
    let table = [];

    let q ="select * from TBLSTO where STOSEQ="+ STOSEQ +" and FLRSEQ="+ flrseq +";";

    connection.query(q, function(err, rows, fields){
        if(err){
            console.error(err);
        } else {
            for(let i=0; i<rows.length; i++){
                let obj= new Object;
                obj.TBLSEQ = rows[i].ID;
                obj.TBLNAM = rows[i].TBLNAM;
                table.push(obj);
            }
            res.send(table);
        }
    });
});
router.post('/pos/setup/table_proc', function(req, res, next){
    let STOSEQ = req.user.STOSEQ;
    let SAVGBN = req.body.SAVGBN;
    let FLRSEQ = req.body.FLRSEQ;
    
    if(SAVGBN == "I"){
        let q = "INSERT INTO TBLSTO (STOSEQ, FLRSEQ, TBLNAM, NOWUSE) VALUES ("+ STOSEQ +", '" + FLRSEQ + "', '임시', 'N');";
        connection.query(q, function(err, rows, fields){
            if(err){
                console.error(err);
            } else {
                let obj = new Object;
                obj.result="success";
                console.log(obj);
                res.send(obj);
            }
        });
    } else if (SAVGBN == "U") {
        let TBLSEQ = req.body.TBLSEQ;
        let TBLNAM = req.body.TBLNAM;
        let q = "update TBLSTO set TBLNAM='"+ TBLNAM +"' where ID=" + TBLSEQ + ";";
        connection.query(q, function(err, rows, fields){
            if(err){
                console.error(err);
                let obj = new Object;
                obj.msg="error";
                res.send(obj);
            } else {
                let obj = new Object;
                obj.result="success";
                console.log(obj);
                res.send(obj);
            }
        })

    } else if (SAVGBN == "D") {
        let TBLSEQ = req.body.TBLSEQ;
        let q = "delete from TBLSTO where ID="+ TBLSEQ +";";
        connection.query(q, function(err, rows, fields){
            if(err){
                console.error(err);
                let obj = new Object;
                obj.msg="error";
                res.send(obj);
            } else {
                let obj = new Object;
                obj.result="success";
                console.log(obj);
                res.send(obj);
            }
        });
    }
});
router.post('/pos/setup/dialog/table02', function(req, res, next){
    res.render('dialog_tableUpdate', {FLRSEQ: req.body.FLRSEQ, TBLSEQ: req.body.TBLSEQ});
});

//주변 기기
router.get('/pos/setup/storeDevice', function(req, res, next){
    if(req.isAuthenticated()){
        let q = "select * from STODVC where STOSEQ="+req.user.STOSEQ+";";
        connection.query(q, function(err, rows, fields){
            if(err) {
                console.error(err);
                res.send("<script>alert('오류')</script>");
            } else {
                let device = [];
                for(let i=0; i<rows.length; i++){
                    let obj = new Object;
                    obj.DVCSEQ = rows[i].ID;
                    obj.IPADDR = rows[i].IPADDR;
                    obj.PORT   = rows[i].PORT;
                    obj.KITFLG = rows[i].KITFLG;
                    obj.RCPFLG = rows[i].RCPFLG;
                    device.push(obj);
                }
                let q2 = "select * from NCALL where STOSEQ=?;";


                connection.query(q2, [req.user.STOSEQ], function(err, rows2, fields){
                    if(err){
                        console.error(err);
                    } else {
                        if(rows2.length != 0) {
                            let ALMGBN = rows2[0].ALMGBN;
                            let ALMTIM = rows2[0].ALMTIM;
                            let ALMADV = rows2[0].ALMADV;
                            
                            let q3 = "select * from NCALLADV where STOSEQ=?;";
                            connection.query(q3, [req.user.STOSEQ], function(err, rows3, fields){
                                if(err){
                                    console.error(err);
                                } else {
                                    let advs = [];
                                    for(let i=0; i<rows3.length; i++) {
                                        // let obj = new Object();
                                        // obj.FILTYP = rows3[i].FILTYP;
                                        // obj.FILURL = rows3[i].FILURL;
                                        // advs.push(obj);
                                        advs.push(rows3[i].FILURL);
                                    }
                                    res.render('storeDevice', {deviceNumber: rows.length, devices: JSON.stringify(device), ALMGBN: ALMGBN, ALMTIM: ALMTIM, ALMADV: ALMADV, ADVFILES:advs});
                                }
                            });
                        } else {
                            res.render('storeDevice', {deviceNumber: rows.length, devices: JSON.stringify(device), ALMGBN: "0", ALMTIM: "10", ALMADV: "N", ADVFILES:[]});
                        }
                    }
                });
            }
        });

    } else {
        res.redirect('/login');
    }
});

router.post('/pos/setup/storeDevice_proc', function(req, res, next){
    if(req.isAuthenticated()) {
        let STOSEQ = req.user.STOSEQ;
        let ALMGBN = req.body.ALMGBN;
        let ALMTIM = req.body.ALMTIM;
        let ALMADV = req.body.ALMADV;
        let ADVFIL = req.body.ADVFIL;

        let q = "update NCALL set ALMGBN=?, ALMTIM=?, ALMADV=? where STOSEQ=?;";
        connection.query(q, [ALMGBN, ALMTIM, ALMADV, STOSEQ], function(err, rows, fields){
            if(err){
                console.error(err);
            } else {
                let q2 = "delete from NCALLADV where STOSEQ="+STOSEQ+";";
                run_query(q2, "");

                if(_.isArray(ADVFIL)){
                    for(let i=0; i<ADVFIL.length; i++) {
                        let q3 = "insert into NCALLADV(STOSEQ, FILTYP, FILURL) values (?, 'P', ?);";
                        connection.query(q3, [STOSEQ, ADVFIL[i]], function(err, rows3, fields){
                            if(err) {
                                console.error(err);
                            } else {
                                
                            }
                        });
                    }
                } else {
                    let q3 = "insert into NCALLADV(STOSEQ, FILTYP, FILURL) values (?, 'P', ?);";
                    connection.query(q3, [STOSEQ, ADVFIL], function(err, rows3, fields){
                        if(err) {
                            console.error(err);
                        } else {
                            
                        }
                    });
                }
                let obj = new Object();
                obj.result = "success";
                obj.msg = "저장되었습니다";
                res.send(obj);
            }
        })

    } else {

    }
});

//호출
router.get('/pos/setup/call', function(req, res, next){
    if(req.isAuthenticated()){
        res.render('call', {});
    } else {
        res.redirect('/login');
    }
});
router.post('/pos/setup/call_select', function(req, res, next){
    let STOSEQ = req.user.STOSEQ;
    let q = "select * from STOCAL where CALCOD='S' and STOSEQ="+STOSEQ+" order by ORDNUM;";
    connection.query(q, function(err, rows, fields){
        if(err) {
            console.error(err);
        } else {
            console.log(rows);
            let call = [];
            for(let i=0; i<rows.length; i++){
                let obj = new Object;
                obj.CALSEQ = rows[i].ID;
                obj.CALNAM = rows[i].CALNAM;
                obj.ORDNUM = rows[i].ORDNUM;
                call.push(obj);
            }
            console.log(call);
            res.send(call);
        }
    });
});
router.post('/pos/setup/call_proc', function(req, res, next){
    let STOSEQ = req.user.STOSEQ;
    let SAVGBN = req.body.SAVGBN;
    let CALSEQ = req.body.CALSEQ;

    if(SAVGBN == "U") {
        let CALNAM = req.body.CALNAM;
        let ORDNUM = req.body.ORDNUM;
        if(CALSEQ == "") {
            let q = "insert into STOCAL(STOSEQ, CALCOD, CALNAM, ORDNUM, REGDAT) values ("+ STOSEQ +", 'S', '" + CALNAM + "', " + ORDNUM + ", now());";
            connection.query(q, function(err, rows, fields){
                if(err) {
                    console.error(err);
                    let obj = new Object;
                    obj.msg = "DB Insertion Error";
                    res.send(obj);
                } else {
                    let obj = new Object;
                    obj.result = "Success";
                    res.send(obj);
                }
            });
        } else {
            let q = "update STOCAL set CALNAM='"+ CALNAM +"', ORDNUM="+ ORDNUM +", REGDAT=now() where ID="+ CALSEQ +";";
            connection.query(q, function(err, rows, fields){
                if(err) {
                    console.error(err);
                    let obj = new Object;
                    obj.msg = "DB Update Error";
                    res.send(obj);
                } else {
                    let obj = new Object;
                    obj.result = "Success";
                    res.send(obj);
                }
            });
        }
    } else if (SAVGBN == "D") {
        let q = "delete from STOCAL where ID="+ CALSEQ +";";
        connection.query(q, function(err, rows, fields){
            if(err) {
                console.error(err);
                let obj = new Object;
                obj.msg = "DB Update Error";
                res.send(obj);
            } else {
                let obj = new Object;
                obj.result = "Success";
                res.send(obj);
            }
        });
    }

});
router.post('/pos/setup/dialog/call', function(req, res, next){
    let CALSEQ = req.body.CALSEQ;

    if(CALSEQ == "") {
        res.render('dialog_callUpdate');
    } else {
        let q = "select * from STOCAL where ID="+ CALSEQ +";";
        connection.query(q, function(err, rows, fields){
            if(err){
                console.error(err);
            } else {
                let CALNAM = rows[0].CALNAM;
                let ORDNUM = rows[0].ORDNUM;
                res.render('dialog_callUpdate', {CALSEQ: CALSEQ, CALNAM: CALNAM, ORDNUM: ORDNUM});
            }
        });
    }
});

//메세지
router.get('/pos/setup/message', function(req, res, next){
    if(req.isAuthenticated()){
        res.render('message', {});
    } else {
        res.redirect('/login');
    }
});
router.post('/pos/setup/message_select', function(req, res, next){
    let STOSEQ = req.user.STOSEQ;
    let q = "select * from STOCAL where CALCOD='C' and STOSEQ="+STOSEQ+" order by ORDNUM;";
    connection.query(q, function(err, rows, fields){
        if(err) {
            console.error(err);
        } else {
            let call = [];
            for(let i=0; i<rows.length; i++){
                let obj = new Object;
                obj.CALSEQ = rows[i].ID;
                obj.CALNAM = rows[i].CALNAM;
                obj.ORDNUM = rows[i].ORDNUM;
                call.push(obj);
            }
            res.send(call);
        }
    });
});
router.post('/pos/setup/message_proc', function(req, res, next){
    let STOSEQ = req.user.STOSEQ;
    let SAVGBN = req.body.SAVGBN;
    let CALSEQ = req.body.CALSEQ;

    if(SAVGBN == "U") {
        let CALNAM = req.body.CALNAM;
        let ORDNUM = req.body.ORDNUM;
        if(CALSEQ == "") {
            
            let q = "insert into STOCAL(STOSEQ, CALCOD, CALNAM, ORDNUM, REGDAT) values ("+STOSEQ+", 'C', '" + CALNAM + "', " + ORDNUM + ", now());";
            connection.query(q, function(err, rows, fields){
                if(err) {
                    console.error(err);
                    let obj = new Object;
                    obj.msg = "DB Insertion Error";
                    res.send(obj);
                } else {
                    let obj = new Object;
                    obj.result = "Success";
                    res.send(obj);
                }
            });
        } else {
            let q = "update STOCAL set CALNAM='"+ CALNAM +"', ORDNUM="+ ORDNUM +", REGDAT=now() where ID="+ CALSEQ +";";
            connection.query(q, function(err, rows, fields){
                if(err) {
                    console.error(err);
                    let obj = new Object;
                    obj.msg = "DB Update Error";
                    res.send(obj);
                } else {
                    let obj = new Object;
                    obj.result = "Success";
                    res.send(obj);
                }
            });
        }
    } else if (SAVGBN == "D") {
        let q = "delete from STOCAL where ID="+ CALSEQ +";";
        connection.query(q, function(err, rows, fields){
            if(err) {
                console.error(err);
                let obj = new Object;
                obj.msg = "DB Update Error";
                res.send(obj);
            } else {
                let obj = new Object;
                obj.result = "Success";
                res.send(obj);
            }
        });
    }
});
router.post('/pos/setup/dialog/message', function(req, res, next){
    let CALSEQ = req.body.CALSEQ;

    if(CALSEQ == "") {
        res.render('dialog_messageUpdate');
    } else {
        let q = "select * from STOCAL where ID="+ CALSEQ +";";
        connection.query(q, function(err, rows, fields){
            if(err){
                console.error(err);
            } else {
                let CALNAM = rows[0].CALNAM;
                let ORDNUM = rows[0].ORDNUM;
                res.render('dialog_messageUpdate', {CALSEQ: CALSEQ, CALNAM: CALNAM, ORDNUM: ORDNUM});
            }
        });
    }
});

//옵션
router.get('/pos/setup/option', function(req, res, next){
    if(req.isAuthenticated()){
        res.render('option', {});
    } else {
        res.redirect('/login');
    }
});
router.post('/pos/setup/option_select', function(req, res, next){
    let STOSEQ = req.user.STOSEQ;
    let q = "select * from OPTCAT where STOSEQ="+STOSEQ+" order by ORDNUM;";
    connection.query(q, function(err, rows, fields){
        if(err) {
            console.error(err);
        } else {
            let option = [];
            for(let i=0; i<rows.length; i++){
                let obj = new Object;
                obj.OPTSEQ = rows[i].ID;
                obj.OPTNAM = rows[i].CATNAM;
                // obj.ORDNUM = 0;
                option.push(obj);
            }
            res.send(option);
        }
    });
});
router.post('/pos/setup/dialog/option01', function(req, res, next){
    let OPTSEQ = req.body.OPTSEQ;
    if(OPTSEQ=="") {
        res.render('dialog_optionUpdate');                        
    } else {
        let q = "select * from OPTCAT where ID="+ OPTSEQ +";";
        connection.query(q, function(err, rows, fields){
            if(err) {
                console.error(err);
            } else {
                let OPTNAM = rows[0].CATNAM;
                res.render('dialog_optionUpdate', {OPTSEQ: OPTSEQ, OPTNAM: OPTNAM});            
            }
        });
    }
});
router.post('/pos/setup/option_proc', function(req, res, next){
    let STOSEQ = req.user.STOSEQ;
    let OPTSEQ = req.body.OPTSEQ;
    let SAVGBN = req.body.SAVGBN;

    if(SAVGBN == "U") {
        let OPTNAM = req.body.OPTNAM;
        if(OPTSEQ == "") {
            let q = "insert into OPTCAT(STOSEQ, CATNAM, ORDNUM) values ("+STOSEQ+", '"+ OPTNAM +"', 1);";
            connection.query(q, function(err, rows, fields){
                if(err) {
                    console.error(err);
                    let obj = new Object;
                    obj.msg = "DB Insertion Error";
                    res.send(obj);
                } else {
                    let obj = new Object;
                    obj.result = "Success";
                    obj.seq = rows.insertId;                    
                    res.send(obj);
                }
            });
        } else {
            let q = "update OPTCAT set CATNAM='"+ OPTNAM +"' where ID="+ OPTSEQ +";";
            connection.query(q, function(err, rows, fields){
                if(err) {
                    console.error(err);
                    let obj = new Object;
                    obj.msg = "DB Update Error";
                    res.send(obj);
                } else {
                    let obj = new Object;
                    obj.result = "Success";
                    obj.seq = OPTSEQ;                    
                    res.send(obj);
                }
            });
        }
    } else if (SAVGBN == "D") {
        let q1 = "select B.PRDNAM from PRDOPT as A left join PRDMST as B on A.PRDSEQ = B.ID where B.STOSEQ="+STOSEQ+" and A.STOSEQ="+STOSEQ+" and A.OPTCAT=" + OPTSEQ + ";"
        connection.query(q1, function(err, rows, fields){
            if(err) {
                console.error(err);
                let obj = new Object;
                obj.msg = "DB Update Error";
                res.send(obj);
            } else {
                if(rows.length == 0) {
                    let q = "delete from OPTCAT where ID="+ OPTSEQ +";";
                    connection.query(q, function(err, rows, fields){
                        if(err) {
                            console.error(err);
                            let obj = new Object;
                            obj.msg = "DB Update Error";
                            res.send(obj);
                        } else {
                            let obj = new Object;
                            obj.result = "Success";
                            obj.seq = 1;
                            res.send(obj);
                        }
                    });
                } else {
                    let list = "";
                    for(let i=0; i<rows.length; i++) {
                        list += rows[i].PRDNAM + "\n";
                    }
                    list += "에서 옵션이 사용중입니다\n제품에서 먼저 옵션을 삭제해주세요";
                    let obj = new Object;
                    obj.msg = list;
                    res.send(obj);
                }
            }
        });
    }
});
router.post('/pos/setup/optionDetail_select', function(req, res, next){
    let STOSEQ = req.user.STOSEQ;
    let OPTSEQ = req.body.OPTSEQ;
    let q = "select * from OPTMST where STOSEQ=? and OPTCAT=?;";
    connection.query(q, [STOSEQ, OPTSEQ], function(err, rows, fields){
        if(err) {
            console.error(err);
        } else {
            let option_detail = [];
            for(let i=0; i<rows.length; i++){
                let obj = new Object;
                obj.OPTSEQ = OPTSEQ;
                obj.DTLSEQ = rows[i].ID;
                obj.DTLNAM = rows[i].OPTNAM;
                obj.DTLCST = rows[i].OPTCST;
                // obj.ORDNUM = 0;
                option_detail.push(obj);
            }
            res.send(option_detail);
        }
    });
});
router.post('/pos/setup/dialog/option02', function(req, res, next){
    let STOSEQ = req.user.STOSEQ;
    let OPTSEQ = req.body.OPTSEQ;
    let DTLSEQ = req.body.DTLSEQ;
    if(DTLSEQ=="") {
        //추가
        res.render('dialog_optionDetailUpdate', {OPTSEQ: OPTSEQ});                        
    } else {
        //수정
        let q = "select * from OPTMST where ID="+ DTLSEQ +";";
        connection.query(q, function(err, rows, fields){
            if(err) {
                console.error(err);
            } else {
                let DTLNAM = rows[0].OPTNAM;
                let DTLCST = rows[0].OPTCST;
                res.render('dialog_optionDetailUpdate', {OPTSEQ: OPTSEQ, DTLSEQ: DTLSEQ, DTLNAM: DTLNAM, DTLCST: DTLCST});            
            }
        });
    }
});
router.post('/pos/setup/optionDetail_proc', function(req, res, next){
    let STOSEQ = req.user.STOSEQ;
    let OPTSEQ = req.body.OPTSEQ;
    let DTLSEQ = req.body.DTLSEQ;
    let SAVGBN = req.body.SAVGBN;

    if(SAVGBN == "U") {
        let DTLNAM = req.body.DTLNAM;
        let DTLCST = req.body.DTLCST;
        if(DTLSEQ == "") {
            let q = "insert into OPTMST(STOSEQ, OPTCAT, OPTNAM, OPTCST, REGDAT, REGUSR) values ("+STOSEQ+", "+ OPTSEQ +", '"+ DTLNAM +"', "+ DTLCST +", now(), '"+ req.user.POSID +"');";
            connection.query(q, function(err, rows, fields){
                if(err) {
                    console.error(err);
                    let obj = new Object;
                    obj.msg = "DB Insertion Error";
                    res.send(obj);
                } else {
                    let obj = new Object;
                    obj.result = "Success";
                    obj.seq = rows.insertId;                    
                    res.send(obj);
                }
            });
        } else {
            let q = "update OPTMST set OPTNAM='"+ DTLNAM +"', OPTCST="+ DTLCST +" where ID="+ DTLSEQ +";";
            connection.query(q, function(err, rows, fields){
                if(err) {
                    console.error(err);
                    let obj = new Object;
                    obj.msg = "DB Update Error";
                    res.send(obj);
                } else {
                    let obj = new Object;
                    obj.result = "Success";
                    obj.seq = OPTSEQ;                    
                    res.send(obj);
                }
            });
        }
    } else if (SAVGBN == "D") {
        let q = "delete from OPTMST where ID="+ DTLSEQ +";";
        connection.query(q, function(err, rows, fields){
            if(err) {
                console.error(err);
                let obj = new Object;
                obj.msg = "DB Update Error";
                res.send(obj);
            } else {
                let obj = new Object;
                obj.result = "Success";
                obj.seq = OPTSEQ;                
                res.send(obj);
            }
        });
    }
});

//상품
router.get('/pos/setup/product', function(req, res, next){
    if(req.isAuthenticated()){
        res.render('product', {});
    } else {
        res.redirect('/login');
    }
});
router.post('/pos/setup/catagory_select', function(req, res, next){
    let STOSEQ = req.user.STOSEQ;
    let q = "select * from CATMST where STOSEQ=? order by ORDNUM;";
    connection.query(q, [STOSEQ], function(err, rows, fields){
        if(err) {
            console.error(err);
        } else {
            let category = [];
            for(let i=0; i<rows.length; i++){
                let obj = new Object;
                obj.CTGSEQ = rows[i].ID;
                obj.IMGTAG = "<img src='/images/" + rows[i].CATFIL +"' width='50px'";
                obj.CTGNAM = rows[i].CATNAM;
                obj.ORDNUM = rows[i].ORDNUM;
                category.push(obj);
            }
            res.send(category);
        }
    });
});
router.post('/pos/setup/dialog/product01', function(req, res, next){
    let STOSEQ = req.user.STOSEQ;
    let CTGSEQ = req.body.CTGSEQ;

    if(CTGSEQ == ""){
        //신규
        let SAVGBN = "I";
        res.render('dialog_categoryUpdate', {SAVGBN: SAVGBN, CTGIMG: 'empty.png'});
    } else {
        //수정
        let SAVGBN = "U";
        let q = "select * from CATMST where ID=" + CTGSEQ + ";";
        connection.query(q, function(err, rows, fields){
            if(err){
                console.error(err);
            } else {
                let CATNAM = rows[0].CATNAM;
                let CATFIL = rows[0].CATFIL;
                let ORDNUM = rows[0].ORDNUM;

                res.render('dialog_categoryUpdate', {SAVGBN: SAVGBN, CTGSEQ: CTGSEQ, CTGNAM: CATNAM, CTGIMG: CATFIL, ORDNUM: ORDNUM});
            }
        });
    }
});
router.post('/pos/setup/catagory_proc', function(req, res, next){
    let STOSEQ = req.user.STOSEQ;
    let CTGSEQ = req.body.CTGSEQ;
    let CTGNAM = req.body.CTGNAM;
    let CTGIMG = req.body.CTGIMGNAME;
    let ORDNUM = req.body.ORDNUM;
    let SAVGBN = req.body.SAVGBN;


    if(SAVGBN == "I") {
        let q = "insert into CATMST(STOSEQ, CATNAM, CATNUM, CATFIL, REGDAT, ORDNUM) values (?, ?, 0, ?, now(), ?);";
        connection.query(q, [STOSEQ, CTGNAM, CTGIMG, ORDNUM], function(err, rows, fields){
            if(err) {
                console.error(err);
                let obj = new Object;
                obj.msg = "데이터 입력 에러";
                res.send(obj);
            } else {
                let obj = new Object;
                obj.result = "Success";
                res.send(obj);
            }
        });
    } else if (SAVGBN == "U") {
        let q = "update CATMST set CATNAM=?, CATFIL=?, REGDAT=now(), ORDNUM=? where ID="+ CTGSEQ +";";
        connection.query(q, [CTGNAM, CTGIMG, ORDNUM], function(err, rows, fields) {
            if(err) {
                console.error(err);
                let obj = new Object;
                obj.msg = "데이터 수정 에러";
                res.send(obj);
            } else {
                let obj = new Object;
                obj.result = "Success";
                res.send(obj);
            }
        });
    } else if (SAVGBN == "D") {
        let q = "delete from CATMST where ID=" + CTGSEQ + ";";
        connection.query(q, function(err, rows, fields) {
            if(err) {
                console.error(err);
                let obj = new Object;
                obj.msg = "데이터 삭제 에러";
                res.send(obj);
            } else {
                let obj = new Object;
                obj.result = "Success";
                res.send(obj);
            }
        });
    }
});
router.post('/pos/setup/product_select', function(req, res, next){
    let STOSEQ = req.user.STOSEQ;
    let CTGSEQ = req.body.CTGSEQ;
    let SALFLG = req.body.SALFLG;
    let q = "";
    if(SALFLG == "") {
        q = "select A.ID, A.CATSEQ, A.PRDNAM, A.PRDCST, A.PRDEXP, A.SALFLG, A.CTRCOD, A.ORDNUM, B.FILURL from PRDMST as A left join PRDFIL_M as B on B.PRDSEQ=A.ID where A.STOSEQ="+STOSEQ+" and A.CATSEQ="+ CTGSEQ + " order by ORDNUM;";
    } else {
        q = "select A.ID, A.CATSEQ, A.PRDNAM, A.PRDCST, A.PRDEXP, A.SALFLG, A.CTRCOD, A.ORDNUM, B.FILURL from PRDMST as A left join PRDFIL_M as B on B.PRDSEQ=A.ID where A.STOSEQ="+STOSEQ+" and A.CATSEQ="+ CTGSEQ + " and SALFLG='"+ SALFLG+"' order by ORDNUM;";
    }
    connection.query(q, function(err, rows, fields){
        if(err) {
            console.error(err);
        } else {
            let product = [];
            for(let i=0; i<rows.length; i++) {
                let obj = new Object;
                obj.PRDSEQ      = rows[i].ID;
                obj.PRDIMG_TAG  = "<img src='/images/"+ rows[i].FILURL +"' width='50px'>";
                obj.PRDNAM      = rows[i].PRDNAM;
                obj.TOTAMT      = rows[i].PRDCST;
                obj.BUYAMT      = 0;
                obj.CTRNAM      = rows[i].CTRCOD;
                obj.SALFLG      = rows[i].SALFLG;
                obj.PRDEXP      = rows[i].PRDEXP;
                obj.ORDNUM      = rows[i].ORDNUM;
                product.push(obj);
            }
            res.send(product);
        }
    });
});
router.post('/pos/setup/dialog/product02', function(req, res, next){
    let STOSEQ = req.user.STOSEQ;
    let PRDSEQ = req.body.PRDSEQ;
    let CTGSEQ = req.body.CTGSEQ;
    if(PRDSEQ == "") {
        //신규
        let SAVGBN = "I";
        let query = "select ID, CATNAM from OPTCAT where STOSEQ="+STOSEQ+" order by ORDNUM;";
        let optcat = [];

        connection.query(query, function (err, rows2, fields) {
            if (err) {
                console.error(err);
            } else {
                if (rows2.length == 0) {
                    var obj = new Object;
                    obj.OPTCATSEQ = 0;
                    obj.CATNAM = "옵션을 등록해주세요";
                    optcat.push(obj);
                } else {
                    let init_option = new Object;
                    init_option.OPTCATSEQ = 0;
                    init_option.CATNAM = "";
                    optcat.push(init_option);
                    for (var i = 0; i < rows2.length; i++) {
                        let obj = new Object;
                        obj.OPTCATSEQ = rows2[i].ID;
                        obj.CATNAM = rows2[i].CATNAM;
                        optcat.push(obj);
                    }
                }
                res.render('dialog_productInsert', {SAVGBN: SAVGBN, CTGSEQ: CTGSEQ, SALFLG: 'Y', KITFLG: 'Y', optioncategories: optcat});
            }
        });
    } else {
        //수정
        let SAVGBN = "U";
        let q = "select A.PRDNAM, A.PRDCST, A.PRDEXP, A.SALFLG, A.KITFLG, A.CTRCOD, A.ORDNUM, B.FILURL as PRMIMG, C.FILURL as DTLIMG from PRDMST as A left join PRDFIL_M as B on A.ID=B.PRDSEQ "
        + "left join PRDFIL_D as C on A.ID=C.PRDSEQ where A.ID=" + PRDSEQ + " and A.STOSEQ="+STOSEQ+" and B.STOSEQ="+STOSEQ+" and C.STOSEQ="+STOSEQ+" order by C.ORDNUM;";
        
        connection.query(q, function(err, rows, fields){
            if(err) {
                console.error(err);
            } else {
                //상품 정보
                let PRDNAM = rows[0].PRDNAM;
                let PRDCST = rows[0].PRDCST;
                let PRDEXP = rows[0].PRDEXP;
                let SALFLG = rows[0].SALFLG;
                let KITFLG = rows[0].KITFLG;
                let CTRCOD = rows[0].CTRCOD;
                let ORDNUM = rows[0].ORDNUM;
                let PRMIMG = rows[0].PRMIMG;
                let DTLIMG = [];
                for(let i=0; i<rows.length; i++) {
                    DTLIMG.push(rows[i].DTLIMG);
                }
                //옵션 정보
                let query1 = "select ID, CATNAM from OPTCAT where STOSEQ="+STOSEQ+" order by ORDNUM;";
                let optcat = [];
                connection.query(query1, function (err, rows2, fields) {
                    if (err) {
                        console.error(err);
                    } else {
                        if (rows2.length == 0) {
                            var obj = new Object;
                            obj.OPTCATSEQ = 0;
                            obj.CATNAM = "옵션을 등록해주세요";
                            optcat.push(obj);
                        } else {
                            let init_option = new Object;
                            init_option.OPTCATSEQ = 0;
                            init_option.CATNAM = "";
                            optcat.push(init_option);
                            for (var i = 0; i < rows2.length; i++) {
                                let obj = new Object;
                                obj.OPTCATSEQ = rows2[i].ID;
                                obj.CATNAM = rows2[i].CATNAM;
                                optcat.push(obj);
                            }
                            //이미 선택 된 옵션
                            let query = "select B.ID, B.CATNAM from PRDOPT as A left join OPTCAT as B on A.OPTCAT=B.ID where A.PRDSEQ=" + PRDSEQ + " and A.STOSEQ="+STOSEQ+" and B.STOSEQ="+STOSEQ+";";
                            connection.query(query, function(err, rows3, fields){
                                if(err) {
                                    console.error(err);
                                } else {
                                    let selectedOptions = [];
                                    for(let k=0; k<rows3.length; k++){
                                        let obj = new Object;
                                        obj.SEQ = rows3[k].ID;
                                        obj.NAM = rows3[k].CATNAM;
                                        selectedOptions.push(obj);
                                    }
                                    res.render('dialog_productUpdate', {SAVGBN: SAVGBN, PRDSEQ: PRDSEQ, 
                                                                        CTGSEQ: CTGSEQ, PRDNAM: PRDNAM, 
                                                                        TOTAMT: PRDCST, PRDEXP: PRDEXP, 
                                                                        SALFLG: SALFLG, KITFLG: KITFLG, 
                                                                        CTRCOD: CTRCOD, ORDNUM: ORDNUM, 
                                                                        PRMIMG: PRMIMG, DTLIMG: DTLIMG, 
                                                                        DTLIMGNUM: DTLIMG.length,
                                                                        optioncategories: optcat, selectedOptions: selectedOptions,
                                                                        selectedOptionNumber: rows3.length});
                                }
                            });

                        }
                    }
                });
            }
        });
    }
});
router.post('/pos/setup/product_insert_proc', function(req, res, next){
    let STOSEQ = req.user.STOSEQ;

    let PRDSEQ = req.body.PRDSEQ;
    let PRMIMG = req.body.PRMIMGNAME;
    let DTLIMG = req.body.PRDIMGNAME; //
    let CTGSEQ = req.body.CTGSEQ;
    let PRDNAM = req.body.PRDNAM; 
    let TOTAMT = req.body.TOTAMT;
    let BUYAMT = req.body.BUYAMT; 
    let OPTCAT = req.body.OPTCAT; //
    let PRDEXP = req.body.PRDEXP;
    let CTRCOD = req.body.CTRCOD;
    let ORDNUM = req.body.ORDNUM;
    let SALFLG = req.body.SALFLG;
    let KITFLG = req.body.KITFLG;

    let q2 = "insert into PRDMST(STOSEQ, CATSEQ, PRDNAM, PRDCST, PRDEXP, SALFLG, CTRCOD, ORDNUM, REGDAT, REGUSR, KITFLG) values (?, ?, ?, ?, ?, ?, ?, ?, now(), ?, ?);"
    connection.query(q2, [STOSEQ, CTGSEQ, PRDNAM, TOTAMT, PRDEXP, SALFLG, CTRCOD, ORDNUM, req.user.POSID, KITFLG], function(err, rows, fields){
        if(err){
            console.error(err);
            let obj = new Object();
            obj.msg = "error!";
            res.send(obj);
        } else {
            PRDSEQ = rows.insertId;
            let DTLIMGORD = req.body.DTLIMGORD;
            
            let q = "insert into PRDFIL_M(STOSEQ, PRDSEQ, FILURL) values ("+STOSEQ+", " + PRDSEQ + ", '"+ PRMIMG +"');";
            run_query(q, "");
            if(_.isArray(DTLIMG)) {
                if(DTLIMG.length != 0) {
                    for(let i=0; i<DTLIMG.length; i++) {
                        let q = "insert into PRDFIL_D(STOSEQ, PRDSEQ, FILTYP, FILURL, ORDNUM) values ("+STOSEQ+", " + PRDSEQ + ", 'P', '"+ DTLIMG[i] +"', "+ DTLIMGORD[i] +");";
                        run_query(q, "");
                    }
                }
            } else {
                if(DTLIMG.length != 0) {
                    let q = "insert into PRDFIL_D(STOSEQ, PRDSEQ, FILTYP, FILURL, ORDNUM) values ("+STOSEQ+", " + PRDSEQ + ", 'P', '"+ DTLIMG +"', 1);";
                    run_query(q, "");
                }
            }
            
            if(_.isArray(OPTCAT)) {
                for(let i=0; i<OPTCAT.length; i++) {
                    if(OPTCAT[i] != '0') {
                        let q3="insert into PRDOPT(STOSEQ, PRDSEQ, OPTCAT) values ("+STOSEQ+", " + PRDSEQ + ", " + OPTCAT[i] + ");";  
                        connection.query(q3, function(err, rows, fields){
                            if(err) {
                                console.error(err);
                                let obj = new Object();
                                obj.msg = "error!";
                                res.send(obj);
                            } else {
                                
                            }
                        });
                    }
                }
                let obj = new Object();
                obj.result = "success";
                res.send(obj);
            } else {
                if(OPTCAT != '0') {
                    let q3="insert into PRDOPT(STOSEQ, PRDSEQ, OPTCAT) values ("+STOSEQ+", " + PRDSEQ + ", " + OPTCAT + ");";  
                    connection.query(q3, function(err, rows, fields){
                        if(err) {
                            console.error(err);
                            let obj = new Object();
                            obj.msg = "error!";
                            res.send(obj);
                        } else {
                            let obj = new Object();
                            obj.result = "success";
                            res.send(obj);
                        }
                    });
                }
                let obj = new Object();
                obj.result = "success";
                res.send(obj);
            }
        }
    });
});
router.post('/pos/setup/product_update_proc', function(req, res, next){
    let STOSEQ = req.user.STOSEQ;

    let PRDSEQ = req.body.PRDSEQ;
    let PRMIMG = req.body.PRMIMGNAME;
    let DTLIMG = req.body.PRDIMGNAME;
    let CTGSEQ = req.body.CTGSEQ;
    let PRDNAM = req.body.PRDNAM;
    let TOTAMT = req.body.TOTAMT;
    let BUYAMT = req.body.BUYAMT;
    let OPTCAT = req.body.OPTCAT;
    let PRDEXP = req.body.PRDEXP;
    let CTRCOD = req.body.CTRCOD;
    let ORDNUM = req.body.ORDNUM;
    let SALFLG = req.body.SALFLG;
    let KITFLG = req.body.KITFLG;

    let qq = "update PRDFIL_M set FILURL='"+PRMIMG+"' where STOSEQ="+STOSEQ+" and PRDSEQ=" + PRDSEQ + ";";
    run_query(qq, "");

    if(_.isArray(DTLIMG)) {
        let DTLIMGORD = req.body.DTLIMGORD;
        run_query("delete from PRDFIL_D where PRDSEQ=" + PRDSEQ + ";", "delete");     
        for(let i=0; i<DTLIMG.length; i++) {
            let q = "insert into PRDFIL_D(STOSEQ, PRDSEQ, FILTYP, FILURL, ORDNUM) values ("+STOSEQ+", " + PRDSEQ + ", 'P', '"+ DTLIMG[i] +"', "+ DTLIMGORD[i] +");";
            run_query(q, "");
        }
    }

    let q2 = "update PRDMST set PRDNAM=?, PRDCST=?, PRDEXP=?, SALFLG=?, CTRCOD=?, ORDNUM=?, REGDAT=now(), MODUSR=?, KITFLG=? where ID=" + PRDSEQ + ";";
    connection.query(q2, [PRDNAM, TOTAMT, PRDEXP, SALFLG, CTRCOD, ORDNUM, req.user.POSID, KITFLG], function(err, rows, fields){
        if(err){
            console.error(err);
            let obj = new Object();
            obj.msg = "error!";
            res.send(obj);
        } else {
            run_query("delete from PRDOPT where PRDSEQ="+ PRDSEQ +";", "");
            if(_.isArray(OPTCAT)) {
                for(let i=0; i<OPTCAT.length; i++) {
                    if(OPTCAT[i] != '0') {
                        let q3="insert into PRDOPT(STOSEQ, PRDSEQ, OPTCAT) values ("+STOSEQ+", " + PRDSEQ + ", " + OPTCAT[i] + ");";  
                        connection.query(q3, function(err, rows, fields){
                            if(err) {
                                console.error(err);
                                let obj = new Object();
                                obj.msg = "error!";
                                res.send(obj);
                            } else {
                                
                            }
                        });
                    }
                }
                let obj = new Object();
                obj.result = "success";
                res.send(obj);
            } else {
                if(OPTCAT != '0') {
                    let q3="insert into PRDOPT(STOSEQ, PRDSEQ, OPTCAT) values ("+STOSEQ+", " + PRDSEQ + ", " + OPTCAT + ");";  
                    connection.query(q3, function(err, rows, fields){
                        if(err) {
                            console.error(err);
                            let obj = new Object();
                            obj.msg = "error!";
                            res.send(obj);
                        } else {
                            let obj = new Object();
                            obj.result = "success";
                            res.send(obj);
                        }
                    });
                } else {
                    let obj = new Object();
                    obj.result = "success";
                    res.send(obj);
                }
            }
        }
    });
});
router.post('/pos/setup/product_delete_proc', function(req, res, next){
    let STOSEQ = req.user.STOSEQ;
    let PRDSEQ = req.body.PRDSEQ;

    run_query("delete from PRDMST where ID="+PRDSEQ+";", "");
    run_query("delete from PRDFIL_M where PRDSEQ="+PRDSEQ+";", "");
    run_query("delete from PRDFIL_D where PRDSEQ="+PRDSEQ+";", "");
    let q = "delete from PRDOPT where PRDSEQ="+PRDSEQ+";";
    connection.query(q, function(err, rows, fields){
        if(err) {
            console.error(err);
        } else {
            let obj = new Object();
            obj.result = "success";
            res.send(obj);
        }
    });
});

//세트
router.get('/pos/setup/set', function(req, res, next){
    if(req.isAuthenticated()){
        res.render('set', {});
    } else {
        res.redirect('/login');
    }
});

router.post('/pos/setup/set_select', function(req, res, next){
    let STOSEQ = req.user.STOSEQ;
    //stoseq + _SETMST

    let set = [];
    let q = "select * from SETMST where STOSEQ=? order by ORDNUM;";
    connection.query(q, [STOSEQ], function(err, rows, fields){
        if(err) {
            console.error(err);
        } else {
            for(let i=0; i<rows.length; i++){
                let obj = new Object;
                obj.SETSEQ = rows[i].ID;
                obj.SETNAM = rows[i].SETNAM;
                obj.TOTAMT = rows[i].SETCST;
                obj.ORDNUM = rows[i].ORDNUM;
                set.push(obj);
            }
            res.send(set);
        }
    });

});
router.post('/pos/setup/setDetail_select01', function(req, res, next){
    let STOSEQ = req.user.STOSEQ;
    let SETSEQ = req.body.SETSEQ;

    let q = "select B.PRDSEQ, D.CATNAM, C.PRDNAM, C.PRDCST from SETMST as A "
            + "inner join PRDSET as B on A.ID=B.SETSEQ "
            + "left join PRDMST as C on B.PRDSEQ=C.ID "
            + "left join CATMST as D on C.CATSEQ=D.ID "
            + "where A.ID="+ SETSEQ +" and A.STOSEQ="+STOSEQ+";";

    let product = [];
    connection.query(q, function(err, rows, fields){
        if(err) {
            console.error(err);
        } else {
            for(let i=0; i<rows.length; i++) {
                let obj = new Object;
                obj.PRDSEQ = rows[i].PRDSEQ;
                obj.CTGNAM = rows[i].CATNAM;
                obj.PRDNAM = rows[i].PRDNAM;
                obj.TOTAMT = rows[i].PRDCST;
                obj.BUYAMT = 0;
                product.push(obj);
            }
            res.send(product);
        }

    });
});
router.post('/pos/setup/setDetail_select02', function(req, res, next){
    let STOSEQ = req.user.STOSEQ;
    let SETSEQ = req.body.SETSEQ;

    let product = [];

    let q = "select A.ID, B.CATNAM, A.PRDNAM, A.PRDCST from PRDMST as A "
        + "left join CATMST as B on A.CATSEQ=B.ID where A.STOSEQ="+STOSEQ+" and A.CATSEQ <> 0 and A.SALFLG='Y' order by B.CATNAM, A.PRDNAM;";

    connection.query(q, function(err, rows, fields){
        if(err) {
            console.error(err);
        } else {
            for(let i=0; i<rows.length; i++){
                let obj = new Object;
                obj.PRDSEQ = rows[i].ID;
                obj.CTGNAM = rows[i].CATNAM;
                obj.PRDNAM = rows[i].PRDNAM;
                obj.TOTAMT = rows[i].PRDCST;
                obj.BUYAMT = 0;
                product.push(obj);
            }
            res.send(product);
        }
    });

});
router.post('/pos/setup/setDetail_proc', function(req, res, next){
    let STOSEQ = req.user.STOSEQ;
    let SAVGBN = req.body.SAVGBN;
    let SETSEQ = req.body.SETSEQ;
    let PRDSEQ = req.body.PRDSEQ;

    if(SAVGBN == "I") {
        let q = "insert into PRDSET(STOSEQ, SETSEQ, PRDSEQ) values (?, ?, ?);";
        connection.query(q, [STOSEQ, SETSEQ, PRDSEQ], function(err,rows,fields){
            if(err) {
                console.error(err);
                let obj = new Object;
                obj.msg="세트 추가 에러";
                res.send(obj);
            } else {
                let obj = new Object;
                obj.result="success";
                obj.SETSEQ=SETSEQ;
                res.send(obj);
            }
        });
    } else if(SAVGBN == "D") {
        let q = "delete from PRDSET where STOSEQ=? and SETSEQ=? and PRDSEQ=?;";
        connection.query(q, [STOSEQ, SETSEQ, PRDSEQ], function(err,rows,fields){
            if(err) {
                console.error(err);
                let obj = new Object;
                obj.msg="세트 삭제 에러";
                res.send(obj);
            } else {
                let obj = new Object;
                obj.result="success";
                obj.SETSEQ=SETSEQ;                
                res.send(obj);
            }
        });
    }

});
router.post('/pos/setup/dialog/set', function(req, res, next) {
    let STOSEQ = req.user.STOSEQ;
    let SETSEQ = req.body.SETSEQ;

    if(SETSEQ == "") {
        //신규
        res.render('dialog_setInsert');
    } else {
        //수정
        let q = "select * from SETMST where ID="+SETSEQ+";";
        connection.query(q, function(err, rows, fields){
            if(err) {
                console.error(err);
                let obj = new Object;
                obj.msg = "error";
                res.send(obj);
            } else {
                let SETNAM = rows[0].SETNAM;
                let TOTAMT = rows[0].SETCST;
                let SETEXP = rows[0].SETEXP;
                let SALFLG = rows[0].SALFLG;
                let ORDNUM = rows[0].ORDNUM;
                let SETIMG = rows[0].SETIMG;
                res.render('dialog_setUpdate', {SETSEQ: SETSEQ, SETNAM: SETNAM, TOTAMT: TOTAMT,
                                                SETEXP: SETEXP, SALFLG: SALFLG, ORDNUM: ORDNUM, SETIMG: SETIMG
                                                });
            }
        });
    }
});
router.post('/pos/setup/set_proc', function(req, res, next){
    let STOSEQ = req.user.STOSEQ;

    let SAVGBN = req.body.SAVGBN;
    let SETSEQ = req.body.SETSEQ;
    let SETNAM = req.body.SETNAM;
    let TOTAMT = req.body.TOTAMT;
    let SETIMG = req.body.SETIMG;
    let SETEXP = req.body.SETEXP;
    let SALFLG = req.body.SALFLG;
    let ORDNUM = req.body.ORDNUM;

    if(SAVGBN == "I") {
        //신규
        let q = "insert into SETMST(STOSEQ, SETNAM, SETCST, SETEXP, SALFLG, ORDNUM, SETIMG) values (?, ?, ?, ?, ?, ?, ?);";
        connection.query(q, [STOSEQ, SETNAM, TOTAMT, SETEXP, SALFLG, ORDNUM, SETIMG], function(err, rows, fields){
            if(err) {
                console.error(err);
                let obj = new Object;
                obj.msg = "error";
                res.send(obj);
            } else {
                let obj = new Object;
                obj.result = "success";
                res.send(obj);
            }
        });

    } else if(SAVGBN == "U"){
        // 수정
        let q = "update SETMST set SETNAM=?, SETCST=?, SETEXP=?, SALFLG=?, ORDNUM=?, SETIMG=? where ID="+SETSEQ+";";
        connection.query(q, [SETNAM, TOTAMT, SETEXP, SALFLG, ORDNUM, SETIMG], function(err, rows, fields){
            if(err) {
                console.error(err);
                let obj = new Object;
                obj.msg = "error";
                res.send(obj);
            } else {
                let obj = new Object;
                obj.result = "success";
                res.send(obj);
            }
        });
    }
});

//할인
router.get('/pos/setup/promotion', function(req, res, next){
    if(req.isAuthenticated()){
        res.render('promotion', {});
    } else {
        res.redirect('/login');
    }
});

//영업 시작
router.get('/pos/setup/saleStart', function(req, res, next){
    if(req.isAuthenticated()){
        let STOSEQ = req.user.STOSEQ;
        let q = "select * from SALMST where STOSEQ=? and ENDFLG='N';";

        connection.query(q, [STOSEQ], function(err, rows, fields){
            if(err) {
                console.error(err);
                res.send("<script> alert('에러 발생'); window.location.href='/';</script>");
            } else {
                if(rows.length == 0) {
                    console.log("영업 아님");
                    //영업 중 x
                    let date = new Date();
                    let sysdat = format(date, "yyyy-MM-dd hh:mm:ss");
                    res.render('saleStart', {sysdat: sysdat});    
                } else {
                    //영업 중
                    res.send("<script> alert('현재 영업중입니다'); window.location.href='/pos/setup/saleEnd';</script>");
                }
            }
        });
    } else {
        res.redirect('/login');
    }
});
router.post('/pos/setup/saleStart_proc', function(req, res, next){
    let STOSEQ = req.user.STOSEQ;
    let STRAMT = req.body.STRAMT;
    let q = "insert into SALMST(STOSEQ, STRTIM, ENDTIM, ENDFLG, STRAMT, ACTAMT, TBLAMT, TBLCNT, DLVAMT, DLVCNT, TOTAMT, CSHAMT, CRDAMT, DISAMT, REGDAT, REGUSR) values (?, now(), '', 'N', ?, 0, 0, 0, 0, 0, 0, 0, 0, 0, now(), ?);";

    connection.query(q, [STOSEQ, STRAMT, req.user.POSID], function(err, rows, fields){
        if(err){
            console.error(err);
            res.send("<script> alert('에러 발생'); window.location.href='/';</script>");
        } else {
            let obj = new Object();
            obj.result = "success";
            obj.msg = "영업 시작";
            res.send(obj);
        }
    });
});


//입출금
router.get('/pos/setup/saleAccount', function(req, res, next){
    if(req.isAuthenticated()){
        res.render('saleAccount', {});
    } else {
        res.redirect('/login');
    }
});

router.post('/pos/setup/saleAccount_select', function(req, res, next){
    if(req.isAuthenticated()){
        let STOSEQ = req.user.STOSEQ;
        let q = "select ID, SALSEQ, SIOCOD, SIONAM, date_format(SIODAT, '%Y/%m/%d %H:%i') as SIODAT, SIOAMT, REMARK from SALSIO where STOSEQ=? order by SIODAT";
        connection.query(q, [STOSEQ], function(err, rows, fields){
            if(err) {
                console.error(err);
                res.send("<script> alert('에러 발생'); window.location.href('/');</script>");
            } else {
                let SIO = [];
                for(let i=0; i<rows.length; i++){
                    let obj = new Object();
                    obj.SALSEQ = rows[i].SALSEQ;
                    obj.SIOSEQ = rows[i].ID;
                    obj.SIOCOD = rows[i].SIOCOD;
                    obj.SIONAM = rows[i].SIONAM;
                    obj.SIODAT = rows[i].SIODAT;
                    obj.SIOAMT = rows[i].SIOAMT;
                    obj.REMARK = rows[i].REMARK;
                    SIO.push(obj);
                }
                res.send(SIO);
            }
        });
    } else {
        res.redirect('/login');
    }
});

router.post('/pos/setup/dialog/saleAccount', function(req, res, next){
    if(req.isAuthenticated()) {
        res.render('dialog_saleAccount');
    } else {
        res.redirect('/login');
    }
});
router.post('/pos/setup/saleAccount_proc', function(req, res, next){
    if(req.isAuthenticated()){
        let STOSEQ = req.user.STOSEQ;
        let SIOCOD = req.body.SIOCOD;
        let SIOAMT = req.body.SIOAMT;
        let REMARK = req.body.REMARK;
        let SIONAM = "입금";
        let AMT = SIOAMT*1;
        if(SIOCOD == "O") {
            SIONAM = "출금";
            AMT = AMT*(-1);
        }
        let q1 = "select ID from SALMST where STOSEQ=? and ENDFLG='N';";
        connection.query(q1, [STOSEQ], function(err, rows, fields){
            if(err) {
                console.error(err);
                let obj = new Object();
                obj.msg = "영업 확인 오류";
                res.send(obj);
            } else {
                if(rows.length == 0) {
                    let obj = new Object();
                    obj.msg = "영업중이 아닙니다";
                    res.send(obj);
                } else {
                    let SALSEQ = rows[0].ID;
                    let q2 = "insert into SALSIO (STOSEQ, SALSEQ, SIOCOD, SIONAM, REMARK, SIODAT, SIOAMT, REGUSR) values (?, ?, ?, ?, ?, now(), ?, ?);"
                    connection.query(q2, [STOSEQ, SALSEQ, SIOCOD, SIONAM, REMARK, SIOAMT, req.user.POSID], function(err, rows2, fields){
                        if(err) {
                            console.error(err);
                            let obj = new Object();
                            obj.msg = "입출금 입력 오류";
                            res.send(obj);
                        } else {
                            let q3 = "update SALMST set ACTAMT=ACTAMT+? where ID=?";
                            connection.query(q3, [AMT, SALSEQ], function(err, rows, fields){
                                if(err){
                                    console.error(err);
                                    let obj = new Object();
                                    obj.msg = "입출금 입력 오류";
                                    res.send(obj);
                                } else {
                                    let obj = new Object();
                                    obj.result = "success";
                                    res.send(obj);
                                }
                            });
                        }
                    });
                }
            }
        });
    } else {
        res.redirect('/login');
    }
});


router.get('/pos/setup/saleCheck', function(req, res, next){
    if(req.isAuthenticated()){
        let STOSEQ = req.user.STOSEQ;
        let q = "select date_format(STRTIM, '%Y/%m/%d %H:%i:%s') as STRTIM, STRAMT, ACTAMT, TBLAMT, TBLCNT, DLVAMT, DLVCNT, TOTAMT, CSHAMT, CRDAMT, DISAMT from SALMST where STOSEQ=? and ENDFLG='N';";
        connection.query(q, [STOSEQ], function(err, rows, fields){
            if(err){
                console.error(err);
                res.send("<script> alert('에러 발생'); parent.location.href='/';</script>");
            } else {
                if(rows.length == 0) {
                    //영업중 아님
                    res.send("<script> alert('영업이 시작되지 않았습니다'); window.location.href='/pos/setup/saleStart';</script>");
                } else {
                    //영업중
                    let STRTIM = rows[0].STRTIM;
                    let STRAMT = rows[0].STRAMT;
                    let ACTAMT = rows[0].ACTAMT;
                    let TBLAMT = rows[0].TBLAMT;
                    let TBLCNT = rows[0].TBLCNT;
                    let DLVAMT = rows[0].DLVAMT;
                    let DLVCNT = rows[0].DLVCNT;
                    let TOTAMT = rows[0].TOTAMT;
                    let CSHAMT = rows[0].CSHAMT;
                    let CRDAMT = rows[0].CRDAMT;
                    let DISAMT = rows[0].DISAMT;

                    let TOTCNT = TBLCNT*1 + DLVCNT*1;

                    res.render('saleCheck', {STRTIM: STRTIM, STRAMT: STRAMT, ACTAMT: ACTAMT, TBLAMT: TBLAMT, TBLCNT: TBLCNT, DLVAMT: DLVAMT, DLVCNT: DLVCNT, 
                                            TOTCNT: TOTCNT, TOTAMT: TOTAMT, CSHAMT: CSHAMT, CRDAMT: CRDAMT, DISAMT: DISAMT});
                }
            }
        });
    } else {
        res.redirect('/login');
    }
});

//영업 종료
router.get('/pos/setup/saleEnd', function(req, res, next){
    if(req.isAuthenticated()){
        let STOSEQ = req.user.STOSEQ;
        let q = "select date_format(STRTIM, '%Y/%m/%d %H:%i:%s') as STRTIM, STRAMT, ACTAMT, TBLAMT, TBLCNT, DLVAMT, DLVCNT, TOTAMT, CSHAMT, CRDAMT, DISAMT from SALMST where STOSEQ=? and ENDFLG='N';";
        connection.query(q, [STOSEQ], function(err, rows, fields){
            if(err){
                console.error(err);
                res.send("<script> alert('에러 발생'); parent.location.href='/';</script>");
            } else {
                if(rows.length == 0) {
                    //영업중 아님
                    res.send("<script> alert('영업이 시작되지 않았습니다'); window.location.href='/pos/setup/saleStart';</script>");
                } else {
                    //영업중
                    let STRTIM = rows[0].STRTIM;
                    let STRAMT = rows[0].STRAMT;
                    let ACTAMT = rows[0].ACTAMT;
                    let TBLAMT = rows[0].TBLAMT;
                    let TBLCNT = rows[0].TBLCNT;
                    let DLVAMT = rows[0].DLVAMT;
                    let DLVCNT = rows[0].DLVCNT;
                    let TOTAMT = rows[0].TOTAMT;
                    let CSHAMT = rows[0].CSHAMT;
                    let CRDAMT = rows[0].CRDAMT;
                    let DISAMT = rows[0].DISAMT;

                    let TOTCNT = TBLCNT*1 + DLVCNT*1;

                    res.render('saleEnd', {STRTIM: STRTIM, STRAMT: STRAMT, ACTAMT: ACTAMT, TBLAMT: TBLAMT, TBLCNT: TBLCNT, DLVAMT: DLVAMT, DLVCNT: DLVCNT, 
                                            TOTCNT: TOTCNT, TOTAMT: TOTAMT, CSHAMT: CSHAMT, CRDAMT: CRDAMT, DISAMT: DISAMT});
                }
            }
        });
    } else {
        res.redirect('/login');
    }
});
router.post('/pos/setup/saleEnd_proc', function(req, res, next){
    if(req.isAuthenticated()) {
        let STOSEQ = req.user.STOSEQ;
        let q = "update SALMST set ENDTIM=now(), ENDFLG='Y' where STOSEQ=? and ENDFLG='N';";
        connection.query(q, [STOSEQ], function(err, rows, fields){
            if(err){
                console.error(err);
                res.send("<script> alert('에러 발생'); parent.location.href='/pos/setup/saleEnd';</script>");
            } else {
                let obj = new Object();
                obj.result = "success";
                obj.msg = "영업이 종료되었습니다";
                res.send(obj);
            }
        });
    } else {
        res.send("<script> alert('로그인 해주세요'); parent.location.href='/login';</script>");
    }
});

router.get('/pos/setup/saleList', function(req, res, next){
    if(req.isAuthenticated()){
        let now_date = new Date();
        let before_date = new Date();
        let before = new Date(before_date.getTime() - (60*60*24*7*1000));
        let n = format(now_date, "yyyy-MM-dd");
        let b = format(before, "yyyy-MM-dd");

        res.render('saleList', {STRDAT: b, ENDDAT: n});
    } else {
        res.redirect('/login');
    }
});
router.post('/pos/setup/saleList_select', function(req, res, next){
    if(req.isAuthenticated()) {
        let STOSEQ = req.user.STOSEQ;
        let STRDAT = req.body.STRDAT;
        let end_date = req.body.ENDDAT.split('-');
        end_date[1] = end_date[1]*1 + 1;
        let ENDDAT = end_date[0] + "-" + end_date[1] + "-" + end_date[2];

        let q = "select ID, date_format(STRTIM, '%Y/%m/%d %H:%i') as STRTIM, date_format(ENDTIM, '%Y/%m/%d %H:%i') as ENDTIM, TOTAMT, DLVCNT, DLVAMT, TBLCNT, TBLAMT from SALMST where STOSEQ=? and STRTIM >= ? and ENDTIM <= ? and ENDFLG='Y';";
        connection.query(q, [STOSEQ, STRDAT, ENDDAT], function(err, rows, fields){
            if(err){
                console.error(err);
                let obj = new Object();
                obj.msg = "조회에 실패했습니다";
                res.send(obj);
            } else {
                let saleList = [];
                for(let i=0; i<rows.length; i++){
                    let obj = new Object();
                    obj.SALSEQ = rows[i].ID;
                    obj.STRDAT = rows[i].STRTIM;
                    obj.ENDDAT = rows[i].ENDTIM;
                    obj.SALSTR = rows[i].TOTAMT;
                    obj.DLVSTR = rows[i].DLVCNT + " / " + rows[i].DLVAMT;
                    obj.TBLSTR = rows[i].TBLCNT + " / " + rows[i].TBLAMT;
                    saleList.push(obj);
                }
                res.send(saleList);
            }
        });
    } else {
        res.redirect('/login');
    }
});
router.post('/pos/setup/dialog/saleList', function(req, res, next){
    if(req.isAuthenticated()){
        let SALSEQ = req.body.SALSEQ;
        console.log(SALSEQ);
        let q = "select STRAMT, ACTAMT, CSHAMT, CRDAMT, DISAMT from SALMST where ID=?;";
        connection.query(q, [SALSEQ], function(err, rows, fields){
            if(err){
                console.error(err);
                res.send("<script> alert('불러오기 실패');</script>");
            } else {
                let STRAMT = rows[0].STRAMT;
                let ACTAMT = rows[0].ACTAMT;
                let CSHAMT = rows[0].CSHAMT;
                let CRDAMT = rows[0].CRDAMT;
                let DISAMT = rows[0].DISAMT;
                res.render('dialog_saleList', {STRAMT: STRAMT, ACTAMT: ACTAMT, CSHAMT: CSHAMT, CRDAMT: CRDAMT, DISAMT: DISAMT});
            }
        });
    } else {
        res.redirect('/login');
    }
});


router.get('/pos/setup/rcpnList', function(req, res, next){
    if(req.isAuthenticated()){
        let now_date = new Date();
        let before_date = new Date();
        let before = new Date(before_date.getTime() - (60*60*24*7*1000));
        let n = format(now_date, "yyyy-MM-dd");
        let b = format(before, "yyyy-MM-dd");

        res.render('rcpnList', {STRDAT: b, ENDDAT: n});
    } else {
        res.redirect('/login');
    }
});

router.post('/pos/setup/rcpnList_select', function(req, res, next){
    if(req.isAuthenticated()){
        let STOSEQ = req.user.STOSEQ;
        let STRDAT = req.body.STRDAT;
        let end_date = req.body.ENDDAT.split('-');
        end_date[1] = end_date[1]*1 + 1;
        let ENDDAT = end_date[0] + "-" + end_date[1] + "-" + end_date[2];

        let q = "select A.TOTAMT, A.TBLSEQ, B.PAYDAT, B.CSHAMT, B.CRDAMT, B.DISAMT from RCNMST as A ";
              + "left join RCNRCT as B on A.ID=B.RCNSEQ ";
              + "where A.STOSEQ=? and A.FINISH='Y';";
        
            
    } else {
        res.redirect('/login');
    }
});


router.get('/pos/setup/cardList', function(req, res, next){
    if(req.isAuthenticated()){
        let now_date = new Date();
        let before_date = new Date();
        let before = new Date(before_date.getTime() - (60*60*24*7*1000));
        let n = format(now_date, "yyyy-MM-dd");
        let b = format(before, "yyyy-MM-dd");

        res.render('cardList', {STRDAT: b, ENDDAT: n});
    } else {
        res.redirect('/login');
    }
});

//이벤트
router.get('/pos/setup/event', function(req, res, next){
    if(req.isAuthenticated()){
        res.render('event', {});
    } else {
        res.redirect('/login');
    }
});
router.post('/pos/setup/event_select', function(req, res, next){
    let STOSEQ = req.user.STOSEQ;

    let event = [];
    let q = "select A.ID, A.EVTNAM, date_format(A.EVTSTR, '%Y %m %d') as EVTSTR, date_format(A.EVTEND, '%Y %m %d') as EVTEND, B.FILURL, A.ORDNUM from EVTMST as A "
          + "left join EVTFIL_M as B on A.ID=B.EVTSEQ "
          + "where A.STOSEQ=? "
          + "order by ORDNUM;";
    connection.query(q, [STOSEQ], function(err, rows, fields){
        if(err) {
            console.error(err);
        } else {
            for(let i=0; i<rows.length; i++) {
                let obj = new Object;
                obj.EVTSEQ = rows[i].ID;
                obj.IMGTAG = "<img src='/images/"+ rows[i].FILURL +"' width='50px' />";
                obj.EVTNAM = rows[i].EVTNAM;
                obj.STRDAT = rows[i].EVTSTR;
                obj.ENDDAT = rows[i].EVTEND;
                obj.ORDNUM = rows[i].ORDNUM;
                obj.REMARK = "";
                event.push(obj);
            }
            res.send(event);
        }
    });

});
router.post('/pos/setup/dialog/event', function(req, res, next){
    let STOSEQ = req.user.STOSEQ;
    let EVTSEQ = req.body.EVTSEQ;

    if(EVTSEQ == "") {
        //신규
        let today = format(new Date(), 'yyyy-MM-dd');
        let nextMonth = format_next(new Date(), 'yyyy-MM-dd');
        let q2 = "select ID, PRDNAM from PRDMST where STOSEQ=?;";
        connection.query(q2, [STOSEQ], function(err, rows2, fields){
            if(err){
                console.error(err);
            } else {
                let products = [];
                let tmp = new Object;
                tmp.PRDSEQ = 0;
                tmp.PRDNAM = " ";
                products.push(tmp);
                for(let j=0; j<rows2.length; j++) {
                    let obj = new Object;
                    obj.PRDSEQ = rows2[j].ID;
                    obj.PRDNAM = rows2[j].PRDNAM;
                    products.push(obj);
                }
                res.render('dialog_eventInsert', {SAVGBN: "I", STRDAT: today, ENDDAT: nextMonth, PRODUCT: products});
            }
        });
    } else {
        //수정
        console.log(EVTSEQ);
        console.log(STOSEQ);
        let q = "select A.EVTNAM, date_format(A.EVTSTR, '%Y-%m-%d') as EVTSTR, date_format(A.EVTEND, '%Y-%m-%d') as EVTEND, A.ORDNUM as EVTORD, "
              + "B.FILURL as EVMFIL, C.FILTYP, C.FILURL as EVDFIL, C.PRDSEQ, C.ORDNUM as FILORD from EVTMST as A "
              + "left join EVTFIL_M as B on B.EVTSEQ=A.ID "
              + "left join EVTFIL_D as C on C.EVTSEQ=A.ID "
              + "where A.STOSEQ=? and A.ID=? and C.FILTYP='P' order by A.ORDNUM, C.ORDNUM;";
        connection.query(q, [STOSEQ, EVTSEQ], function(err, rows, fields){
            if(err) {
                console.error(err);
            } else {
                console.log(rows);
                let EVTNAM = rows[0].EVTNAM;
                let EVTSTR = rows[0].EVTSTR;
                let EVTEND = rows[0].EVTEND;
                let EVTORD = rows[0].EVTORD;
                let EVMFIL = rows[0].EVMFIL;
                let EVDFIL = [];
                for(let i=0; i<rows.length; i++) {
                    let obj = new Object;
                    obj.FILURL = rows[i].EVDFIL;
                    obj.FILORD = rows[i].FILORD;
                    obj.PRDSEQ = rows[i].PRDSEQ;
                    EVDFIL.push(obj);
                }
                let q2 = "select ID, PRDNAM from PRDMST where STOSEQ=?;";
                connection.query(q2, [STOSEQ], function(err, rows2, fields){
                    if(err){
                        console.error(err);
                    } else {
                        let products = [];
                        let tmp = new Object;
                        tmp.PRDSEQ = 0;
                        tmp.PRDNAM = " ";
                        products.push(tmp);
                        for(let j=0; j<rows2.length; j++) {
                            let obj = new Object;
                            obj.PRDSEQ = rows2[j].ID;
                            obj.PRDNAM = rows2[j].PRDNAM;
                            products.push(obj);
                        }
                        res.render('dialog_eventUpdate', {EVTSEQ: EVTSEQ, EVTNAM: EVTNAM, STRDAT: EVTSTR, ENDDAT: EVTEND,
                                                          ORDNUM: EVTORD, EVTMIMG: EVMFIL, EVDFIL: EVDFIL, PRODUCT: products, DTLNUM: rows.length});
                    }
                });

               
            }
        });

    }
});
router.post('/pos/setup/event_proc', function(req, res, next){
    let STOSEQ = req.user.STOSEQ;
    let SAVGBN = req.body.SAVGBN;

    if(SAVGBN == "I") {
        let EVTNAM = req.body.EVTNAM;
        let EVTSTR = req.body.STRDAT;
        let EVTEND = req.body.ENDDAT;
        let EVMIMG = req.body.EVMIMGNAME;
        let EVDIMG = req.body.EVDIMGNAME;
        let DTLPRD = req.body.DTLPRD;
        let ORDNUM = req.body.ORDNUM;
        let IMGORD = req.body.IMGORDNUM;

        if(_.isArray(EVDIMG)) {
            let q = "insert into EVTMST(STOSEQ, EVTNAM, EVTSTR, EVTEND, ORDNUM, REGUSR, REGDAT) values (?,?,?,?,?,?, now());";
            connection.query(q, [STOSEQ, EVTNAM, EVTSTR, EVTEND, ORDNUM, req.user.POSID], function(err, rows, fields){
                if(err) {
                    console.error(err);
                } else {
                    let EVTSEQ = rows.insertId;
                    let q2 = "insert into EVTFIL_M(STOSEQ, EVTSEQ, FILURL) values (?, ?, ?);";
                    connection.query(q2, [STOSEQ, EVTSEQ, EVMIMG], function(err, rows2, fields2){
                        if(err) {
                            console.error(err);
                        } else {
                            for(let i=0; i<EVDIMG.length; i++) {
                                run_query("insert into EVTFIL_D(STOSEQ, EVTSEQ, FILTYP, FILURL, PRDSEQ, ORDNUM) values ("+STOSEQ+", "+EVTSEQ+", 'P', '"+EVDIMG[i]+"', "+DTLPRD[i]+", "+IMGORD[i]+");", "");
                            }
                            let obj = new Object();
                            obj.result = "success";
                            res.send(obj);
                        }
                    });
                }
            });
        } else {
            let q = "insert into EVTMST(STOSEQ, EVTNAM, EVTSTR, EVTEND, ORDNUM, REGUSR, REGDAT) values (?,?,?,?,?,?, now());";
            connection.query(q, [STOSEQ, EVTNAM, EVTSTR, EVTEND, ORDNUM, req.user.POSID], function(err, rows, fields){
                if(err) {
                    console.error(err);
                } else {
                    let EVTSEQ = rows.insertId;
                    let q2 = "insert into EVTFIL_M(STOSEQ, EVTSEQ, FILURL) values (?, ?, ?);";
                    connection.query(q2, [STOSEQ, EVTSEQ, EVMIMG], function(err, rows2, fields2){
                        if(err) {
                            console.error(err);
                        } else {
                            run_query("insert into EVTFIL_D(STOSEQ, EVTSEQ, FILTYP, FILURL, PRDSEQ, ORDNUM) values ("+STOSEQ+", "+EVTSEQ+", 'P', '"+EVDIMG+"', "+DTLPRD+", "+IMGORD+");", "");
                            
                            let obj = new Object();
                            obj.result = "success";
                            res.send(obj);
                        }
                    });
                }
            });
        }
    } else if(SAVGBN == "U") {
        let EVTSEQ = req.body.EVTSEQ;
        let EVTNAM = req.body.EVTNAM;
        let EVTSTR = req.body.STRDAT;
        let EVTEND = req.body.ENDDAT;
        let ORDNUM = req.body.ORDNUM;
        
        let EVMIMG = req.body.EVMIMGNAME;
        let EVDIMG = req.body.EVDIMGNAME;
        let DTLPRD = req.body.DTLPRD;
        let IMGORD = req.body.IMGORDNUM;

        let q = "update EVTMST set EVTNAM=?, EVTSTR=?, EVTEND=?, ORDNUM=?, MODUSR=?, MODDAT=now() where ID=" +EVTSEQ+ ";";
        connection.query(q, [EVTNAM, EVTSTR, EVTEND, ORDNUM, req.user.POSID], function(err, rows, fields){
            if(err) {
                console.error(err);
                let obj = new Object();
                obj.msg = "error1";
                res.send(obj);
            } else {
                let q2 = "update EVTFIL_M set FILURL='"+ EVMIMG +"' where EVTSEQ="+EVTSEQ+";";
                connection.query(q2, function(err, rows, fields){
                    if(err){
                        console.error(err);
                        let obj = new Object();
                        obj.msg = "error2";
                        res.send(obj);
                    }
                });
                let q3 = "delete from EVTFIL_D where EVTSEQ="+ EVTSEQ +";";
                connection.query(q3, function(err, rows, fields){
                    if(err){
                        console.error(err);
                        let obj = new Object();
                        obj.msg = "error3";
                        res.send(obj);
                    } else {
                        if(_.isArray(EVDIMG)){
                            let q4 = "insert into EVTFIL_D(STOSEQ, EVTSEQ, FILTYP, FILURL, PRDSEQ, ORDNUM) values (?, ?, 'P', ?, ?, ?);";
                            for(let i=0; i<EVDIMG.length; i++) {
                                connection.query(q4, [STOSEQ, EVTSEQ, EVDIMG[i], DTLPRD[i], IMGORD[i]], function(err, rows, fields){
                                    if(err) {
                                        console.error(err);
                                        let obj = new Object();
                                        obj.msg = "error" + (i+4);
                                        res.send(obj);
                                    }
                                });
                            }
                            let obj = new Object();
                            obj.result = "success";
                            res.send(obj);
                        } else {
                            let q4 = "insert into EVTFIL_D(STOSEQ, EVTSEQ, FILTYP, FILURL, PRDSEQ, ORDNUM) values (?, ?, 'P', ?, ?, ?);";
                            connection.query(q4, [STOSEQ, EVTSEQ, EVDIMG, DTLPRD, IMGORD], function(err, rows, fields){
                                if(err) {
                                    console.error(err);
                                    let obj = new Object();
                                    obj.msg = "error4";
                                    res.send(obj);
                                } else {
                                    let obj = new Object();
                                    obj.result = "success";
                                    res.send(obj);
                                }
                            });
                        }
                    }
                });
            }
        });
    } else if(SAVGBN == "D") {
        let EVTSEQ = req.body.EVTSEQ;
        let q1 = "delete from EVTFIL_M where EVTSEQ="+ EVTSEQ +";";
        let q2 = "delete from EVTFIL_D where EVTSEQ="+ EVTSEQ +";";
        let q3 = "delete from EVTMST where ID="+EVTSEQ+";";

        run_query(q1, "");
        run_query(q2, "");
        run_query(q3, "");
        
        let obj = new Object();
        obj.result = "success";
        res.send(obj);
    }
});

//호출 조회
router.get('/pos/setup/reload_call', function(req, res, next){
    if(req.isAuthenticated()) {
        let STOSEQ = req.user.STOSEQ;

        let q = "select A.ID, A.CALNAM, A.USERID, C.FLRNAM, B.TBLNAM from CALMST as A left join TBLSTO as B on A.TBLSEQ=B.ID "
              + "left join STOFLR as C on C.ID=B.FLRSEQ "
              + "where A.STOSEQ=? and A.CALTYP='C' and CHKFLG='N' order by A.REGDAT desc;";
        
        connection.query(q, [STOSEQ], function(err, rows, fields){
            if(err){
                console.error(err);
            } else {
                let call = [];
                for(let i=0; i<rows.length; i++) {
                    let obj = new Object();
                    obj.CALSEQ = rows[i].ID;
                    obj.CALNAM = "[" + rows[i].FLRNAM + "-" + rows[i].TBLNAM + "] " + rows[i].CALNAM;
                    call.push(obj); 
                }
                res.send(call);
            }
        });
    } else {
        res.redirect('/login');
    }
});
//호출 확인
router.post('/pos/sale/call_update', function(req, res, next){
    if(req.isAuthenticated()) {
        let CALSEQ = req.body.CALSEQ;
        let q = "update CALMST set CHKFLG='Y' where ID=?";
        connection.query(q, [CALSEQ], function(err, rows, fields){
            if(err) {
                console.error(err);
            } else {
                let obj = new Object();
                obj.flag= true;
                res.send(obj);
            }
        });
    } else {
        res.redirect('/login');
    }   
});




//테이블 페이지
router.get('/pos/sale/sale', function(req, res, next){
    console.log(req.query);
    if(req.isAuthenticated()){
        if(req.query.RCNTYP && req.query.FLRSEQ) {
            let STOSEQ = req.user.STOSEQ;
            let RCNTYP = req.query.RCNTYP;
            let FLRSEQ = req.query.FLRSEQ;
            if(RCNTYP=="T") {
                let q = "select * from STOFLR where STOSEQ=? order by ORDNUM;";
                connection.query(q, [STOSEQ], function(err, rows, fields){
                    if(err) {
                        console.error(err);
                    } else {  
                        //모든 층
                        let floors = [];
                        let selected = FLRSEQ;
                        for(let i=0; i<rows.length; i++) {
                            let obj = new Object();
                            obj.FLRSEQ = rows[i].ID;
                            obj.FLRNAM = rows[i].FLRNAM;
                            floors.push(obj);
                        }
                        
                        let q2 = "select * from TBLSTO where STOSEQ=? FLRSEQ=?;";
                        connection.query(q2, [STOSEQ, FLRSEQ], function(err, rows2, fields){
                            if(err) {
                                console.error(err);
                            } else {
                                //선택 층 테이블
                                let tables = [];
                                for(let i=0; i<rows2.length; i++) {
                                    let obj = new Object();
                                    obj.TBLSEQ = rows2[i].ID;
                                    obj.TBLNAM = rows2[i].TBLNAM;
                                    obj.NOWUSE = rows2[i].NOWUSE;
                                    tables.push(obj);
                                }
                                
                                let tableChunks = [];
                                for(let i=0; i< Math.ceil(tables.length / 6); i++) {
                                    tableChunks.push(tables.slice(6*i, 6*(i+1)));
                                }

                                res.render('sale', {FLOORS: floors, TABLES: tableChunks, TAB: selected});
                            }
                        });
                    }
                });
            } else if(RCNTYP=="D") {

            }
        } else {
            res.render('sale', {});   
        }
    } else {
        res.redirect('/login');
    }
});
router.post('/pos/sale/dialog/saleStart', function(req, res, next){
    
});

router.get('/temp', function (req, res, next) {

    // run_query(create.ADMMST(),"");
    // run_query(create.CATMST(),"");
    // run_query(create.EVTFIL_D(),"");
    // run_query(create.EVTFIL_M(),"");
    // run_query(create.EVTMST(),"");
    // run_query(create.OPTCAT(),"");
    // run_query(create.OPTMST(),"");
    // run_query(create.OPTSET(),"");
    // run_query(create.PRDFIL_D(),"");
    // run_query(create.PRDFIL_M(),"");
    // run_query(create.PRDMST(),"");
    // run_query(create.PRDOPT(),"");
    // run_query(create.PRDSET(),"");
    // run_query(create.RCNDET(),"");
    // run_query(create.RCNMST(),"");
    // run_query(create.SETMST(),"");
    // run_query(create.STODVC(),"");
    // run_query(create.STOFLR(),"");
    // run_query(create.TBLSTO(),"");
    // run_query(create.NCALL2(),"");
    // run_query(create.NCALL2INFO(),"");
    // run_query(create.POSMST(),"");
    // run_query(create.STOMST(),"");
    // run_query(create.USRMST(),"");
    // run_query(create.STOCAL(),"");

    // run_query(create.SALMST(),"");
    // run_query(create.SALSIO(),"");

    // run_query(create.RCNDET(), "완료");
    // run_query(create.OPTSET(), "완료");
    // run_query("drop table CALMST;", "완료");
    // run_query(create.CALMST(), "완료");

    // run_query(create.NCALL(), "완료");
    // run_query(create.NCALLADV(), "완료");
    // run_query("insert into NCALL (STOSEQ, ALMGBN, ALMTIM, ALMADV) values (1, 0, 15, 'N');", "완료");

    // run_query("delete from RCNMST where ID=9");
    // run_query("update RCNMST set CHKFLG='N', PAYFLG='N', FINISH='N'");
    // run_query("alter table USRMST add USRGRD int null;", "완료");
    // run_query("update USRMST set USRGRD=1;", "완료");

    // run_query("update RCNMST set REGDAT=now()", "완료");

    // run_query("alter table RCNMST add column ORDCNT int NULL;", "완료");
    // run_query("delete from OPTSET;");
    // run_query("delete from RCNDET;");
    // run_query("delete from RCNMST;");

    // run_query("alter table CALMST change `CALNAM` `CALNAM` varchar(100) character set utf8 null;", "완료");
    // run_query("insert into NCALL2INFO (STOSEQ, TYPE, SHOWTIME) values (1, '', 2);", "완료");
    
    // run_query("update USRMST set MOBNUM='01098008504' where ID=3;", "완료");
    // run_query(create.APPVERSION(), "완료");

    // run_query("insert into NCALL (STOSEQ, ALMGBN, ALMTIM, ALMADV) values (1, 0, 15, 'N');", "완료");
    // run_query("insert into NCALL2INFO (STOSEQ, TYPE, SHOWTIME) values (1, '', 2);", "완료");
    
    // run_query("insert into APPVERSION (APPNAM, VERSION, MODDAT) values ('NSTAR2.0', 1, now());", "완료");
    // run_query("insert into APPVERSION (APPNAM, VERSION, MODDAT) values ('NPOS2.0', 1, now());", "완료");
    // run_query("insert into APPVERSION (APPNAM, VERSION, MODDAT) values ('NCALL2.0', 1, now());", "완료");
    // run_query("insert into APPVERSION (APPNAM, VERSION, MODDAT) values ('NCALL3.0', 1, now());", "완료");
    
    // run_query("update USRMST set MOBNUM='01026861104' where ID=4;", "완료");

    // run_query("delete from EVTMST where ID=12;");
    // run_query("delete from EVTFIL_M where ID=12;");

    // run_query("alter table RCNMST add column PAYDAT DATETIME NULL;");
    // run_query("alter table RCNMST add column SALDAT DATETIME NULL;");
    // run_query("update RCNMST set PAYDAT=now(), SALDAT=now() where PAYFLG='Y' and FINISH='Y';");

    res.redirect('/dbcheck');
}); 

// router.post('/temp2', function(req, res, next){
//     let CHFNAM = req.body.CHFNAM;
//     let STONAM = req.body.STONAM;

//     connection.query("update STOMST set CHFNAM=?, STONAM=? where ID=1;", [CHFNAM, STONAM], function(err, rows, fields){
//         if(err) {
//             console.error(err);
//         } else {
//             res.send("완료");
//         }
//     });
//     run_query("delete from OPTSET;");
//     run_query("delete from RCNDET;");
//     run_query("delete from RCNMST;");
    
// });

//POST pages
router.post('/addstore_p', function (req, res, next) {
    //가게등록
    var body = req.body;

    var REGNUM = body.REGNUM;
    let CHFNAM = body.CHFNAM;
    var STOTYP = body.STOTYP;
    var STOITM = body.STOITM;
    var STONAM = body.STONAM;
    var STLOGO = body.STLOGO;
    var STOTEL = body.STOTEL;
    var STOFAX = body.STOFAX;
    var STOEML = body.STOEML;
    var STOHPG = body.STOHPG;
    var STOZIP = body.STOZIP;
    var STOADD = body.STOADD;
    var STDADD = body.STDADD;
    var STOSTR = body.STOSTR;
    var STOEND = body.STOEND;
    var SALMTH = body.SALMTH;
    var CPNSEQ = body.CPNSEQ;

    var query = "INSERT INTO STOMST (REGNUM, CHFNAM, STOTYP, STOITM, STONAM, STLOGO, STOTEL, STOFAX, STOEML, STOHPG, STOZIP, STOADD, STDADD, STOSTR, STOEND, SALMTH, REGDAT, CPNSEQ) VALUES ('" + REGNUM + "', '" + CHFNAM + "', '" + STOTYP + "', '" + STOITM + "', '" + STONAM + "', '" + STLOGO + "', '" + STOTEL + "', '" + STOFAX + "', '" + STOEML + "', '" + STOHPG + "', '" + STOZIP + "', '" + STOADD + "', '" + STDADD + "', '" + STOSTR + "', '" + STOEND + "', '" + SALMTH + "', now(), " + CPNSEQ + ");";
    connection.query(query, function(err, rows, fields){
        if(err){
            console.error(err);
        } else {
            res.send("완료");
        }
    });

    // connection.query(query, function (err, results, fields) {
    //     if (err) {
    //         console.error(err);
    //     } else {
    //         var id = results.insertId;
    //         run_query(create.STOCAL(id), "1 STOCAL CREATED");
    //         run_query(create.TBLSTO(id), "2 TBLSTO CREATED");
    //         run_query(create.STOFLR(id), "3 STOFLR CREATED");
    //         run_query(create.STODVC(id), "4 STODVC CREATED");
    //         run_query(create.DLVSTO(id), "5 DLVSTO CREATED");
    //         run_query(create.ALRADV(id), "6 ALRADV CREATED");
    //         run_query(create.POSRPS(id), "7 POSRPS CREATED");
    //         run_query(create.EVTFIL_M(id), "8 EVTFIL_M CREATED");
    //         run_query(create.EVTFIL_D(id), "9 EVTFIL_D CREATED");
    //         run_query(create.PRDFIL_M(id), "10 PRDFIL_M CREATED");
    //         run_query(create.PRDFIL_D(id), "11 PRDFIL_D CREATED");
    //         run_query(create.PRDOPT(id), "12 PRDOPT CREATED");
    //         run_query(create.OPTMST(id), "13 OPTMST CREATED");
    //         run_query(create.EVTMST(id), "14 EVTMST CREATED");
    //         run_query(create.PRDSET(id), "15 PRDSET CREATED");
    //         run_query(create.USRSAL(id), "16 USRSAL CREATED");
    //         run_query(create.RCNOPT(id), "17 RCNOPT CREATED");
    //         run_query(create.PRDMST(id), "18 PRDMST CREATED");
    //         run_query(create.SALPRD(id), "19 SALPRD CREATED");
    //         run_query(create.SALMST(id), "20 SALMST CREATED");
    //         run_query(create.CATMST(id), "21 CATMST CREATED");
    //         run_query(create.OPTCAT(id), "22 OPTCAT CREATED");

    //         //주문
    //         run_query(create.RCNMST(id), "23 RCNMST CREATED");
    //         run_query(create.OPTSET(id), "24 OPTSET CREATED");
    //         run_query(create.RCNDET(id), "25 RCNDET CREATED");
            
    //         res.send("<p> 등록 완료 </p>");
    //     }
    // });


});

router.post('/adduser_p', function (req, res, next) {
    var body = req.body;

    var USERID = body.USERID;
    var USERPW = body.USERPW;
    var USRNAM = body.USRNAM;
    var MOBNUM = body.MOBNUM;
    var BIRDAY = body.BIRDAY;
    var SEXCOD = body.SEXCOD;
    var EMLADD = body.EMLADD;
    var REGSTO = body.REGSTO;

    var query = "INSERT INTO USRMST (USERID, USERPW, USRNAM, MOBNUM, BIRDAY, SEXCOD, EMLADD, FCMTOK, REGDAT, REGSTO) VALUES ('" + USERID + "', '" + USERPW + "', '" + USRNAM + "', '" + MOBNUM + "', '" + BIRDAY + "', '" + SEXCOD + "', '" + EMLADD + "', NULL, NOW(), '" + REGSTO + "');"

    connection.query(query, function (err, rows, fields) {
        if (err) { console.error(err); }
        else {
            console.log(rows);
            res.send("<p> 등록 완료 </p>");
        }
    });
});

router.post('/addfloor_p', function (req, res, next) {
    var body = req.body;

    // STOSEQ != 0
    var STOSEQ = body.STOSEQ;
    var FLRNAM = body.FLRNAM;
    var ORDNUM = body.ORDNUM;

    var query = "INSERT INTO " + STOSEQ + "_STOFLR (FLRNAM, ORDNUM) VALUES ('" + FLRNAM + "', " + ORDNUM + ");";

    console.log(query);
    connection.query(query, function (err, rows, fields) {
        if (err) console.error(err);
        console.log(rows);
        res.send("<p> 등록 완료 </p>");
    });
});

router.post('/addvan_p', function (req, res, next) {
    var body = req.body;

    // STOSEQ != 0
    var STOSEQ = body.STOSEQ;
    var VANCOD = body.VANCOD;
    var VANNUM = body.VANNUM;
    var REGUSR = body.REGUSR;

    var query = "INSERT INTO STOVAN (STOSEQ, VANCOD, VANNUM, REGDAT, REGUSR) VALUES ('" + STOSEQ + "', '" + VANCOD + "', '" + VANNUM + "', NOW(), '" + REGUSR + "');";

    connection.query(query, function (err, rows, fields) {
        if (err) console.error(err);
        console.log(rows);
        res.send("<p> 등록 완료 </p>");
    });
});

router.post('/addpos_p', function (req, res, next) {
    var body = req.body;

    var STOSEQ = body.STOSEQ;
    var POSID = body.POSID;
    var POSPW = body.POSPW;
    var CPNSEQ = body.CPNSEQ;
    var REGDAT = "now()";
    var MODUSR = body.MODUSR;
    var USEWEB = body.USEWEB;
    var USEAPP = body.USEAPP;
    var USEALR = body.USEALR;
    var USECAL = body.USECAL;

    var query = "INSERT INTO POSMST (STOSEQ, POSID, POSPW, CPNSEQ, REGDAT, MODDAT, MODUSR, USEWEB, USEAPP, USEALR, USECAL) VALUES ('" + STOSEQ + "', '" + POSID + "', '" + POSPW + "', '" + CPNSEQ + "', " + REGDAT + ", NULL, '" + MODUSR + "', '" + USEWEB + "', '" + USEAPP + "', '" + USEALR + "', '" + USECAL + "');";

    connection.query(query, function (err, rows, fields) {
        if (err) {console.error(err);}
        else {
            console.log(rows);
            res.send("<p> 등록 완료 </p>");
        }
    });
});

router.post('/addadmin_p', function (req, res, next) {
    var ADMID = req.body.ADMID;
    var ADMPW = req.body.ADMPW;
    var ADMNAM = req.body.ADMNAM;

    var query = "INSERT INTO ADMMST (ADMID, ADMPW, ADMNAM) VALUES ('" + ADMID + "', '" + ADMPW + "', '" + ADMNAM + "');";
    connection.query(query, function (err, rows, fields) {
        if (err) console.error(err);
        console.log(rows);
        res.send("<p> 등록 완료 </p>");
    });

});

router.post('/addcpn_p', function (req, res, next) {
    var body = req.body;

    var CPNNAM = body.CPNNAM;
    var CPNID = body.CPNID;
    var CPNPW = body.CPNPW;
    var CPNTEL = body.CPNTEL;
    var CPNZIP = body.CPNZIP;
    var CPNADD = body.CPNADD;
    var CPDADD = body.CPDADD;
    var CPNCOD = body.CPNCOD;
    var REGDAT = 'now()';

    var query = "INSERT INTO CPNMST (CPNNAM, CPNID, CPNPW, CPNTEL, CPNZIP, CPNADD, CPDADD, CPNCOD, REGDAT) VALUES ('" + CPNNAM + "', '" + CPNID + "', '" + CPNPW + "', '" + CPNTEL + "', '" + CPNZIP + "', '" + CPNADD + "', '" + CPDADD + "', '" + CPNCOD + "', " + REGDAT + ");";

    connection.query(query, function (err, rows, fields) {
        if (err) console.error(err);
        console.log(rows);
        res.send("<p> 등록 완료 </p>");
    });
});

router.post('/addtable_p', function (req, res, next) {
    var STOSEQ = req.body.STOSEQ;
    var FLRSEQ = req.body.FLRSEQ;
    var TBLNAM = req.body.TBLNAM;
    var NOWUSE = 'N';
    var LSTUSR = 'NULL';

    var query = "INSERT INTO " + STOSEQ + "_TBLSTO (FLRSEQ, TBLNAM, NOWUSE, LSTUSR) VALUES (" + FLRSEQ + ", '" + TBLNAM + "', '" + NOWUSE + "', " + LSTUSR + ");";

    run_query(query, "INSERT " + STOSEQ + "_TBLSTO 완료");
    res.send("<p> 등록 완료 </p>");
});

router.post('/addproduct_p', upload.array('PRDIMG'), function (req, res, next) {

    var body = req.body;

    var CATSEQ = body.CATSEQ;
    if (CATSEQ == 0) {
        res.send("<script language=\"javascript\">alert('카테고리를 등록 해주세요')</script>");
    } else {
        //제품 정보 등록
        var PRDNAM = body.PRDNAM;
        var PRDCST = body.PRDCST;
        var PRDEXP = body.PRDEXP;
        var SALFLG = body.SALFLG;
        var DISCNT = "NULL";
        var CTRCOD = body.CTRCOD;
        var ORDNUM = body.ORDNUM;
        var REGDAT = "NOW()";
        var REGUSR = req.user.POSID;
        var MODUSR = "NULL";
        var OPTCAT = body.OPTCAT;

        var PRESEQ;

        var query = "INSERT INTO " + req.user.STOSEQ + "_PRDMST (CATSEQ, PRDNAM, PRDCST, PRDEXP, SALFLG, DISCNT, CTRCOD, ORDNUM, REGDAT, REGUSR, MODUSR) VALUES (" + CATSEQ + ", '" + PRDNAM + "', " + PRDCST + ", '" + PRDEXP + "', '" + SALFLG + "', " + DISCNT + ", '" + CTRCOD + "', " + ORDNUM + ", " + REGDAT + ", '" + REGUSR + "', '" + MODUSR + "');";

        connection.query(query, function (err, rows, fields) {
            if (err) console.error(err);

            //카테고리 수 Update
            connection.query("UPDATE " + req.user.STOSEQ + "_CATMST SET CATNUM = CATNUM+1 WHERE ID='" + CATSEQ + "';", function (err, rows, fields) {
                if (err) console.error(err);

            });
            PRDSEQ = rows.insertId;

            //제품 사진 등록
            var fileList = req.files;
            var fileLength = req.files.length;

            var mainImage = fileList[0];
            fileList.splice(0, 1);
            var detailImage = fileList;

            console.log(mainImage);
            console.log(detailImage);

            run_query("INSERT INTO " + req.user.STOSEQ + "_PRDFIL_M (PRDSEQ, FILURL) VALUES (" + PRDSEQ + ", '" + mainImage.filename + "');", "메인 이미지 등록 완료");
            for (var i = 0; i < detailImage.length; i++) {
                run_query("INSERT INTO " + req.user.STOSEQ + "_PRDFIL_D (PRDSEQ, FILTYP, FILURL, ORDNUM) VALUES (" + PRDSEQ + ", 'P', '" + detailImage[i].filename + "', 1);", "제품 상세 이미지 등록 완료");
            }
            for (var i = 0; i < OPTCAT.length; i++) {
                run_query("INSERT INTO " + req.user.STOSEQ + "_PRDOPT (PRDSEQ, OPTCAT) VALUES (" + PRDSEQ + ", " + OPTCAT[i] + ");")
            }

            console.log("제품 등록 완료");
            res.send("<p> 등록 완료 </p>");
        });

    }
});

router.post('/addcategory_p', upload.single('CATFIL'), function (req, res, next) {
    var body = req.body;
    var CATNAM = body.CATNAM;
    var CATNUM = 0;
    var CATFIL = req.file.filename;
    var ORDNUM = body.ORDNUM;
    var REGDAT = "NOW()";

    var query = "INSERT INTO " + req.user.STOSEQ + "_CATMST (CATNAM, CATNUM, CATFIL, REGDAT, ORDNUM) VALUES ('" + CATNAM + "', " + CATNUM + ", '" + CATFIL + "', " + REGDAT + ", " + ORDNUM + ");";

    connection.query(query, function (err, rows, fields) {
        if (err) console.error(err);
        res.send("<p> 등록 완료 </p>");
    });
});

router.post('/addoption_p', function (req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.redirect('/login');
    }
}, function (req, res, next) {
    var body = req.body;
    var stoseq = req.user.STOSEQ;
    var OPTCATNAM = body.CATNAM;
    var OPTNAM = body.OPTNAM;
    var OPTCST = body.OPTCST;

    var OPTCAT_ID;
    var query = "INSERT INTO " + stoseq + "_OPTCAT (CATNAM) VALUES ('" + OPTCATNAM + "');";
    connection.query(query, function (err, rows, fields) {
        if (err) throw (err);
        OPTCAT_ID = rows.insertId;
        if (OPTNAM.length == OPTCST.length) {
            for (var i = 0; i < OPTNAM.length; i++) {
                var q = "INSERT INTO " + stoseq + "_OPTMST (OPTCAT, OPTNAM, OPTCST, REGDAT, REGUSR) VALUES (" + OPTCAT_ID + ", '" + OPTNAM[i] + "', " + OPTCST[i] + ", NOW(), '" + req.user.POSID + "');";
                run_query(q, "");
            }
        }
        res.send("<p> 등록 완료 </p>");
    });
});

router.post('/addset_p', function (req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.redirect('/login');
    }
}, function (req, res, next) {
    var stoseq = req.user.STOSEQ;
    var body = req.body;

    var SETNAM = body.SETNAM;
    var PRDSEQ = body.PRDSEQ;
    var SETCST = body.SETCST;

    connection.query("INSERT INTO " + stoseq + "_SETMST (SETNAM, SETCST) VALUES ('" + SETNAM + "', " + SETCST + ");", function (err, rows, fields) {
        if (err) console.error(err);
        var SETSEQ = rows.insertId;

        for (var i = 0; i < PRDSEQ.length; i++) {
            run_query("INSERT INTO " + stoseq + "_PRDSET (SETSEQ, PRDSEQ) VALUES (" + SETSEQ + ", " + PRDSEQ[i] + ");", "SET 등록 완료");
        }

        res.send("<p> 등록 완료  </p>");
    });

});

router.post('/addevent_p', upload.array('EVTIMG'), function (req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.redirect('/login');
    }
}, function (req, res, next) {
    var stoseq = req.user.STOSEQ;
    var body = req.body;

    var EVTNAM = body.EVTNAM;
    var EVTSTR = body.EVTSTR;
    var EVTEND = body.EVTEND;
    var ORDNUM = body.ORDNUM;
    var EVTIMG = req.files;
    var EVTVDO = req.body.VDOURL;
    var PRDSEQ = body.PRDSEQ;
    var REGDAT = "NOW()";
    var REGUSR = req.user.USERID;

    var q = "INSERT INTO " + stoseq + "_EVTMST (EVTNAM, EVTSTR, EVTEND, ORDNUM, REGUSR, REGDAT, MODUSR, MODDAT) VALUES ('" + EVTNAM + "', '" + EVTSTR + "', '" + EVTEND + "', " + ORDNUM + ", '" + REGUSR + "', " + REGDAT + ", NULL, NULL);"
    connection.query(q, function (err, rows, fields) {
        if (err) console.error(err);
        var EVTSEQ = rows.insertId;
        var EVTIMG_M = EVTIMG[0];
        EVTIMG.splice(0, 1);
        var EVTIMG_D = EVTIMG;

        run_query("INSERT INTO " + stoseq + "_EVTFIL_M (EVTSEQ, FILURL) VALUES (" + EVTSEQ + ", '" + EVTIMG_M.filename + "');", "");
        for (var i = 0; i < EVTIMG_D.length; i++) {
            run_query("INSERT INTO " + stoseq + "_EVTFIL_D (EVTSEQ, FILTYP, FILURL, PRDSEQ, ORDNUM) VALUES (" + EVTSEQ + ", 'P', '" + EVTIMG_D[i].filename + "', " + PRDSEQ[i] + ", 1);", "");
        }

        if (EVTVDO) {
            run_query("INSERT INTO " + stoseq + "_EVTFIL_D (EVTSEQ, FILTYP, FILURL, PRDSEQ, ORDNUM) VALUES (" + EVTSEQ + ", 'V', '" + EVTVDO + "', 0, 1);", "");
        }

        res.send("<p> 등록 완료 </p>");
    });


});

router.post('/addcall_p', function (req, res, next) {
    if (req.isAuthenticated()) next();
    else res.redirect('/login');
}, function (req, res, next) {
    var stoseq = req.user.STOSEQ;

    var body = req.body;

    var CALCOD = body.CALCOD;
    var CALNAM = body.CALNAM;
    var ORDNUM = body.ORDNUM;
    var REGDAT = "NOW()";

    var q = "INSERT INTO " + stoseq + "_STOCAL (CALCOD, CALNAM, ORDNUM, REGDAT) VALUES ('" + CALCOD + "', '" + CALNAM + "', " + ORDNUM + ", " + REGDAT + ");";

    run_query(q, "CALL 등록 완료");
    res.send("<p> 등록 완료 </p>");
});

router.post('/addncall2url_p', function(req, res, next){
    if (req.isAuthenticated()) next();
    else res.redirect('/login');
}, function(req, res, next) {
    let stoseq = req.user.STOSEQ;
    let userid = req.user.POSID;
    let regdat = "now()";
    let ytburl = req.body.YTBURL;

    let q = "insert into NCALL2(STOSEQ, YTBURL, REGUSR, REGDAT) values (" + stoseq + ", '" + ytburl + "', '" + userid + "', " + regdat + ");";
    run_query(q, "ncall2 등록완료");
    res.send("등록 완료");
});






//Android Nstar

router.post('/test', function (req, res, next) {
    console.log(req);
    res.send("전송완료");
});

router.post('/store_m', function (req, res, next) {
    var tagseq = req.body.TAGSEQ;
    if (tagseq == 'A') { // 모든 종류 태그
        let STOSEQ = req.body.STOSEQ;    

        var query = "select ID, STONAM, STLOGO, STOTEL from STOMST where ID=" + STOSEQ + ";";
        connection.query(query, function (err, rows, fields) {
            if (err) {
                console.error(err);
                let obj = new Object();
                obj.ResultCode = 200;
                obj.msg = "불러오기 실패";
                res.json(obj);
            } else {
                // 매장 정보 
                var obj = new Object;
                obj.STOSEQ = rows[0].ID;
                obj.STONAM = rows[0].STONAM;
                obj.STLOGO = rows[0].STLOGO;
                obj.STOTEL = rows[0].STOTEL;

                obj.CATS = category;
                obj.ResultCode = 100;
                res.json(obj);
            }
        });
    } else if (tagseq == 'T') { // 테이블 태그 시
        let STOSEQ = req.body.STOSEQ;
        let FLRSEQ = req.body.FLRSEQ;
        let TBLSEQ = req.body.TBLSEQ;

        var query = "select A.ID, A.STONAM, A.STLOGO, A.STOTEL, B.TBLNAM from STOMST as A, TBLSTO as B where A.ID=? and B.ID=?;";
        connection.query(query, [STOSEQ, TBLSEQ], function (err, rows, fields) {
            if (err) {
                console.error(err);
                let obj = new Object();
                obj.ResultCode = 200;
                obj.msg = "불러오기 실패";
                res.json(obj);
            } else {
                // 매장 정보 
                var obj = new Object;
                obj.STOSEQ = rows[0].ID;
                obj.STONAM = rows[0].STONAM;
                obj.STLOGO = rows[0].STLOGO;
                obj.STOTEL = rows[0].STOTEL;
                obj.TBLNAM = rows[0].TBLNAM;

                obj.ResultCode = 100;
                res.json(obj);
            }
        });
    } else if (tagseq == 'D') {

    } else if (tagseq == 'none') {
        // 태그로 앱 실행이 아닐 때 tagseq = 0;


    } else {
        // 실패 시
        res.json("{'ResultCode' : 200}");
    }
});

router.post('/userlogin_m', function (req, res, next) {
    let userid = req.body.USERID;
    let fcmtoken = req.body.FCMTOKEN;
    let query = "select ID, USERID from USRMST where USERID=?;";
    connection.query(query, [userid], function (err, rows, fields) {
        if (err) { 
            console.error(err); 
            let obj = new Object();
            obj.ResultCode = 200;
            obj.msg = "불러오기 실패1";
            res.json(obj);
        } else {
            if (rows.length == 0) {
                var obj = new Object;
                obj.ResultCode = 200;
                obj.msg = "존재하는 아이디가 없습니다";
                res.json(obj);
            } else {
                var userpw = req.body.USERPW;
                var query2 = "select * from USRMST A where USERPW = ? and USERID=?;";
                connection.query(query2, [userpw, userid], function (err, rows, fields) {
                    if (err) { 
                        console.error(err); 
                        let obj = new Object();
                        obj.ResultCode = 200;
                        obj.msg = "불러오기 실패2";
                        res.json(obj);
                    } else {
                        if (rows.length == 0) {
                            var obj = new Object;
                            obj.ResultCode = 200;
                            obj.msg = "비밀번호가 틀립니다";
                            res.json(obj);
                        } else {
                            var obj = new Object;
                            obj.USERID = rows[0].USERID;
                            obj.USRNAM = rows[0].USRNAM;
                            obj.MOBNUM = rows[0].MOBNUM;

                            var fcm = "update USRMST set FCMTOK='" + fcmtoken + "' where USERID='" + userid + "';";
                            run_query(fcm, "fcm update");

                            obj.msg = "로그인 성공!";
                            obj.ResultCode = 100;
                            res.json(obj);
                        }
                    }
                });
            }
        }
    });
});

router.post('/register_m', function (req, res, next) {
    var userid = req.body.USERID;
    var userpw = req.body.USERPW;
    var username = req.body.USRNAM;
    var mobnum = req.body.MOBNUM;
    var birthday = req.body.BIRDAY;
    var sexcod = req.body.SEXCOD;
    var emladd = req.body.EMLADD;
    var stoseq = req.body.STOSEQ;

    var query = "select * from USRMST where USERID='" + userid + "';";
    connection.query(query, function (err, rows, fields) {
        if (err) { 
            console.error(err); 
            let obj = new Object();
            obj.ResultCode = 200;
            obj.msg = "불러오기 실패";
            res.json(obj);
        } else {
            if (rows.length == 0) {
                var query2 = "select * from USRMST where MOBNUM='" + mobnum + "';";
                connection.query(query2, function (err, rows, fields) {
                    if (err) { console.error(err); }
                    if (rows.length == 0) {
                        var q = "INSERT INTO USRMST (USERID, USERPW, USRNAM, MOBNUM, BIRDAY, SEXCOD, EMLADD, FCMTOK, REGDAT, REGSTO, USRGRD) VALUES ('" + userid + "', '" + userpw + "', '" + username + "', '" + mobnum + "', " + birthday + ", '" + sexcod + "', '" + emladd + "', NULL, NOW(), " + stoseq + ", 1);";
                        connection.query(q, function (err, rows, fields) {
                            if (err) { console.error(err); }
                            var obj = new Object;
                            obj.ResultCode = 100;
                            obj.msg = "회원가입 완료";
                            res.json(obj);
                        });
                    } else {
                        var obj = new Object;
                        obj.ResultCode = 200;
                        obj.msg = "중복되는 전화번호가 존재합니다";
                        res.json(obj);
                    }
                });
            } else {
                var obj = new Object;
                obj.ResultCode = 200;
                obj.msg = "중복되는 아이디가 존재합니다";
                res.json(obj);
            }
        }
    });

});

router.post('/findprd_m', function (req, res, next) {
    var STOSEQ = req.body.STOSEQ;
    var catseq = req.body.CATSEQ;
    var catnam = req.body.CATNAM;

    if (catnam == "세트") {

    } else if (catnam == "할인") {

    } else {
        var q = "select A.ID, A.PRDNAM, A.PRDEXP, A.PRDCST, B.FILURL from PRDMST as A left join PRDFIL_M as B on A.ID = B.PRDSEQ where A.STOSEQ=? and A.CATSEQ=? and A.SALFLG='Y' order by A.ORDNUM;";
        connection.query(q, [STOSEQ, catseq], function (err, rows, fields) {
            if (err) { 
                console.error(err); 
                let obj = new Object();
                obj.ResultCode = 200;
                obj.msg = "불러오기 실패";
                res.json(obj);
            } else {
                if (rows.length == 0) {
                    let obj = new Object();
                    obj.ResultCode = 200;
                    obj.msg = "이 카테고리에 제품이 없습니다";
                    res.json(obj);
                } else {
                    var products = [];
                    var array_name = "products";
                    for (var i = 0; i < rows.length; i++) {
                        var obj = new Object;
                        obj.PRDSEQ = rows[i].ID;
                        obj.PRDNAM = rows[i].PRDNAM;
                        obj.PRDEXP = rows[i].PRDEXP;
                        obj.PRDCST = rows[i].PRDCST;
                        obj.FILURL = rows[i].FILURL;
                        products.push(obj);
                    }
                    var result = new Object;
                    result.ResultCode = 100;
                    result.array_name = array_name;
                    result[array_name] = products;
                    console.log(result);
                    res.json(result);
                }
            }
        });
    }
});

router.post('/prdopt_m', function (req, res, next) {
    //TableOrderActivity

    var stoseq = req.body.STOSEQ;
    var prdseq = req.body.PRDSEQ;

    var result = new Object;

    var array_name = "options";
    var options = [];
    var q = "select A.CATNAM, C.OPTNAM, C.OPTCST from "
        + "OPTCAT as A, PRDOPT as B, OPTMST as C "
        + "where A.STOSEQ=? and B.PRDSEQ=? and B.OPTCAT = A.ID and A.ID = C.OPTCAT;";

    connection.query(q, [stoseq, prdseq], function (err, rows2, fields) {
        if (err) { console.error(err); }
        else {
            if (rows2.length == 0) { }
            else {
                var catnam = rows2[0].CATNAM;
                var obj = new Object;
                var option_detail = [];
                var option = new Object;

                for (var i = 0; i < rows2.length; i++) {
                    if (catnam == rows2[i].CATNAM) {
                        option = new Object;
                        option.OPTNAM = rows2[i].OPTNAM;
                        option.OPTCST = rows2[i].OPTCST;
                        option_detail.push(option);

                        if (i == rows2.length - 1) {
                            obj.CATNAM = catnam;
                            obj.OPTDET = option_detail;
                            options.push(obj);
                        }
                    } else {
                        obj.CATNAM = catnam;
                        obj.OPTDET = option_detail;

                        options.push(obj);

                        catnam = rows2[i].CATNAM;

                        obj = new Object;
                        option = new Object;
                        option_detail = new Array;

                        option.OPTNAM = rows2[i].OPTNAM;
                        option.OPTCST = rows2[i].OPTCST;
                        option_detail.push(option);

                        if (i == rows2.length - 1) {
                            obj.CATNAM = catnam;
                            obj.OPTDET = option_detail;
                            options.push(obj);
                        }
                    }
                }
                result.ResultCode = 100;
                result[array_name] = options;
                result.array_name = array_name;
                console.log(result);
                res.json(result);
            }
        }
    });

});

router.post('/prdinfo_m', function (req, res, next) {
    var stoseq = req.body.STOSEQ;
    var prdseq = req.body.PRDSEQ;
    var prdnam = req.body.PRDNAM;

    var result = new Object;
    var images = [];
    var options = [];

    var q = "select FILURL from PRDFIL_D "
        + "where STOSEQ=? and PRDSEQ=? order by ORDNUM;";

    connection.query(q, [stoseq, prdseq], function (err, rows, fields) {
        if (err) { console.error(err); }
        else {
            for (var i = 0; i < rows.length; i++) {
                images.push(rows[i].FILURL);
            }
            result.images = images;

            let q2 = "select A.CATNAM, D.PRDNAM, D.PRDEXP, D.PRDCST, C.ID, C.OPTNAM, C.OPTCST from OPTCAT as A " 
                + "left join PRDOPT as B on A.ID = B.OPTCAT "
                + "left join OPTMST as C on A.ID = C.OPTCAT "
                + "left join PRDMST as D on D.ID = ? "
                + "where A.STOSEQ=? and B.PRDSEQ = ?;"
            connection.query(q2, [prdseq, stoseq, prdseq], function (err, rows2, fields) {
                if (err) { console.error(err); }
                else {
                    if (rows2.length == 0) { 

                        let q3 = "select * from PRDMST where ID=?;";
                        connection.query(q3, [prdseq], function(err, rows3, fields){
                            if(err) {
                                console.error(err);
                            } else {
                                result.ResultCode = 100;
                                result.PRDNAM = rows3[0].PRDNAM;
                                result.PRDEXP = rows3[0].PRDEXP;
                                result.PRDCST = rows3[0].PRDCST;
                                result.images = images;
                                result.options = [];
                                res.json(result);
                            }
                        })

                        
                    }
                    else {
                        var catnam = rows2[0].CATNAM;
                        var obj = new Object;
                        var option_detail = [];
                        var option = new Object;
                        let PRDNAM = rows2[0].PRDNAM;
                        let PRDEXP = rows2[0].PRDEXP;
                        let PRDCST = rows2[0].PRDCST;
    
                        for (var i = 0; i < rows2.length; i++) {
                            
                            if (catnam == rows2[i].CATNAM) {
                                option = new Object;
                                option.OPTSEQ = rows2[i].ID;
                                option.OPTNAM = rows2[i].OPTNAM;
                                option.OPTCST = rows2[i].OPTCST;
                                option_detail.push(option);
    
                                if (i == rows2.length - 1) {
                                    obj.CATNAM = catnam;
                                    obj.OPTDET = option_detail;
                                    options.push(obj);
                                }
                            } else {
                                obj.CATNAM = catnam;
                                obj.OPTDET = option_detail;
    
                                options.push(obj);
    
                                catnam = rows2[i].CATNAM;
    
                                obj = new Object;
                                option = new Object;
                                option_detail = new Array;
    
                                option.OPTSEQ = rows2[i].ID;                       
                                option.OPTNAM = rows2[i].OPTNAM;
                                option.OPTCST = rows2[i].OPTCST;
                                option_detail.push(option);
    
                                if (i == rows2.length - 1) {
                                    obj.CATNAM = catnam;
                                    obj.OPTDET = option_detail;
                                    options.push(obj);
                                }
                            }
                        }
                        result.ResultCode = 100;
                        result.PRDNAM = PRDNAM;
                        result.PRDEXP = PRDEXP;
                        result.PRDCST = PRDCST;
                        result.images = images;
                        result.options = options;
                        console.log(result.options[0].OPTDET);
                        console.log(result);
                        res.json(result);
                    }
                }
            });
        }
    });


});

router.post('/findprd_opt_m', function (req, res, next) {
    let stoseq = req.body.STOSEQ;
    let catseq = req.body.CATSEQ;
    let catnam = req.body.CATNAM;

    if (catnam == "세트") {

    } else if (catnam == "할인") {

    } else {
        let q = "select A.ID, A.PRDNAM, A.PRDEXP, A.PRDCST, B.FILURL "
            + "from PRDMST as A "
            + "left join PRDFIL_M as B on (A.ID = B.PRDSEQ) "
            + "where A.STOSEQ=? and A.CATSEQ = ? order by A.ORDNUM;";
        connection.query(q, [stoseq, catseq], function (err, rows, fields) {
            if (err) { console.error(err); }
            else {
                if (rows.length == 0) {
                    res.json("{'ResultCode':200, 'msg':'이 카테고리에 제품이 없습니다.'}");
                } else {
                    let products = [];
                    let array_name = "products";
                    for (let i = 0; i < rows.length; i++) {
                        let obj = new Object;
                        obj.PRDSEQ = rows[i].ID;
                        obj.PRDNAM = rows[i].PRDNAM;
                        obj.PRDEXP = rows[i].PRDEXP;
                        obj.PRDCST = rows[i].PRDCST;
                        obj.FILURL = rows[i].FILURL;


                        let options = [];
                        let q2 = "select A.CATNAM, C.OPTNAM, C.OPTCST from "
                            + "OPTCAT as A, PRDOPT as B, OPTMST as C "
                            + "where A.STOSEQ=? and B.PRDSEQ=? and B.OPTCAT = A.ID and A.ID = C.OPTCAT;";
                        connection.query(q2, [stoseq, rows[i].ID], function (err, rows2, fields) {
                            if (err) { console.error(err); }
                            if (rows2.length == 0) { }
                            else {
                                let optcatnam = rows2[0].CATNAM;
                                let obj2 = new Object;
                                let option_detail = [];
                                let option = new Object;

                                for (let k = 0; k < rows2.length; k++) {
                                    if (optcatnam == rows2[k].CATNAM) {
                                        option = new Object;
                                        option.OPTNAM = rows2[k].OPTNAM;
                                        option.OPTCST = rows2[k].OPTCST;
                                        option_detail.push(option);

                                        if (k == rows2.length - 1) {
                                            obj2.CATNAM = optcatnam;
                                            obj2.OPTDET = option_detail;
                                            options.push(obj2);
                                        }
                                    } else {
                                        obj2.CATNAM = optcatnam;
                                        obj2.OPTDET = option_detail;

                                        options.push(obj2);

                                        optcatnam = rows2[k].CATNAM;

                                        obj2 = new Object;
                                        option = new Object;
                                        option_detail = new Array;

                                        option.OPTNAM = rows2[k].OPTNAM;
                                        option.OPTCST = rows2[k].OPTCST;
                                        option_detail.push(option);

                                        if (k == rows2.length - 1) {
                                            obj2.CATNAM = optcatnam;
                                            obj2.OPTDET = option_detail;
                                            options.push(obj2);
                                        }
                                    }
                                }
                                obj.options = options;
                                console.log(obj);
                                console.log("----");
                                products.push(obj);
                            }
                        });

                    }
                    //
                    setTimeout(function () {
                        var result = new Object;
                        result.ResultCode = 100;
                        result.array_name = array_name;
                        result[array_name] = products;
                        console.log(result);
                        res.json(result);
                    }, 500);
                }
            }
        });
    }
});

router.post('/category_m', function (req, res, next) {
    var stoseq = req.body.STOSEQ;

    // 매장 카테고리 정보

    var array_name = "CATS";
    var obj = new Object;
    var query = "select ID, CATNAM, CATFIL from CATMST where STOSEQ=?;";

    connection.query(query, [stoseq], function (err, rows2, fields) {
        if (err) {
            console.error(err);
            obj.ResultCode = 200;
            res.json(obj);
        } else {
            var category = [];
            for (var i = 0; i < rows2.length; i++) {
                var obj2 = new Object;
                obj2.CATSEQ = rows2[i].ID;
                obj2.CATNAM = rows2[i].CATNAM;
                obj2.CATFIL = rows2[i].CATFIL;
                category.push(obj2);
            }
            obj[array_name] = category;
            obj.array_name = array_name;
            obj.ResultCode = 100;
            res.json(obj);
        }
    });
});

router.post('/event_m', function (req, res, next) {

    var stoseq = req.body.STOSEQ;
    var array_name = "EVENTS";

    var result = new Object();
    var eventList = [];

    var query = "select A.ID, A.EVTNAM, B.FILURL "
        + "from EVTMST as A "
        + "left join EVTFIL_M as B "
        + "on A.ID = B.EVTSEQ "
        + "where now() >= A.EVTSTR "
        + "and now() < A.EVTEND "
        + "and A.STOSEQ=" + stoseq +" "
        + "order by A.ORDNUM ASC;";

    connection.query(query, function (err, rows, fields) {
        if (err) {
            console.error(err);
            result.ResultCode = 200;
            result.msg = "이벤트를 불러오는 데 실패하였습니다";
            res.json(result);
        } else {
            for (var i = 0; i < rows.length; i++) {
                var obj = new Object();
                obj.EVTSEQ = rows[i].ID;
                obj.EVTNAM = rows[i].EVTNAM;
                if (rows[i].FILURL == null) {
                    obj.FILURL = "event_default.png";
                } else {
                    obj.FILURL = rows[i].FILURL;
                }
                // console.log(obj);
                eventList.push(obj);
            }
    
            result[array_name] = eventList;
            result.array_name = array_name;
            result.ResultCode = 100;
            res.json(result);
        }
    });
});

router.post('/event_detail_m', function (req, res, next) {
    var stoseq = req.body.STOSEQ;
    var evtseq = req.body.EVTSEQ;


    var q = "select A.FILTYP, A.FILURL, A.PRDSEQ, B.PRDNAM, B.PRDEXP, B.PRDCST "
        + "from EVTFIL_D as A "
        + "left join PRDMST as B "
        + "on A.PRDSEQ = B.ID "
        + "where A.STOSEQ=? and A.EVTSEQ=? "
        + "order by A.ORDNUM;";

    var array_name = "event_datails";
    var result = new Object;
    var details = [];

    connection.query(q, [stoseq, evtseq], function (err, rows, fields) {
        if (err) {
            console.error(err);
            result.ResultCode = 200;
            result.msg = "이벤트를 불러오는 데 실패하였습니다";
            res.json(result);
        } else {
            for (let i = 0; i < rows.length; i++) {
                let obj = new Object;
                obj.FILTYP = rows[i].FILTYP;
                obj.FILURL = rows[i].FILURL;
                obj.PRDSEQ = rows[i].PRDSEQ;
                obj.PRDNAM = rows[i].PRDNAM;
                obj.PRDEXP = rows[i].PRDEXP;
                obj.PRDCST = rows[i].PRDCST;
                details.push(obj);
            }
    
            result.ResultCode = 100;
            result.array_name = array_name;
            result[array_name] = details;
            res.json(result);
        }
    });
});


//Android Nstarpos
router.post('/poslogin_m', function (req, res, next) {
    var posid = req.body.POSID;
    var pospw = req.body.POSPW;
    var fcmtoken = req.body.FCMTOKEN;

    var adminQuery = "select ID, ADMID from ADMMST where ADMID=?;";

    var obj = new Object;

    connection.query(adminQuery, [posid], function (err, rows, fields) {
        if (err) { console.error(err); }
        if (rows.length != 0) {
            var q = "select * from ADMMST where ADMPW=? and ADMID=?;";
            connection.query(q, [pospw, posid], function (err, rows, fields) {
                if (err) { console.error(err); }
                else {
                    if (rows.length == 0) {
                        obj.ResultCode = 200;
                        obj.msg = "비밀번호가 틀립니다";
                        res.json(obj);
                    } else {
                        obj.ResultCode = 300;
                        obj.msg = "관리자로 로그인합니다";
                        res.json(obj);
                    }
                }
            });
        } else {
            var query = "select ID, POSID from POSMST where POSID =?;";
            connection.query(query, [posid], function (err, rows, fields) {
                if (err) { console.error(err); }
                else {
                    if (rows.length == 0) {
                        obj.ResultCode = 200;
                        obj.msg = "존재하는 아이디가 없습니다";
                        res.json(obj);
                    } else {
                        var query2 = "select * from POSMST A where POSPW=? and POSID=?;";
                        connection.query(query2, [pospw, posid], function (err, rows, fields) {
                            if (err) { console.error(err); }
                            else {
                                if (rows.length == 0) {
                                    obj.ResultCode = 200;
                                    obj.msg = "비밀번호가 틀립니다";
                                    res.json(obj);
                                } else {
                                    var fcm = "update POSMST set FCMTOK='" + fcmtoken + "' where POSID='" + posid + "';";
                                    run_query(fcm, "fcm update");
        
                                    var r = "select B.POSID, A.ID as STOSEQ, A.STONAM "
                                        + "from STOMST as A "
                                        + "left join POSMST as B on (A.ID = B.STOSEQ) "
                                        + "where B.POSID = ?;"
        
                                    connection.query(r, [posid], function (error, rows, fields) {
                                        if (err) { console.error(err); }
        
                                        obj.POSID = rows[0].POSID;
                                        obj.STOSEQ = rows[0].STOSEQ;
                                        obj.STONAM = rows[0].STONAM;
        
                                        var r2 = "select ID, FLRNAM "
                                            + "from STOFLR where STOSEQ=? "
                                            + "order by ORDNUM asc;";
        
                                        connection.query(r2, [rows[0].STOSEQ], function (err, rows, fields) {
                                            if (err) { console.error(err); }
                                            //층 등록 안한 경우 처리 필요
        
                                            //층 등록 한 경우
                                            else {
                                                var array_name = "STOFLR";
                                                var STOFLR = [];
                                                for (var i = 0; i < rows.length; i++) {
                                                    var object = new Object;
                                                    object.FLRSEQ = rows[i].ID;
                                                    object.FLRNAM = rows[i].FLRNAM;
                                                    STOFLR.push(object);
                                                }
                                                obj.array_name = array_name;
                                                obj[array_name] = STOFLR;
                                                obj.ResultCode = 100;
                                                obj.msg = "로그인 완료";
                                                console.log(obj);
                                                res.json(obj);
                                            }
                                        });
                                    });
                                }
                            }
                            
                        });
                    }
                }
            });
        }
    });
});

router.post('/ncall2_login_m', function(req, res, next){
    var posid = req.body.POSID;
    var pospw = req.body.POSPW;
    var fcmtoken = req.body.FCMTOKEN;


    var adminQuery = "select ID, ADMID from ADMMST where ADMID=?;";

    var obj = new Object;

    connection.query(adminQuery, [posid], function (err, rows, fields) {
        if (err) { console.error(err); }
        else {
            var query = "select ID, POSID from POSMST where POSID = ?;";
            connection.query(query, [posid], function (err, rows, fields) {
                if (err) { console.error(err); }
                else {
                    if (rows.length == 0) {
                        obj.ResultCode = 200;
                        obj.msg = "존재하는 아이디가 없습니다";
                        res.json(obj);
                    } else {
                        var query2 = "select * from POSMST A where POSPW='" + pospw + "' and POSID='" + posid + "';";
                        connection.query(query2, function (err, rows, fields) {
                            if (err) { console.error(err); }
                            else {
                                if (rows.length == 0) {
                                    obj.ResultCode = 200;
                                    obj.msg = "비밀번호가 틀립니다";
                                    res.json(obj);
                                } else {
            
                                    var fcm = "update POSMST set FCMTOK2='" + fcmtoken + "' where POSID='" + posid + "';";
                                    run_query(fcm, "fcm update");
            
                                    var r = "select B.POSID, A.ID as STOSEQ, A.STONAM "
                                        + "from STOMST as A "
                                        + "left join POSMST as B on (A.ID = B.STOSEQ) "
                                        + "where B.POSID = '" + posid + "';"
            
                                    connection.query(r, function (error, rows, fields) {
                                        if (err) { console.error(err); }
                                        else {
                                            obj.POSID = rows[0].POSID;
                                            obj.STOSEQ = rows[0].STOSEQ;
                                            obj.STONAM = rows[0].STONAM;
                
                                            obj.ResultCode = 100;
                                            obj.msg = "로그인 완료";
                                            console.log(obj);
                                            res.json(obj);
                                        }
                                    });
                                }
                            }
                            
                        });
                    }
                }
            });
        }
    });
});

router.post('/postable_m', function (req, res, next) {
    var stoseq = req.body.STOSEQ;
    var flrseq = req.body.FLRSEQ;
    var result = new Object;

    var array_name = "TBL";
    var TBL = [];
    var query = "select * from TBLSTO where STOSEQ=? and FLRSEQ=?;";

    connection.query(query, [stoseq, flrseq], function (err, rows, fields) {
        if (err) { 
            console.error(err); 
        } else {
            for (var i = 0; i < rows.length; i++) {
                var obj = new Object;
                obj.TBLSEQ = rows[i].ID;
                obj.TBLNAM = rows[i].TBLNAM;
                TBL.push(obj);
            }
            result.ResultCode  = 100;
            result.msg         = flrseq + " floor 테이블 불러오기 완료";
            result[array_name] = TBL;
            result.array_name  = array_name;
            console.log(result);
            res.json(result);
        }
    });
});

router.post('/callpos_m', function (req, res, next) {
    let stoseq = req.body.MSG_TO;
    let msg_from = req.body.MSG_FROM;
    let msg_body = req.body.MSG_BODY;
    let tblseq = req.body.TBLSEQ;
    let tblnam = req.body.TBLNAM;

    let q2 = "INSERT INTO CALMST (STOSEQ, CALTYP, CALNAM, USERID, TBLSEQ, POSNAM, CHKFLG, REGDAT) VALUES (?, 'C', ?, ?, ?, '', 'N', now());";

    connection.query(q2, [stoseq, msg_body, msg_from, tblseq], function(err, rows, fields){
        if(err) {
            console.error(err);
            var obj = new Object;
            obj.ResultCode = 200;
            res.json(obj);
        } else {
            socketApi.sendAlarmCall(stoseq);
            var obj = new Object;
            obj.ResultCode = 100;
            res.json(obj);
        }
    });
});

router.post('/calluser_m', function (req, res, next) {
    //고객 1명한테 보내기
    let posid = req.body.POSID;
    let userid = req.body.MSG_TO;
    let msg_title = req.body.MSG_TITLE;
    let msg_body = req.body.MSG_BODY;
    let msg_from = req.body.MSG_FROM;
    let sendcall = req.body.SENDCALL;

    let q2 = "insert into CALMST (STOSEQ, CALTYP, CALNAM, USERID, POSNAM, CHKFLG, REGDAT) values (?, 'S', ?, ?, ?, 'N', now());";

    connection.query(q2, [msg_from, msg_body, posid, posid], function(err, rows, fields){
        if(err) {
            console.error(err);
            let obj = new Object();
            obj.ResultCode = 200;
            res.json(obj);
        } else {
            let q = "select FCMTOK from USRMST where USERID=?;";

            let fcm_array = [];
        
            connection.query(q, [userid], function (err, rows, fields) {
                if (err) { 
                    console.error(err); 
                    let obj = new Object();
                    obj.ResultCode = 200;
                    res.json(obj);
                }
                else {
                    for (let i = 0; i < rows.length; i++) {
                        fcm_array.push(rows[i].FCMTOK);
                    }
            
                    var payload = {
                        data: {
                            title: msg_title,
                            body: msg_body,
                            FROM: msg_from,
                            TO: userid,
                            IMAGE: "empty"
                        }
                    };
                    if (fcm_array.length == 0) {
                        res.send("보낼 대상이 없습니다");
                    } else {
                        admin.messaging().sendToDevice(fcm_array, payload)
                            .then(function (response) {
                                console.log("메세지 전송 완료 :", response);
                                if(sendcall == 1) {
                                    socketApi.sendUserCall(msg_from);
                                }
                                var obj = new Object;
                                obj.ResultCode = 100;
                                res.json(obj);
                            })
                            .catch(function (err) {
                                console.log("메세지 전송 에러 :", err);
                                var obj = new Object;
                                obj.ResultCode = 200;
                                res.json(obj);
                            });
                    }
                }
            });
        }
    });
});

router.post('/user_calltest', function(req, res, next){
    let userid = req.body.userid;
    let msg_title = req.body.title;
    let msg_body = req.body.body;
    let msg_from = req.body.from;

    let fcm_array = "emDboeVbp7A:APA91bGT20N0RBu3cAuvhjiKCBtQgfRcuU9Yq2_IuZ1efDZdptJA7tYBdOGmybxlRKghj_k1OkkGj1TKpeh-XpLpTvbZ7nzxrpkNBT33iXnK_sXSL6nshSqMPIGpwzB-KU8jMei6RyaB";

    var payload = {
        data: {
            title: msg_title,
            body: msg_body,
            FROM: msg_from,
            TO: userid,
            IMAGE: "empty"
        }
    };

    admin.messaging().sendToDevice(fcm_array, payload)
        .then(function (response) {
            console.log("메세지 전송 완료 :", response);
            var obj = new Object;
            obj.ResultCode = 100;
            res.json(obj);
        })
        .catch(function (err) {
            console.log("메세지 전송 에러 :", err);
            var obj = new Object;
            obj.ResultCode = 200;
            res.json(obj);
        });

});

router.post('/calluser_image_m', function (req, res, next) {

    let file_recieved;
    let msg_to;
    let msg_from;
    let msg_title;
    let msg_body = "사진";

    let form = new formidable.IncomingForm();
    form.encoding = "utf-8";
    form.uploadDir = "./public/images/";
    form.keepExtensions = true;
    form.maxFieldsSize = 5 * 1024 * 1024;

    form.parse(req, function (err, fields, files) {
        if (err) {
            console.log(err);
            let obj = new Object;
            obj.ResultCode = 200;
            obj.msg = "사진 전송에 실패하였습니다";
            res.json(obj);
        }
    });

    form.on('error', function (err) {
        console.log(err);
        let obj = new Object;
        obj.ResultCode = 200;
        obj.msg = "사진 전송에 실패하였습니다";
        res.json(obj);
    }).on('field', function (field, value) {
        if (field === 'MSG_TO') msg_to = value;
        else if (field === 'MSG_FROM') msg_from = value;
        else if (field === 'STONAM') {
            msg_title = value;
        }
    }).on('fileBegin', function (name, file) {
        file.path = form.uploadDir + msg_to + "_" + new Date().valueOf() + file.name;
        file_recieved = file.path;
        file_recieved = file_recieved.replace("./public/images/", "");
        console.log(file_recieved);
    }).on('file', function (field, file) {
    }).on('progress', function (bytesReceived, bytesExpected) {

    }).on('end', function (req, ress) {
        console.log('form end:\n\n');

        let q = "select FCMTOK from USRMST where USERID=?;";

        let fcm_array = [];

        connection.query(q, [msg_to], function (err, rows, fields) {
            if (err) { console.error(err); }
            else {
                for (let i = 0; i < rows.length; i++) {
                    fcm_array.push(rows[i].FCMTOK);
                    console.log(rows[i].FCMTOK);
                }
    
                var payload = {
                    data: {
                        title: msg_title,
                        body: msg_body,
                        FROM: msg_from,
                        TO: msg_to,
                        IMAGE: file_recieved
                    }
                };
                
                if (fcm_array.length == 0) {
                    res.send("보낼 대상이 없습니다");
                } else {
                    admin.messaging().sendToDevice(fcm_array, payload)
                        .then(function (response) {
                            console.log("메세지 전송 완료 :", response);
                            var obj = new Object;
                            obj.ResultCode = 100;
                            obj.image_url = file_recieved;
                            res.json(obj);
                        })
                        .catch(function (err) {
                            console.log("메세지 전송 에러 :", err);
                            var obj = new Object;
                            obj.ResultCode = 200;
                            res.json(obj);
                        });
                }
            }
        });
    });
});
router.post('/callpos_image_m', function (req, res, next) {

    let file_recieved;
    let msg_to;
    let msg_from;
    let msg_body = "사진";
    let TBLSEQ;

    let form = new formidable.IncomingForm();
    form.encoding = "utf-8";
    form.uploadDir = "./public/images/";
    form.keepExtensions = true;
    form.maxFieldsSize = 5 * 1024 * 1024;

    form.parse(req, function (err, fields, files) {
        if (err) {
            console.log(err);
            let obj = new Object;
            obj.ResultCode = 200;
            obj.msg = "사진 전송에 실패하였습니다";
            res.json(obj);
        }
    });

    form.on('error', function (err) {
        console.log(err);
        let obj = new Object;
        obj.ResultCode = 200;
        obj.msg = "사진 전송에 실패하였습니다";
        res.json(obj);
    }).on('field', function (field, value) {
        if (field === 'MSG_TO') msg_to = value;
        else if (field === 'MSG_FROM') msg_from = value;
        else if (field === 'TBLSEQ') TBLSEQ = value;
    }).on('fileBegin', function (name, file) {
        file.path = form.uploadDir + msg_to + "_" + new Date().valueOf() + file.name;
        file_recieved = file.path;
        file_recieved = file_recieved.replace("./public/images/", "");
        console.log(file_recieved);
    }).on('file', function (field, file) {
    }).on('progress', function (bytesReceived, bytesExpected) {

    }).on('end', function (req, ress) {
        console.log('form end:\n\n');
        
        let q = "insert into CALMST (STOSEQ, CALTYP, CALNAM, USERID, TBLSEQ, CHKFLG, REGDAT) values (?, 'CP', ?, ?, ?, 'N', now());";

        connection.query(q, [msg_to, file_recieved, msg_from, TBLSEQ], function(err, rows, fields){
            if(err) {
                console.error(err);
                let obj = new Object();
                obj.ResultCode = 200;
                res.json(obj);
            } else {
                socketApi.sendPosImageCall(msg_to);
                let obj = new Object();
                obj.image_url = file_recieved;
                obj.ResultCode = 100;
                res.json(obj);
            }
        });

    });
});
router.post('/sendusers_m', function (req, res, next) {
    //고객 여러명에게 보내기
});
router.post('/mobile/pos/getCallList', function(req, res, next){
    let STOSEQ = req.body.STOSEQ;

    let q = "select CALTYP, CALNAM, USERID, TBLSEQ, RCNSEQ, CHKFLG, (UNIX_TIMESTAMP(REGDAT)*1000) as TIME from CALMST where CALTYP='C' and STOSEQ=? order by REGDAT desc limit 1;";

    connection.query(q, [STOSEQ], function(err, rows, fields){
        if(err) {
            console.error(err);
            let obj = new Object();
            obj.ResultCode = 200;
            obj.msg = "불러오기 실패";
            res.json(obj);
        } else {
            let calls = [];
            for(let i=0; i<rows.length; i++) {
                let obj = new Object();
                obj.TIME = rows[i].TIME;
                obj.TYPE = rows[i].CALTYP;
                obj.CALNAM = rows[i].CALNAM;
                obj.USERID = rows[i].USERID;
                obj.TBLSEQ = rows[i].TBLSEQ;
                obj.RCNSEQ = rows[i].RCNSEQ;
                if(_.isNull(rows[i].RCNSEQ)) {
                    obj.RCNSEQ = "";
                }
                obj.CHKFLG = rows[i].CHKFLG;
                calls.push(obj);
            }
            let result = new Object();
            result.ResultCode = 100;
            result.calls = calls;
            res.json(result);
        }
    });

});
router.post('/mobile/pos/getPictureList', function(req, res, next){
    let STOSEQ = req.body.STOSEQ;

    let q = "select CALTYP, CALNAM, USERID, TBLSEQ, CHKFLG, (UNIX_TIMESTAMP(REGDAT)*1000) as TIME from CALMST where CALTYP='CP' and STOSEQ=? order by REGDAT desc limit 1;";

    connection.query(q, [STOSEQ], function(err, rows, fields){
        if(err) {
            console.error(err);
            let obj = new Object();
            obj.ResultCode = 200;
            obj.msg = "불러오기 실패";
            res.json(obj);
        } else {
            let pictures = [];
            for(let i=0; i<rows.length; i++) {
                let obj = new Object();
                obj.TIME = rows[i].TIME;
                obj.TYPE = rows[i].CALTYP;
                obj.CALNAM = rows[i].CALNAM;
                obj.USERID = rows[i].USERID;
                obj.TBLSEQ = rows[i].TBLSEQ;
                if(_.isNull(rows[i].RCNSEQ)) {
                    obj.RCNSEQ = "";
                }
                obj.CHKFLG = rows[i].CHKFLG;
                pictures.push(obj);
            }
            let result = new Object();
            result.ResultCode = 100;
            result.pictures = pictures;
            res.json(result);
        }
    });
});

// 채팅
router.post('/usercalllist_m', function (req, res, next) {
    let stoseq = req.body.STOSEQ;

    let query = "select * from STOCAL where STOSEQ=? and CALCOD='S' order by ORDNUM;";

    let result = new Object;
    let array_name = "CAL";
    let CAL = [];

    connection.query(query, [stoseq], function (err, rows, fields) {
        if (err) { console.error(err); }
        else {
            for (let i = 0; i < rows.length; i++) {
                CAL.push(rows[i].CALNAM);
            }
            result.array_name = array_name;
            result[array_name] = CAL;
            result.ResultCode = 100;
            res.json(result);
        }
    });
});
router.post('/poscalllist_m', function (req, res, next) {
    let stoseq = req.body.STOSEQ;

    let query = "select * from STOCAL where STOSEQ=? and CALCOD='C' order by ORDNUM;";

    let result = new Object;
    let array_name = "CAL";
    let CAL = [];

    connection.query(query, [stoseq], function (err, rows, fields) {
        if (err) { console.error(err); }
        else {
            for (let i = 0; i < rows.length; i++) {
                CAL.push(rows[i].CALNAM);
            }
            result.array_name = array_name;
            result[array_name] = CAL;
            result.ResultCode = 100;
            res.json(result);
        }
    });
});

//주문
router.post('/user_order_m', function(req, res, next){
    let stoseq = req.body.STOSEQ;
    let userid = req.body.USERID;
    let totamt = req.body.TOTAMT;
    let tblseq = req.body.TBLSEQ;
    let regdat = "now()";

    let prdnum = req.body.PRDNUM;
    let prdseq = req.body.PRDSEQ;
    let prdqty = req.body.PRDQTY;
    let detcst = req.body.DETCST;

    let findFirst = "select ORDCNT from RCNMST where STOSEQ=? and TBLSEQ=? and FINISH='N' order by REGDAT desc limit 1;";
    connection.query(findFirst, [stoseq, tblseq], function(err, rows, fields){
        if(err) {
            console.error("RCNMST FIND ORDCNT ERROR", err);
            let obj = new Object;
            obj.ResultCode = 200;
            res.json(obj);
        } else {
            let ORDCNT = 1;
            if(rows.length != 0) {
                ORDCNT = rows[0].ORDCNT*1 + 1;
            }

            let option_exist = req.body.OPT_EXIST;
            if(option_exist === "T") {
                let optnum = req.body.OPTNUM;
                let optseq = [];
                for(let i=1; i<=optnum; i++){
                    optseq.push(req.body["OPTSEQ"+i]);
                }
                console.log(optseq);

                let insertRCNMST = "insert into RCNMST (STOSEQ, TOTAMT, TBLSEQ, REGDAT, USERID, CHKFLG, PAYFLG, FINISH, ORDCNT) values (?, ?, ?, now(), ?, 'N', 'N', 'N', ?);";
                connection.query(insertRCNMST, [stoseq, totamt, tblseq, userid, ORDCNT], function(err, rows1, fields){
                    if(err) {
                        console.error("RCNMST INSERTION ERROR", err);
                        let obj = new Object;
                        obj.ResultCode = 200;
                        res.json(obj);
                    } else {
                        let rcnseq = rows1.insertId;

                        let insertRCNDET = "insert into RCNDET (STOSEQ, RCNSEQ, PRDSEQ, PRDQTY, DETCST) values ("+stoseq+", " + rcnseq + ", " + prdseq + ", " + prdqty + ", " + detcst + ");";
            
                        connection.query(insertRCNDET, function(err, rows2, fields){
                            if(err) {
                                console.error("RCNDET INSERTION ERROR", err);
                                let obj = new Object;
                                obj.ResultCode = 200;
                                res.json(obj);
                            } else {
                                let rcndetseq = rows2.insertId;
                                for(let j=0; j<optnum; j++) {
                                    run_query("insert into OPTSET (STOSEQ, RCNDETSEQ, OPTSEQ) values ("+stoseq+", " + rcndetseq + ", " + optseq[j] +");", "");
                                }
                                let q2 = "INSERT INTO CALMST (STOSEQ, CALTYP, CALNAM, USERID, TBLSEQ, RCNSEQ, POSNAM, CHKFLG, REGDAT) VALUES (?, 'C', '신규 주문이 있습니다', ?, ?, ?, '', 'N', now());";
                                connection.query(q2, [stoseq, userid, tblseq, rcnseq], function(err, rows, fields){
                                    if(err){
                                        console.error(err);
                                    } else {
                                        socketApi.sendPosCall(stoseq);
                                        socketApi.sendAlarmCall(stoseq);
                                        let result = new Object;
                                        result.ResultCode = 100;
                                        res.json(result);
                                    }
                                });
                            }
                        });
                    }
                });

            } else {
                let insertRCNMST = "insert into RCNMST (STOSEQ, TOTAMT, TBLSEQ, REGDAT, USERID, CHKFLG, PAYFLG, FINISH, ORDCNT) values (?, ?, ?, now(), ?, 'N', 'N', 'N', ?);";
                connection.query(insertRCNMST, [stoseq, totamt, tblseq, userid, ORDCNT], function(err, rows1, fields){
                    if(err) {
                        console.error("RCNMST INSERTION ERROR", err);
                        let obj = new Object;
                        obj.ResultCode = 200;
                        res.json(obj);
                    } else {
                        let rcnseq = rows1.insertId;

                        let insertRCNDET = "insert into RCNDET (STOSEQ, RCNSEQ, PRDSEQ, PRDQTY, DETCST) values ("+stoseq+", " + rcnseq + ", " + prdseq + ", " + prdqty + ", " + detcst + ");";
            
                        connection.query(insertRCNDET, function(err, rows2, fields){
                            if(err) {
                                console.error("RCNDET INSERTION ERROR", err);
                                let obj = new Object;
                                obj.ResultCode = 200;
                                res.json(obj);
                            } else {
                                let q2 = "INSERT INTO CALMST (STOSEQ, CALTYP, CALNAM, USERID, TBLSEQ, RCNSEQ, POSNAM, CHKFLG, REGDAT) VALUES (?, 'C', '신규 주문이 있습니다', ?, ?, ?, '', 'N', now());";
                                connection.query(q2, [stoseq, userid, tblseq, rcnseq], function(err, rows, fields){
                                    if(err){
                                        console.error(err);
                                    } else {
                                        socketApi.sendPosCall(stoseq);
                                        socketApi.sendAlarmCall(stoseq);

                                        let result = new Object;
                                        result.ResultCode = 100;
                                        res.json(result);
                                    }
                                });
                            }
                        });
                    }
                });
            }
        }
    });
});


router.post('/user_cart_order_m', async function(req, res, next) {
    let stoseq = req.body.STOSEQ;
    let userid = req.body.USERID;
    let totamt = req.body.TOTAMT;
    let tblseq = req.body.TBLSEQ;
    let regdat = "now()";

    let prdnum = req.body.PRDNUM;

    let prdseq = req.body.PRDSEQ.split("/");
    let optseq = req.body.OPTSEQ.split("/")
    let prdqty = req.body.PRDQTY.split("/");
    let detcst = req.body.DETCST.split("/");


    let result = new Object;

    let findFirst = "select ORDCNT from RCNMST where STOSEQ=? and TBLSEQ=? and FINISH='N' order by REGDAT desc limit 1;";
    connection.query(findFirst, [stoseq, tblseq], function(err, rows, fields){
        if(err) {
            console.error("RCNMST FIND ORDCNT ERROR", err);
            let obj = new Object;
            obj.ResultCode = 200;
            res.json(obj);
        } else {
            let ORDCNT = 1;
            if(rows.length != 0) {
                ORDCNT = rows[0].ORDCNT*1 + 1;
            }
            let insertRCNMST = "insert into RCNMST (STOSEQ, TOTAMT, TBLSEQ, REGDAT, USERID, CHKFLG, PAYFLG, FINISH, ORDCNT) values (?, ?, ?, now(), ?, 'N', 'N', 'N', ?);";

            connection.query(insertRCNMST, [stoseq, totamt, tblseq, userid, ORDCNT], function(err, rows, fields){
                if(err) {
                    result.ResultCode = 200;
                    res.json(result);
                } else {
                    let rcnseq = rows.insertId;
                    for(let i=0; i<prdnum; i++) {
                        let insertRCNDET = "insert into RCNDET (STOSEQ, RCNSEQ, PRDSEQ, PRDQTY, DETCST) values ("+stoseq+", " + rcnseq + ", " + prdseq[i] + ", " + prdqty[i] + ", " + detcst[i] + ");";
                        connection.query(insertRCNDET, function(err, rows2, fields){
                            if(err) {
                                result.ResultCode = 200;
                                res.json(result);
                            } else {
                                let rcndetseq = rows2.insertId;
                                let options = optseq[i].split(",");
                
                                for(let j=0; j<options.length; j++) {
                                    if(options[j] != "") { 
                                        let insertOPTSET = "insert into OPTSET (STOSEQ, RCNDETSEQ, OPTSEQ) values ("+stoseq+", " + rcndetseq + ", " + options[j] +");";
                                        run_query(insertOPTSET, "");
                                    }
                                }
        
                                
                            }
                        });
                    }
                    let q2 = "INSERT INTO CALMST (STOSEQ, CALTYP, CALNAM, USERID, TBLSEQ, RCNSEQ, POSNAM, CHKFLG, REGDAT) VALUES (?, 'C', '신규 주문이 있습니다', ?, ?, ?, '', 'N', now());";
                    connection.query(q2, [stoseq, userid, tblseq, rcnseq], function(err, rows, fields){
                        if(err){
                            console.error(err);
                        } else {
                            socketApi.sendPosCall(stoseq);
                            socketApi.sendAlarmCall(stoseq);
                        }
                    });
                }
            });
            result.ResultCode = 100;
            res.json(result);
        }
    });
});

//주문 내역
router.post('/user_history_m', function(req, res, next) {
    let stoseq = req.body.STOSEQ;
    let userid = req.body.USERID;

    let result = new Object;
    let history = [];
    let array_name = "history";

    let selectRCNMST = "select B.ID, date_format(A.REGDAT, '%Y/%m/%d') as REGDAT, B.PRDSEQ, D.PRDNAM, D.PRDEXP, F.FILURL, E.ID as OPTSEQ, E.OPTNAM, B.PRDQTY, B.DETCST " 
                    + "from RCNMST as A "
                    + "left join RCNDET as B on (A.ID = B.RCNSEQ) "
                    + "left join OPTSET as C on (B.ID = C.RCNDETSEQ) "
                    + "left join PRDMST as D on (B.PRDSEQ = D.ID) "
                    + "left join OPTMST as E on (E.ID = C.OPTSEQ) "
                    + "left join PRDFIL_M as F on (B.PRDSEQ = F.PRDSEQ) "
                    + "where A.STOSEQ=? and USERID=? order by A.REGDAT desc, B.ID desc;";
    connection.query(selectRCNMST, [stoseq, userid], function(err, rows, fields){
        if(err) {
            console.error("RCNMST SELECTION ERROR", err);
            let obj = new Object;
            obj.ResultCode = 200;
            res.json(obj);
        } else {
            if(rows.length != 0) {
                let tmpId = rows[0].ID;
                let OPT = [];
    
                let obj = new Object;
                obj.RCNDETSEQ = tmpId;
                obj.REGDAT    = rows[0].REGDAT;
                obj.PRDSEQ    = rows[0].PRDSEQ;        
                obj.PRDNAM    = rows[0].PRDNAM;
                obj.PRDEXP    = rows[0].PRDEXP;
                obj.FILURL    = rows[0].FILURL;
                obj.PRDQTY    = rows[0].PRDQTY;
                obj.DETCST    = rows[0].DETCST;
    
                let tmpobj = new Object;
                
                for(let i=0; i<rows.length; i++) {
                    if(tmpId == rows[i].ID) {
                        
                        tmpobj = new Object;
    
                        tmpobj.OPTSEQ = rows[i].OPTSEQ;
                        tmpobj.OPTNAM = rows[i].OPTNAM;
    
                        OPT.push(tmpobj);
    
                        if(i == rows.length-1) {
                            obj.OPTION = OPT;
                            history.push(obj);
                        }
    
                    } else {
                        obj.OPTION = OPT;
    
                        history.push(obj);
    
                        OPT = [];
                        obj = new Object;
                        obj.RCNDETSEQ = rows[i].ID;
                        obj.REGDAT    = rows[i].REGDAT;
                        obj.PRDSEQ    = rows[i].PRDSEQ;
                        obj.PRDNAM    = rows[i].PRDNAM;
                        obj.PRDEXP    = rows[i].PRDEXP;
                        obj.FILURL    = rows[i].FILURL;                
                        obj.PRDQTY    = rows[i].PRDQTY;
                        obj.DETCST    = rows[i].DETCST;
                        
                        tmpobj = new Object;
    
                        tmpobj.OPTSEQ = rows[i].OPTSEQ;
                        tmpobj.OPTNAM = rows[i].OPTNAM;
                        OPT.push(tmpobj);
    
                        tmpId = rows[i].ID;
    
                        if(i == rows.length-1) {
                            obj.OPTION = OPT;
                            history.push(obj);
                        }
                    }
                }
                result.array_name = array_name;
                result[array_name] = history;
                result.ResultCode = 100;
                res.json(result);
            } else {
                result.array_name = array_name;
                result[array_name] = history;
                result.ResultCode = 100;
                res.json(result);
            }
        }
    });
});

//전체 주문 목록
router.post('/getorder_m', function(req, res ,next){
    let stoseq = req.body.STOSEQ;
    
    let q = "select F.MOBNUM, A.ID as RCNSEQ, B.ID as RCNDETSEQ, A.TBLSEQ, G.TBLNAM, A.TOTAMT, date_format(A.REGDAT, '%Y/%m/%d %H:%i') as REGDAT, A.USERID, D.PRDNAM, B.PRDQTY, E.OPTNAM from RCNMST as A "
        + "left join RCNDET as B on A.ID=B.RCNSEQ "
        + "left join OPTSET as C on B.ID=C.RCNDETSEQ "
        + "left join PRDMST as D on D.ID=B.PRDSEQ "
        + "left join OPTMST as E on E.ID=C.OPTSEQ "
        + "left join USRMST as F on F.USERID=A.USERID "
        + "left join TBLSTO as G on G.ID=A.TBLSEQ "
        + "where A.STOSEQ=? and A.FINISH='N' "
        + "order by REGDAT, RCNDETSEQ;";

    connection.query(q, [stoseq], function(err, rows, fields) {
        if(err) { console.error(err); }
        else {
            let order_id = rows[0].RCNSEQ;
            let order_product_id = rows[0].RCNDETSEQ;
    
            let orders = [];
            let products = [];
    
            let order = new Object;
            let product = new Object;
    
            order.TBLSEQ = rows[0].TBLSEQ;
            order.TBLNAM = rows[0].TBLNAM;
            order.MOBNUM = rows[0].MOBNUM;
            order.REGDAT = rows[0].REGDAT;
            order.USERID = rows[0].USERID;
            order.TOTAMT = rows[0].TOTAMT;
    
            product.PRDQTY = rows[0].PRDQTY;
            product.PRDNAM = rows[0].PRDNAM;
    
            let option = rows[0].OPTNAM;
    
            for(let i=1; i<rows.length; i++) {
                if(order_id == rows[i].RCNSEQ) {
                    if(order_product_id == rows[i].RCNDETSEQ) {
                        option += ", " + rows[i].OPTNAM;
                    } else {
                        //기존 물품 저장
                        product.OPTION = option;
                        products.push(product);
    
                        //새로 등록
                        product = new Object;
                        product.PRDQTY = rows[i].PRDQTY;
                        product.PRDNAM = rows[i].PRDNAM;
                        option = rows[i].OPTNAM;
    
                        order_product_id = rows[i].RCNDETSEQ;
                    }
                } else {
    
                    product.OPTION = option;
                    products.push(product);
    
                    product = new Object;
                    product.PRDQTY = rows[i].PRDQTY;
                    product.PRDNAM = rows[i].PRDNAM;
                    option = rows[i].OPTNAM;
    
                    order.products = products;
                    orders.push(order);
                    
                    order = new Object;
                    products = [];
    
                    order.TBLSEQ = rows[i].TBLSEQ;
                    order.TBLNAM = rows[i].TBLNAM;
                    order.MOBNUM = rows[i].MOBNUM;                
                    order.REGDAT = rows[i].REGDAT;
                    order.USERID = rows[i].USERID;
                    order.TOTAMT = rows[i].TOTAMT;
    
                    order_product_id = rows[i].RCNDETSEQ;
                    order_id = rows[i].RCNSEQ;
                }
    
                if(i == rows.length - 1) {
                    product.OPTION = option;
                    products.push(product);
                    order.products = products;
                    orders.push(order);
                }
            }
            let result = new Object;
            array_name = "orders";
            result.array_name = array_name;
            result[array_name] = orders;
            result.ResultCode = 100;
            res.json(result);
        }
    });
});

//테이블용 주문 목록
router.post('/mobile/pos/getOrder', function(req, res, next){
    let STOSEQ = req.body.STOSEQ;

    let q = "select F.MOBNUM, A.ID as RCNSEQ, B.ID as RCNDETSEQ, A.TBLSEQ, G.FLRSEQ, G.TBLNAM, A.TOTAMT, date_format(A.REGDAT, '%H:%i') as REGDAT, A.USERID, D.PRDNAM, B.PRDQTY, A.CHKFLG, A.PAYFLG " 
          + "from RCNMST as A "
          + "left join RCNDET as B on A.ID=B.RCNSEQ "
          + "left join OPTSET as C on B.ID=C.RCNDETSEQ "
          + "left join PRDMST as D on D.ID=B.PRDSEQ "
          + "left join OPTMST as E on E.ID=C.OPTSEQ "
          + "left join USRMST as F on F.USERID=A.USERID "
          + "left join TBLSTO as G on G.ID=A.TBLSEQ "
          + "where A.STOSEQ=? and A.FINISH='N' "
          + "group by RCNSEQ, RCNDETSEQ "
          + "order by REGDAT, RCNDETSEQ, TBLSEQ;";

    connection.query(q, [STOSEQ], function(err, rows, fields) {
        if(err) { console.error(err); }
        else {
            let flrseq   = rows[0].FLRSEQ;
            let tblseq   = rows[0].TBLSEQ;
            let rcnseq   = rows[0].RCNSEQ;
            let tblnam   = rows[0].TBLNAM;
            let mobnum   = rows[0].MOBNUM.slice(-4);
            let totamt   = rows[0].TOTAMT * 1;

            let result = new Object();
            
            let orders = [];
            let product = [];

            let obj = new Object();
            let prd = new Object();

            for(let i=0; i<rows.length; i++) {
                if(rows[i].TBLSEQ == tblseq) {
                    //같은 테이블
                    if(rows[i].RCNSEQ == rcnseq) {
                        prd = new Object();
                        prd.PRDNAM = rows[i].PRDNAM;
                        prd.PRDQTY = rows[i].PRDQTY;
                        product.push(prd);

                        if(i == rows.length - 1) {
                            obj.FLRSEQ  = flrseq;
                            obj.TBLSEQ  = tblseq;
                            obj.TBLNAM  = tblnam;
                            obj.MOBNUM  = mobnum;
                            obj.TOTAMT  = totamt;
                            obj.REGDAT  = rows[i].REGDAT;
                            obj.product = product;
                            orders.push(obj);
                        }
                    } else {
                        totamt += rows[i].TOTAMT;
                        
                        rcnseq   = rows[i].RCNSEQ;

                        flrseq   = rows[i].FLRSEQ;
                        tblseq   = rows[i].TBLSEQ;
                        tblnam   = rows[i].TBLNAM;
                        rcnseq   = rows[i].RCNSEQ;
                        mobnum   = rows[i].MOBNUM.slice(-4);

                        prd = new Object();
                        prd.PRDNAM = rows[i].PRDNAM;
                        prd.PRDQTY = rows[i].PRDQTY;
                        product.push(prd);

                        if(i == rows.length - 1) {
                            obj.FLRSEQ  = flrseq;
                            obj.TBLSEQ  = tblseq;
                            obj.TBLNAM  = tblnam;
                            obj.MOBNUM  = mobnum;
                            obj.TOTAMT  = totamt;
                            obj.REGDAT  = rows[i].REGDAT;
                            obj.product = product;
                            orders.push(obj);
                        }
                    }
                } else {
                    obj.FLRSEQ  = flrseq;
                    obj.TBLSEQ  = tblseq;
                    obj.TBLNAM  = tblnam;
                    obj.MOBNUM  = mobnum;
                    obj.TOTAMT  = totamt;
                    obj.REGDAT  = rows[i].REGDAT;
                    obj.product = product;
                    orders.push(obj);

                    obj = new Object();
                    rcnseq = rows[i].RCNSEQ;
                    flrseq = rows[i].FLRSEQ;
                    tblseq = rows[i].TBLSEQ;
                    tblnam = rows[i].TBLNAM;
                    mobnum = rows[i].MOBNUM.slice(-4);
                    totamt = rows[i].TOTAMT;
                    product = [];
                    prd = new Object();
                    prd.PRDNAM = rows[i].PRDNAM;
                    prd.PRDQTY = rows[i].PRDQTY;
                    product.push(prd);

                    if(i == rows.length - 1) {
                        obj.FLRSEQ  = flrseq;
                        obj.TBLSEQ  = tblseq;
                        obj.TBLNAM  = tblnam;
                        obj.MOBNUM  = mobnum;
                        obj.TOTAMT  = totamt;
                        obj.REGDAT  = rows[i].REGDAT;
                        obj.product = product;
                        orders.push(obj);
                    }
                }
            }
            result.ResultCode = 100;
            result.orders = orders;
            res.json(result);
        }
    });
});

//테이블 개별 주문 목록
router.post('/mobile/pos/getTableOrder', function(req, res, next){
    let STOSEQ = req.body.STOSEQ;
    let TBLSEQ = req.body.TBLSEQ;

    let q = "select A.ID as RCNSEQ, C.ID as RCNDETSEQ, A.ORDCNT, B.TBLNAM, G.MOBNUM, C.PRDQTY, C.DETCST, GROUP_CONCAT(E.OPTNAM) as OPTNAM, F.PRDNAM, A.CHKFLG, A.PAYFLG, date_format(A.REGDAT, '%Y/%m/%d %H:%i') as REGDAT from RCNMST as A "
          + "left join TBLSTO as B on A.TBLSEQ=B.ID "
          + "left join RCNDET as C on C.RCNSEQ=A.ID "
          + "left join OPTSET as D on D.RCNDETSEQ=C.ID "
          + "left join OPTMST as E on D.OPTSEQ=E.ID "
          + "left join PRDMST as F on F.ID=C.PRDSEQ "
          + "left join USRMST as G on G.USERID=A.USERID "
          + "where A.STOSEQ=? and A.TBLSEQ=? and A.FINISH='N' "
          + "group by C.ID order by A.REGDAT;";

    connection.query(q, [STOSEQ, TBLSEQ], function(err, rows, fields){
        if(err) {
            console.error(err);
            let obj = new Object();
            obj.ResultCode = 200;
            res.json(obj);
        } else {
            let result = new Object();
            let order = [];
            let array_name = "order";
            if(rows.length == 0) {
                result.ResultCode = 300;
                res.json(result);
            } else {
                let TOTAMT = 0;

                for(let i=0; i<rows.length; i++) {
                    TOTAMT += rows[i].DETCST;

                    let obj = new Object();
                    obj.ORDCNT = rows[i].ORDCNT;
                    obj.PRDNAM = rows[i].PRDNAM;
                    obj.PRDOPT = rows[i].OPTNAM;
                    if(_.isNull(rows[i].OPTNAM)) {
                        obj.PRDOPT = "옵션 없음";
                    }
                    obj.DETCST = rows[i].DETCST;
                    obj.PRDQTY = rows[i].PRDQTY;
                    obj.CHKFLG = rows[i].CHKFLG;
                    obj.MOBNUM = rows[i].MOBNUM.slice(-4);
                    obj.ORDTIM = rows[i].REGDAT;
                
                    order.push(obj);
                }
                result.MOBNUM = rows[0].MOBNUM.slice(-4);
                result.TBLNAM = rows[0].TBLNAM;
                result.PAYFLG = rows[0].PAYFLG;
                result.TOTAMT = TOTAMT;
                result.ResultCode = 100;
                result.array_name = array_name;
                result[array_name] = order;
                res.json(result);
            }
        }
    });
})

router.post('/mobile/pos/getOrderList', function(req, res, next){
    let STOSEQ = req.body.STOSEQ;

    let q = "select * from (select C.MOBNUM, C.USRGRD, C.USERID, B.ID, B.TBLNAM, A.REGDAT as FULLREGDAT, date_format(A.REGDAT, '%H:%i') as REGDAT, (UNIX_TIMESTAMP(A.REGDAT)*1000) as REGDAT_MIL, A.CHKFLG, A.PAYFLG, A.ORDCNT as ORDCNT from RCNMST as A "
            + "left join TBLSTO as B on B.ID=A.TBLSEQ "
            + "left join USRMST as C on C.USERID=A.USERID "
            + "where A.STOSEQ=? and A.FINISH='N' order by A.REGDAT) as K,"
            + "(select MAX(REGDAT) as L from RCNMST group by TBLSEQ) as P "
            + "where K.FULLREGDAT=P.L order by K.FULLREGDAT;"
    let time = new Date();
    let miltime = time.getTime();


    connection.query(q, [STOSEQ], function(err, rows, fields) {
        if(err) { 
            console.error(err); 
            let result = new Object();
            result.ResultCode = 200;
            result.msg = "오류 발생";
            res.json(result);
        }
        else {
            let orders = [];
            for(let i=0; i<rows.length; i++) {
                let obj = new Object();
                obj.MOBNUM = rows[i].MOBNUM.slice(-4);
                obj.USRGRD = rows[i].USRGRD;
                obj.USERID = rows[i].USERID;
                obj.TBLSEQ = rows[i].ID;
                obj.TBLNAM = rows[i].TBLNAM;
                obj.REGDAT = rows[i].REGDAT;
                obj.CHKFLG = rows[i].CHKFLG;
                obj.PAYFLG = rows[i].PAYFLG;
                obj.ORDCNT = rows[i].ORDCNT;

                let timegap = new Date(0,0,0,0,0,0,miltime - rows[i].REGDAT_MIL);
                let diffHour = timegap.getHours();
                let diffMin = timegap.getMinutes();
                
                obj.TIMELEFT = diffHour + ":" + diffMin;

                orders.push(obj);
            }
            let result = new Object();
            result.ResultCode = 100;
            result.array_name = "orders";
            result.orders = orders;
            res.json(result);
        }
    });
})

router.post('/mobile/pos/checkOrder', function(req, res, next){
    let STOSEQ = req.body.STOSEQ;
    let TBLSEQ = req.body.TBLSEQ;

    let q = "update RCNMST set CHKFLG='Y' where STOSEQ=? and TBLSEQ=?;";
    connection.query(q, [STOSEQ, TBLSEQ], function(err, rows, fields){
        if(err) {
            console.error(err);
            let result = new Object();
            result.ResultCode = 200;
            result.msg = "오류 발생";
            res.json(result);
        } else {
            let result = new Object();
            result.ResultCode = 100;
            res.json(result);
        }
    });

});

//NCALL2 동영상 목록 
router.post('/ncall2_url_m', function(req, res, next){
    let stoseq = req.body.STOSEQ;
    let q1 = "select * from NCALL2INFO where STOSEQ="+ stoseq +";";
    let q2 = "select * from NCALL2 where STOSEQ=" + stoseq + ";";
    
    let SHWTIM = 2;
    let URLS = [];
    let array_name = "URLS";

    let result = new Object;

    connection.query(q1, function(err, rows, fields){
        if(err) { console.error(err); }
        else {
            SHWTIM = rows[0].SHOWTIME;
            connection.query(q2, function(err, rows, fields) {
                if(err) {
                    let obj = new Object;
                    
                    obj.ResultCode = 200;
                    res.json(obj);
                } else {
                    for(let i=0; i<rows.length; i++) {
                        URLS.push(rows[i].YTBURL);
                    }
                    result.array_name = array_name;
                    result[array_name] = URLS;
                    result.SHWTIM = SHWTIM;
                    result.ResultCode = 100;
                    console.log(result);
                    res.json(result);
                }
            });
        }
    });
});

//NFC 태그 정보
router.post('/getTagData_m', function(req, res, next){
    let stoseq = req.body.STOSEQ;
    let rcntyp = req.body.RCNTYP;
    let flrseq = req.body.FLRSEQ;
    let tblseq = req.body.TBLSEQ;

    console.log(stoseq);
    console.log(rcntyp);
    console.log(flrseq);
    console.log(tblseq);

    let q = "select A.STONAM, B.FLRNAM, C.TBLNAM from STOMST as A "
        + "left join STOFLR as B on B.ID=? "
        + "left join TBLSTO as C on C.ID=? "
        + "where A.ID=?;"

    connection.query(q, [flrseq, tblseq, stoseq], function(err, rows, fields){
        if(err) {
            console.error(err);
            let result = new Object;
            result.ResultCode = 200;
            res.json(result);
        } else {
            let result = new Object;
            result.STONAM = rows[0].STONAM;
            result.FLRNAM = rows[0].FLRNAM;
            result.TBLNAM = rows[0].TBLNAM;
            result.RCNTYP = rcntyp;
            result.ResultCode = 100;

            res.json(result);
        }
    });

});

router.post('/getStoseq_m', function(req, res, next){
    let q = "select ID, STONAM from STOMST;";

    let store = [];
    let array_name = "store";

    connection.query(q, function(err, rows, fields){
        if(err) {
            console.error(err);
            let result = new Object;
            result.ResultCode = 200;
            res.json(result);
        } else {
            for(let i=0; i<rows.length; i++) {
                let obj = new Object;
                obj.STOSEQ = rows[i].ID;
                obj.STONAM = rows[i].STONAM;
                store.push(obj);
            }
    
            let result = new Object;
            result.array_name = array_name;
            result[array_name] = store;
            result.ResultCode = 100;
            console.log(result);
            res.json(result);
        }
    });
});

router.post('/getFlrseq_m', function(req, res, next){
    let stoseq = req.body.STOSEQ;

    let q = "select ID, FLRNAM from STOFLR where STOSEQ=? order by ORDNUM";
    let floor = [];
    let array_name = "floor";
    connection.query(q, [stoseq], function(err, rows, fields){
        if(err) {
            let result = new Object;
            result.ResultCode = 200;
            res.json(result);
        } else {
            for(let i=0; i<rows.length; i++) {
                let obj = new Object;
                obj.FLRSEQ = rows[i].ID;
                obj.FLRNAM = rows[i].FLRNAM;
                floor.push(obj);
            }
    
            let result = new Object;
            result.array_name = array_name;
            result[array_name] = floor;
            result.ResultCode = 100;
            console.log(result);
            
            res.json(result);
        }
    });
});

router.post('/getTblseq_m', function(req, res, next){
    let stoseq = req.body.STOSEQ;
    let flrseq = req.body.FLRSEQ;

    let q = "select ID, TBLNAM from TBLSTO where FLRSEQ=? and STOSEQ=?;";
    let table = [];
    let array_name = "table";
    connection.query(q, [flrseq, stoseq], function(err, rows, fields){
        if(err) {
            console.error(err);
            let result = new Object;
            result.ResultCode = 200;
            res.json(result);
        } else {
            for(let i=0; i<rows.length; i++) {
                let obj = new Object;
                obj.TBLSEQ = rows[i].ID;
                obj.TBLNAM = rows[i].TBLNAM;
                table.push(obj);
            }
    
            let result = new Object;
            result.array_name = array_name;
            result[array_name] = table;
            result.ResultCode = 100;
            console.log(result);
            
            res.json(result);
        }
    });
});

//모바일 호출
router.post('/mobile/alarm/call_select', function(req, res, next){
    let STOSEQ = req.body.STOSEQ;

    let array_name = "calls";
    let result = new Object();
    result.array_name = array_name;

    let q = "select A.ID, A.CALNAM, A.USERID, A.RCNSEQ, B.TBLNAM from CALMST as A "
    + "left join TBLSTO as B on B.ID=A.TBLSEQ "
    + "where A.STOSEQ=? and A.CALTYP='C' order by A.REGDAT desc limit 3;";

    connection.query(q, [STOSEQ], function(err, rows, fields){
        if(err) {
            console.error(err);
            result.ResultCode = 200;
            res.json(result);
        } else {
            let calls = [];
            console.log(rows);
            for(let i=0; i<rows.length; i++) {
                if(rows[i].RCNSEQ != null) {
                    //주문일 경우
                    let q2 = "select A.ID, B.PRDNAM, A.PRDQTY, D.OPTNAM from RCNDET as A "
                           + "left join PRDMST as B on B.ID=A.PRDSEQ "
                           + "left join OPTSET as C on A.ID=C.RCNDETSEQ "
                           + "left join OPTMST as D on D.ID=C.OPTSEQ "
                           + "where A.STOSEQ=? and A.RCNSEQ=? "
                           + "order by B.PRDNAM, A.ID;";
                    connection.query(q2, [STOSEQ, rows[i].RCNSEQ], function(err, rows2, fields){
                        if(err) {
                            console.error(err);
                            result.ResultCode = 200;
                            res.json(result);
                        } else {
                            console.log(rows2);
                            let full = "";

                            let id = rows2[0].ID;

                            let prdnam = rows2[0].PRDNAM;
                            let prdqty = rows2[0].PRDQTY;
                            let option = "";

                            for(let j=0; j<rows2.length; j++){
                                if(rows2[j].ID == id) {
                                    option += rows2[j].OPTNAM + ", ";
                                    if(j == rows2.length-1) {
                                        full += prdnam + " (" + option.slice(0,-2) + ") " + prdqty +"개\n";
                                    }
                                } else {
                                    full += prdnam + " (" + option.slice(0,-2) + ") " + prdqty +"개\n";
                                    
                                    id = rows2[j].ID;
                                    prdnam = rows2[j].PRDNAM;
                                    prdqty = rows2[j].PRDQTY;
                                    option = rows2[j].OPTNAM + ", ";
                                    
                                    if(j == rows2.length-1) {
                                        full += prdnam + " ( " + option.slice(0,-2) + ") " + prdqty +"개\n";
                                    }
                                }
                            }
                            let obj = new Object();
                            obj.TBLNAM = rows[i].TBLNAM;
                            obj.CALL = full.slice(0,-1);
                            calls.push(obj);

                            if(i == rows.length-1){
                                console.log(calls);
                                result.ResultCode = 100;
                                result[array_name] = calls;
                                
                                res.json(result);
                            }
                        }
                    });
                } else {
                    //일반 호출
                    let obj = new Object();
                    obj.TBLNAM = rows[i].TBLNAM;
                    obj.CALL = rows[i].CALNAM;
                    calls.push(obj);

                    if(i == rows.length-1){
                        console.log(calls);
                        result.ResultCode = 100;
                        result[array_name] = calls;
                        
                        res.json(result);
                    }
                }
            }
            
        }
    })

});
//NCALL 세팅
router.post('/mobile/alarm/setting', function(req, res, next){
    let STOSEQ = req.body.STOSEQ;

    let q = "select * from NCALL where STOSEQ=?";
    
    connection.query(q, [STOSEQ], function(err, rows, fields){
        if(err) {
            console.error(err);
            let obj = new Object();
            obj.ResultCode = 200;
            obj.msg = "오류 발생";
            res.json(obj);
        } else {
            if(rows.length == 0) {
                let obj = new Object();
                obj.ResultCode = 300;
                obj.msg = "등록된 설정 정보가 없습니다\n주변기기 설정을 확인해주세요";
                res.json(obj);
            } else if(rows.length == 1) {
                let obj = new Object();
                obj.ResultCode = 100;
                obj.ALMGBN = rows[0].ALMGBN;
                obj.ALMTIM = rows[0].ALMTIM;
                obj.ALMADV = rows[0].ALMADV;
                res.json(obj);
            } else {
                let obj = new Object();
                obj.ResultCode = 400;
                obj.msg = "등록된 설정 정보가 두개 이상입니다\n주변기기 설정을 확인해주세요";
                res.json(obj);
            }
            
        }
    });

});
//NCALL 광고
router.post('/mobile/alarm/adv_select', function(req, res, next){
    let STOSEQ = req.body.STOSEQ;

    let q = "select * FROM NCALLADV where STOSEQ=? and FILTYP='P';";

    let obj = new Object();
    
    connection.query(q, [STOSEQ], function(err, rows, fields){
        if(err) {
            console.error(err);
            obj.ResultCode = 200;
            obj.msg = "에러 발생";
            res.json(obj);
        } else {
            let advs = [];
            for(let i=0; i<rows.length; i++) {
                advs.push(rows[i].FILURL);
            }
            obj.ResultCode = 100;
            obj.advs = advs;
            res.json(obj);
        }
    });

});
//NCALL 포스 호출
router.post('/mobile/alarm/call_from_pos', function(req, res, next){
    let STOSEQ = req.body.STOSEQ;

    let q = "select * from CALMST where STOSEQ=? order by REGDAT desc limit 1;";
    connection.query(q, [STOSEQ], function(err, rows, fields){
        if(err) {
            console.error(err);
            let obj = new Object();
            obj.ResultCode = 200;
            res.json(obj);
        } else {
            let obj = new Object();
            obj.CALNAM = rows[0].CALNAM;
            obj.ResultCode = 100;
            res.json(obj);
        }
    });
});
//결제 완료
router.post('/mobile/pos/payComplete', function(req, res, next){
    let STOSEQ = req.body.STOSEQ;
    let TBLSEQ = req.body.TBLSEQ;

    let q1 = "select TOTAMT from RCNMST where STOSEQ=? and TBLSEQ=?;";
    connection.query(q1, [STOSEQ, TBLSEQ], function(err, rows, fields){
        if(err) {
            console.error(err);
            let obj = new Object();
            obj.ResultCode = 200;
            res.json(obj); 
        } else {
            let total_cost = 0;
            for(let i=0; i<rows.length; i++) {
                total_cost += rows[i].TOTAMT;
            }
            
            let q2 = "update RCNMST set PAYFLG='Y', PAYDAT=now() where STOSEQ=? and TBLSEQ=?;";
            connection.query(q2, [STOSEQ, TBLSEQ], function(err, rows, fields){
                if(err) {
                    console.error(err);
                    let obj = new Object();
                    obj.ResultCode = 200;
                    res.json(obj); 
                } else {
                    let q3 = "update SALMST set TBLAMT=TBLAMT+"+total_cost+", TBLCNT=TBLCNT+1, CSHAMT=CSHAMT+"+total_cost+" "
                            + "where STOSEQ=? and ENDFLG='N';"
                    connection.query(q3, [STOSEQ], function(err, rows, fields){
                        if(err) {
                            console.error(err);
                            let obj = new Object();
                            obj.ResultCode = 200;
                            res.json(obj);
                        } else {
                            let obj = new Object();
                            obj.ResultCode = 100;
                            res.json(obj);
                        }
                    });
                }
            });
        }
    });
});
//판매 완료
router.post('/mobile/pos/saleComplete', function(req, res, next){
    let STOSEQ = req.body.STOSEQ;
    let TBLSEQ = req.body.TBLSEQ;

    let q1 = "select TOTAMT, PAYFLG from RCNMST where STOSEQ=? and TBLSEQ=?;";
    connection.query(q1, [STOSEQ, TBLSEQ], function(err, rows, fields){
        if(err) {
            console.error(err);
            let obj = new Object();
            obj.ResultCode = 200;
            res.json(obj); 
        } else {
            let total_cost = 0;
            let PAYFLG = 'N';
            for(let i=0; i<rows.length; i++) {
                total_cost += rows[i].TOTAMT;
                PAYFLG = rows[i].PAYFLG;
            }
            if(PAYFLG == 'N') {
                //결제 안한 경우
                let q2 = "update RCNMST set PAYFLG='Y', FINISH='Y', PAYDAT=now(), SALDAT=now() where STOSEQ=? and TBLSEQ=?;";
                connection.query(q2, [STOSEQ, TBLSEQ], function(err, rows, fields){
                    if(err) {
                        console.error(err);
                        let obj = new Object();
                        obj.ResultCode = 200;
                        res.json(obj); 
                    } else {
                        let q3 = "update SALMST set TBLAMT=TBLAMT+"+total_cost+", TBLCNT=TBLCNT+1, CSHAMT=CSHAMT+"+total_cost+" "
                        + "where STOSEQ=? and FINISH='N';"
                        connection.query(q3, [STOSEQ], function(err, rows, fields){
                            if(err) {
                                console.error(err);
                                let obj = new Object();
                                obj.ResultCode = 200;
                                res.json(obj);
                            } else {
                                let obj = new Object();
                                obj.ResultCode = 100;
                                res.json(obj);
                            }
                        });
                    }
                });
            } else {
                //결제 한 경우
                let q2 = "update RCNMST set FINISH='Y', SALDAT=now() where STOSEQ=? and TBLSEQ=?;";
                connection.query(q2, [STOSEQ, TBLSEQ], function(err, rows, fields){
                    if(err) {
                        console.error(err);
                        let obj = new Object();
                        obj.ResultCode = 200;
                        res.json(obj); 
                    } else {
                        let obj = new Object();
                        obj.ResultCode = 100;
                        res.json(obj);
                    }
                });
            }
        }
    });
});

//모바일 영업 확인
router.post('/mobile/checkSale', function(req, res, next){
    let STOSEQ = req.body.STOSEQ;

    let q = "select * from SALMST where STOSEQ=? and ENDFLG='N';";

    let obj = new Object();

    connection.query(q, [STOSEQ], function(err, rows, fields){
        if(err) {
            console.error(err);
            obj.ResultCode = 200;
            res.json(obj);
        } else {
            if(rows.length == 0) {
                //영업 중 x
                obj.ResultCode = 300;
                res.json(obj);
            } else {
                //영업 중
                obj.ResultCode = 100;
                res.json(obj);
            }
        }
    });
});

//버전 체크
router.post('/mobile/android/nstar/version', function(req, res, next){

    let q = "select VERSION from APPVERSION where APPNAM='NSTAR2.0';";
    connection.query(q, function(err, rows, fields){
        if (err) {
            console.error(err);
            let result = new Object();
            result.ResultCode = 100;
            res.json(result);
        } else {
            let result = new Object();
            result.versionCode = rows[0].VERSION;
            result.ResultCode = 100;
            res.json(result);
        }
    });
});
router.post('/mobile/android/npos/version', function(req, res, next){
    let q = "select VERSION from APPVERSION where APPNAM='NPOS2.0';";
    connection.query(q, function(err, rows, fields){
        if (err) {
            console.error(err);
            let result = new Object();
            result.ResultCode = 100;
            res.json(result);
        } else {
            let result = new Object();
            result.versionCode = rows[0].VERSION;
            result.ResultCode = 100;
            res.json(result);
        }
    });
});
router.post('/mobile/android/ncall/version', function(req, res, next){
    let q = "select VERSION from APPVERSION where APPNAM='NCALL2.0';";
    connection.query(q, function(err, rows, fields){
        if (err) {
            console.error(err);
            let result = new Object();
            result.ResultCode = 100;
            res.json(result);
        } else {
            let result = new Object();
            result.versionCode = rows[0].VERSION;
            result.ResultCode = 100;
            res.json(result);
        }
    });
});
router.post('/mobile/android/ncall2/version', function(req, res, next){
    let q = "select VERSION from APPVERSION where APPNAM='NCALL3.0';";
    connection.query(q, function(err, rows, fields){
        if (err) {
            console.error(err);
            let result = new Object();
            result.ResultCode = 100;
            res.json(result);
        } else {
            let result = new Object();
            result.versionCode = rows[0].VERSION;
            result.ResultCode = 100;
            res.json(result);
        }
    });
});

router.post('/versionUpdate', function(req, res, next){
    let APPNAM = req.body.APPNAM;
    let VERSION = req.body.VERSION;

    let q = "update APPVERSION set VERSION=? where APPNAM=?;";
    connection.query(q, [VERSION, APPNAM], function(err, rows, fields){
        if(err) {
            console.error(err);
            let obj = new Object();
            obj.resultCode = 200;
            res.json(obj);
        } else {
            let obj = new Object();
            obj.resultCode = 100;
            res.json(obj);
        }
    });
});

// INIT
router.get('/init', function (req, res, next) {
    run_query(create.ADMMST(), "ADMMST CREATED");
    run_query(create.APPVERSION(), "");
    run_query(create.CALMST(), "");
    run_query(create.CATMST(), "");
    run_query(create.EVTFIL_D(), "");
    run_query(create.EVTFIL_M(), "");
    run_query(create.EVTMST(), "");
    run_query(create.NCALL(), "");
    run_query(create.NCALL2(), "");
    run_query(create.NCALL2INFO(), "");
    run_query(create.NCALLADV(), "");
    run_query(create.OPTCAT(), "");
    run_query(create.OPTMST(), "");
    run_query(create.OPTSET(), "");
    run_query(create.POSMST(), "");
    run_query(create.PRDFIL_D(), "");
    run_query(create.PRDFIL_M(), "");
    run_query(create.PRDMST(), "");
    run_query(create.PRDOPT(), "");
    run_query(create.PRDSET(), "");
    run_query(create.RCNDET(), "");
    run_query(create.RCNMST(), "");
    run_query(create.RCNRCT(), "");
    run_query(create.SALMST(), "");
    run_query(create.SALSIO(), "");
    run_query(create.SETMST(), "");
    run_query(create.STOCAL(), "");
    run_query(create.STODVC(), "");
    run_query(create.STOFLR(), "");
    run_query(create.STOMST(), "");
    run_query(create.TBLSTO(), "");
    run_query(create.USRMST(), "");
    
    run_query(create.ADDADMIN(), "");
    run_query("insert into NCALL (STOSEQ, ALMGBN, ALMTIM, ALMADV) values (1, 0, 15, 'N');", "완료");
    run_query("insert into NCALL2INFO (STOSEQ, TYPE, SHOWTIME) values (1, '', 2);", "완료");
    
    run_query("insert into APPVERSION (APPNAM, VERSION, MODDAT) values ('NSTAR2.0', 1, now());", "완료");
    run_query("insert into APPVERSION (APPNAM, VERSION, MODDAT) values ('NPOS2.0', 1, now());", "완료");
    run_query("insert into APPVERSION (APPNAM, VERSION, MODDAT) values ('NCALL2.0', 1, now());", "완료");
    run_query("insert into APPVERSION (APPNAM, VERSION, MODDAT) values ('NCALL3.0', 1, now());", "완료");
    

    res.send("<p> SETTING 완료 </p>");
});

//functions
var run_query = function (query, message) {
    connection.query(query, function (err, rows, fields) {
        if (err) {
            console.error(err);
        } else {
            if (message) console.log(message);
        }
    });
};


module.exports = router;