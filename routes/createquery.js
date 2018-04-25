var exports = module.exports = {}

exports.STOMST = function() {
    return "CREATE TABLE IF NOT EXISTS STOMST "
    + "(" 
    + "   `ID`      INT            NOT NULL    AUTO_INCREMENT, " 
    + "   `REGNUM`  VARCHAR(15)        NULL,                    "
    + "   `CHFNAM`  VARCHAR(10)    CHARACTER SET utf8   NULL, "
    + "   `STOTYP`  VARCHAR(20)    CHARACTER SET utf8   NULL,                    "
    + "   `STOITM`  VARCHAR(20)    CHARACTER SET utf8   NULL,                    "
    + "   `STONAM`  VARCHAR(40)    CHARACTER SET utf8   NULL, "
    + "   `STLOGO`  VARCHAR(50)    NULL,                    "
    + "   `STOTEL`  VARCHAR(15)    NULL,                    "
    + "   `STOFAX`  VARCHAR(15)    NULL,                    "
    + "   `STOEML`  VARCHAR(30)    NULL,                    "
    + "   `STOHPG`  VARCHAR(100)   NULL,                    "
    + "   `STOZIP`  CHAR(5)        NULL,                    "
    + "   `STOADD`  VARCHAR(45)    CHARACTER SET utf8   NULL,                    "
    + "   `STDADD`  VARCHAR(45)    CHARACTER SET utf8   NULL,                    "
    + "   `STOSTR`  VARCHAR(10)    NULL,                    "
    + "   `STOEND`  VARCHAR(10)    NULL,                    "
    + "   `SALMTH`  VARCHAR(3)    NULL,                    "
    + "   `CPNSEQ`  INT            NULL,                    "
    + "   `REGDAT`  DATETIME       NULL,                    "
    + "   PRIMARY KEY (ID) "
    +")ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;";
};

exports.USRMST = function() {
    return "CREATE TABLE IF NOT EXISTS USRMST " 
    + "("
    + "  `ID`      INT             NOT NULL    AUTO_INCREMENT, "
    + "  `USERID`  VARCHAR(20)     CHARACTER SET utf8   NULL, "
    + "  `USERPW`  VARCHAR(200)    NULL, "
    + "  `USRNAM`  VARCHAR(40)     CHARACTER SET utf8   NULL, "
    + "  `USRGRD`  INT          NULL, " //등급
    + "  `MOBNUM`  CHAR(11)     NULL, "
    + "  `BIRDAY`  DATE            NULL, "
    + "  `SEXCOD`  VARCHAR(3)      NULL, "
    + "  `EMLADD`  VARCHAR(45)     NULL, "
    + "  `FCMTOK`  VARCHAR(200)    NULL, "
    + "  `REGDAT`  DATETIME        NULL, "
    + "  `REGSTO`  INT             NULL, "
    + "  PRIMARY KEY (ID) "
    + ") ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;";
};

exports.STOVAN = function() {
    return "CREATE TABLE IF NOT EXISTS STOVAN "
    + "("
    + " `ID`      INT            NOT NULL    AUTO_INCREMENT, "
    + " `STOSEQ`  INT          NULL, "
    + " `VANCOD`  VARCHAR(3)  CHARACTER SET utf8  NULL, "
    + " `VANNUM`  VARCHAR(45)    NULL, "
    + " `REGDAT`  DATETIME       NULL, "
    + " `REGUSR`  VARCHAR(20)  CHARACTER SET utf8  NULL, "
    + " PRIMARY KEY (ID) "
    + ") ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;";
};

exports.POSMST = function() {
    return "CREATE TABLE IF NOT EXISTS POSMST "
    + "("
    + " `ID`      INT            NOT NULL    AUTO_INCREMENT, "
    + " `STOSEQ`  INT            NULL, "
    + " `POSNAM`  VARCHAR(10)  CHARACTER SET utf8  NULL, "
    + " `POSID`   VARCHAR(20)  CHARACTER SET utf8  NULL, "
    + " `POSPW`   VARCHAR(200)  CHARACTER SET utf8  NULL, "
    + " `CPNSEQ`  INT            NULL, "
    + " `REGDAT`  DATETIME       NULL, "
    + " `MODDAT`  DATETIME       NULL, "
    + " `MODUSR`  VARCHAR(20)  CHARACTER SET utf8  NULL, "
    + " `USEWEB`  VARCHAR(3)     NULL, "
    + " `USEAPP`  VARCHAR(3)     NULL, "
    + " `USEALR`  VARCHAR(3)     NULL, "
    + " `USEALR2` VARCHAR(3)     NULL, "
    + " `USECAL`  VARCHAR(3)     NULL, "
    + " `FCMTOK`  VARCHAR(200)   NULL, " 
    + " `FCMTOK2` VARCHAR(200)   NULL, "
    + "  PRIMARY KEY (ID)"
    + ") ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;";
};

exports.CPNMST = function() {
    return "CREATE TABLE IF NOT EXISTS CPNMST "
    + " ("
    + " `ID`      INT            NOT NULL    AUTO_INCREMENT, "
    + " `CPNNAM`  VARCHAR(40)  CHARACTER SET utf8  NULL, "
    + " `CPNID`   VARCHAR(20)  CHARACTER SET utf8  NULL, "
    + " `CPNPW`   VARCHAR(200)  CHARACTER SET utf8  NULL, "
    + " `CPNTEL`  VARCHAR(15)    NULL, "
    + " `CPNZIP`  VARCHAR(5)    NULL, "
    + " `CPNADD`  VARCHAR(45)  CHARACTER SET utf8  NULL, "
    + " `CPDADD`  VARCHAR(45)  CHARACTER SET utf8  NULL, "
    + " `CPNCOD`  VARCHAR(30)  CHARACTER SET utf8  NULL, "
    + " `REGDAT`  DATETIME       NULL, "
    + " PRIMARY KEY (ID)"
    + " ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;";
};

exports.USRSTO = function() {
    return "CREATE TABLE IF NOT EXISTS USRSTO "
    + " ( "
    + " `ID`      INT            NOT NULL    AUTO_INCREMENT, "
    + " `USERID`  VARCHAR(20)  CHARACTER SET utf8  NULL, "
    + " `STOSEQ`  INT            NULL, "
    + " `USEDAT`  DATETIME       NULL, "
    + " PRIMARY KEY (ID) "
    + " ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;";
};

exports.POSTIM = function() {
    return "CREATE TABLE IF NOT EXISTS POSTIM "
    + " ( "
    + " `ID`      INT            NOT NULL    AUTO_INCREMENT, "
    + " `STOSEQ`  INT            NULL, "
    + " `WEBSTR`  DATETIME       NULL, "
    + " `WEBEND`  DATETIME       NULL, "
    + " `APPSTR`  DATETIME       NULL, "
    + " `APPEND`  DATETIME       NULL, "
    + " `ALRSTR`  DATETIME       NULL, "
    + " `ALREND`  DATETIME       NULL, "
    + " `ALR2STR` DATETIME       NULL, "
    + " `ALR2END` DATETIME       NULL, "
    + " `UPDDAT`  DATETIME       NULL, "
    + " PRIMARY KEY (ID) "
    + " ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;"
};

exports.ADMMST = function() {
    return "CREATE TABLE IF NOT EXISTS ADMMST "
    + " ( "
    + " `ID`   INT             NOT NULL    AUTO_INCREMENT, "
    + " `ADMID`   VARCHAR(20)  CHARACTER SET utf8   NULL, "
    + " `ADMPW`   VARCHAR(200)    NULL, "
    + " `ADMNAM`  VARCHAR(40)  CHARACTER SET utf8   NULL, "
    + " PRIMARY KEY (ID) "
    + " ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;";
};

exports.NCALL2 = function() {
    return "CREATE TABLE IF NOT EXISTS NCALL2 "
    + " ( "
    + "   `ID`      INT            NOT NULL    AUTO_INCREMENT, "
    + "   `STOSEQ`  INT            NULL, "
    + "   `YTBURL`  VARCHAR(60)    CHARACTER SET utf8    NULL, "
    + "   `REGUSR`  VARCHAR(20)    CHARACTER SET utf8    NULL, "
    + "   `REGDAT`  DATETIME       NULL, "
    + "   PRIMARY KEY (ID) "
    + ")ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;";
}

exports.NCALL2INFO = function() {
    return "CREATE TABLE IF NOT EXISTS NCALL2INFO "
    + " ( "
    + "    `ID`        INT           NOT NULL    AUTO_INCREMENT, "
    + "    `STOSEQ`    INT           NULL, "
    + "    `TYPE`      VARCHAR(3)    CHARACTER SET utf8    NULL, "
    + "    `SHOWTIME`  INT           NULL, "
    + "    PRIMARY KEY (ID) "
    + ")ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;";
}
//

exports.TLBNAME2 = ["STOCAL", "TBLSTO", "STOFLR", "STODVC", "DLVSTO", "ALRADV", "POSRPS", "EVTFIL_M", "EVTFIL_D", "PRDFIL_M", "PRDFIL_D", "PRDOPT", "OPTMST", "EVTMST", "PRDSET", "USRSAL", "RCNOPT", "PRDMST", "SALPRD", "SALMST"];

exports.STOCAL = function() {
    return "CREATE TABLE IF NOT EXISTS STOCAL "
    + " ("
    + " `ID`      INT            NOT NULL    AUTO_INCREMENT, "
    + " `STOSEQ`  INT            NULL, "
    + " `CALCOD`  VARCHAR(3)     NULL, "
    + " `CALNAM`  VARCHAR(40)  CHARACTER SET utf8  NULL, "
    + " `ORDNUM`  INT            NULL, "
    + " `REGDAT`  DATETIME       NULL, "
    + " PRIMARY KEY (ID) " 
    + " ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;"
};
     
exports.TBLSTO = function() {
    return "CREATE TABLE IF NOT EXISTS TBLSTO "
    + " ("
    + " `ID`      INT            NOT NULL    AUTO_INCREMENT, " 
    + " `STOSEQ`  INT            NULL, "
    + " `FLRSEQ`  INT            NULL, "
    + " `TBLNAM`  VARCHAR(40)  CHARACTER SET utf8  NULL, "
    + " `NOWUSE`  VARCHAR(3)     NULL, "
    + " `LSTUSR`  VARCHAR(20)  CHARACTER SET utf8  NULL, "
    + " PRIMARY KEY (ID) "
    + " ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;";
};  

exports.DLVSTO = function() {
    return "CREATE TABLE IF NOT EXISTS DLVSTO "
    + " ( "
    + " `ID`      INT             NOT NULL    AUTO_INCREMENT, "
    + " `STOSEQ`  INT            NULL, "    
    + " `DLVADD`  VARCHAR(45)  CHARACTER SET utf8   NULL, "
    + " `DLDADD`  VARCHAR(45)  CHARACTER SET utf8   NULL, "
    + " `DLVSTR`  VARCHAR(10)         CHARACTER SET utf8   NULL, "
    + " `DLVEND`  VARCHAR(10)         CHARACTER SET utf8   NULL, "
    + " `DLVMIN`  VARCHAR(25)  CHARACTER SET utf8   NULL, "
    + " PRIMARY KEY (ID) "
    + " ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;;"
};

exports.STOFLR = function() {
    return "CREATE TABLE IF NOT EXISTS STOFLR "
    + "("
    + "    `ID`      INT            NOT NULL    AUTO_INCREMENT, "
    + "    `STOSEQ`  INT            NULL, "    
    + "    `FLRNAM`  VARCHAR(40)   CHARACTER SET utf8    NULL, "
    + "    `ORDNUM`  INT            NULL, "
    + "    PRIMARY KEY (ID) "
    + ") ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;";
};

exports.STODVC = function() {
    return "CREATE TABLE IF NOT EXISTS STODVC "
    + " ("
    + " `ID`      INT            NOT NULL    AUTO_INCREMENT, "
    + " `STOSEQ`  INT            NULL, "    
    + " `IPADDR`  VARCHAR(16)    NULL, "
    + " `PORT`  VARCHAR(7)     NULL, "
    + " `RCPFLG` VARCHAR(3) character set utf8 NULL, "
    + " `KITFLG` VARCHAR(3)  character set utf8 NULL, "
    + " PRIMARY KEY (ID)"
    + " ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;";
};
    
exports.ALRADV = function() {
    return "CREATE TABLE IF NOT EXISTS ALRADV "
    + " ( "
    + " `ID`      INT             NOT NULL    AUTO_INCREMENT, "
    + " `STOSEQ`  INT             NULL, "    
    + " `ADVGRP`  VARCHAR(3)      NULL, "
    + " `ADVURL`  VARCHAR(100)  CHARACTER SET utf8  NULL, "
    + " `ADVTYP`  VARCHAR(3)      NULL, "
    + " `REGDAT`  DATETIME        NULL, "
    + " `REGUSR`  VARCHAR(20)   CHARACTER SET utf8  NULL, "
    + " PRIMARY KEY (ID)"
    + " ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;";
};
     
exports.POSRPS = function() {
    return "CREATE TABLE IF NOT EXISTS POSRPS "
    + " ( " 
    + " `ID`      INT            NOT NULL    AUTO_INCREMENT, "
    + " `STOSEQ`  INT            NULL, "
    + " `POSID`   VARCHAR(20)  CHARACTER SET utf8  NULL, "
    + " `RSPTIM`  DATETIME       NULL, "
    + " `CUSCAL`  INT            NULL, "
    + " PRIMARY KEY (ID) "
    + " ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;"
};  

exports.EVTFIL_M = function() { 
    return "CREATE TABLE IF NOT EXISTS EVTFIL_M "
    + " ( "
    + " `ID`      INT             NOT NULL    AUTO_INCREMENT, "
    + " `STOSEQ`  INT             NULL, "
    + " `EVTSEQ`  INT             NULL, "
    + " `FILURL`  VARCHAR(100)  CHARACTER SET utf8  NULL, "
    + " PRIMARY KEY (ID)"
    + " ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;";
};

exports.EVTFIL_D = function() {
    return "CREATE TABLE IF NOT EXISTS EVTFIL_D "
    + " ("
    + "     `ID`      INT             NOT NULL    AUTO_INCREMENT, "
    + " `STOSEQ`  INT            NULL, "    
    + " `EVTSEQ`  INT             NULL, "
    + " `FILTYP`  VARCHAR(3)             NULL, "
    + " `FILURL`  VARCHAR(100) CHARACTER SET utf8   NULL, "
    + " `PRDSEQ`  INT             NULL, "
    + " `ORDNUM`  INT             NULL, "
    + " PRIMARY KEY (ID) "
    + " ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;";
};

exports.PRDFIL_M = function() {
    return "CREATE TABLE IF NOT EXISTS PRDFIL_M "
    + " ("
    + " `ID`      INT             NOT NULL    AUTO_INCREMENT, "
    + " `STOSEQ`  INT            NULL, "    
    + " `PRDSEQ`  INT             NULL, "
    + " `FILURL`  VARCHAR(100) CHARACTER SET utf8   NULL, " 
    + " PRIMARY KEY (ID) "
    + " ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;";
};

exports.PRDFIL_D = function() {
    return "CREATE TABLE IF NOT EXISTS PRDFIL_D "
    + " ("
    + " `ID`      INT             NOT NULL    AUTO_INCREMENT, "
    + " `STOSEQ`  INT            NULL, "    
    + " `PRDSEQ`  INT             NULL, "
    + " `FILTYP`  VARCHAR(3)      NULL, "
    + " `FILURL`  VARCHAR(100)  CHARACTER SET utf8  NULL, "
    + " `ORDNUM`  INT             NULL, "
    + " PRIMARY KEY (ID)"
    + " ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;";
};
     
exports.PRDOPT = function() {
    return "CREATE TABLE IF NOT EXISTS PRDOPT "
    + " ( "
    + " `ID`      INT    NOT NULL    AUTO_INCREMENT, "
    + " `STOSEQ`  INT            NULL, "    
    + " `PRDSEQ`  INT    NULL, "
    + " `OPTCAT`  INT    NULL, "
    + " PRIMARY KEY (ID) "
    + " ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;";
};  
exports.OPTMST = function() {
    return "CREATE TABLE IF NOT EXISTS OPTMST "
    + " ( "
    + " `ID`      INT            NOT NULL    AUTO_INCREMENT, "
    + " `STOSEQ`  INT            NULL, "        
    + " `OPTCAT`  INT            NULL, "
    + " `OPTNAM`  VARCHAR(40)    CHARACTER SET utf8 NULL, "
    + " `OPTCST`  INT            NULL, "
    + " `REGDAT`  DATETIME       NULL, "
    + " `REGUSR`  VARCHAR(20)  CHARACTER SET utf8  NULL, "
    + " PRIMARY KEY (ID) "
    + " ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;";
};
exports.OPTCAT = function() {
    return "CREATE TABLE IF NOT EXISTS OPTCAT "
    + " ("
    + " `ID`      INT            NOT NULL    AUTO_INCREMENT, "
    + " `STOSEQ`  INT            NULL, "        
    + " `CATNAM`  VARCHAR(40)    CHARACTER SET utf8 NULL, "
    + " `ORDNUM`  INT            NULL, "
    + " PRIMARY KEY (ID)"
    + " ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;"
}


exports.EVTMST = function() {
    return "CREATE TABLE IF NOT EXISTS EVTMST "
    + " ( "
    + " `ID`      INT            NOT NULL    AUTO_INCREMENT, "
    + " `STOSEQ`  INT            NULL, "        
    + " `EVTNAM`  VARCHAR(40)  CHARACTER SET utf8  NULL, "
    + " `EVTSTR`  DATE           NULL, "
    + " `EVTEND`  DATE           NULL, "
    + " `ORDNUM`  INT            NULL, "
    + " `REGUSR`  VARCHAR(20)  CHARACTER SET utf8  NULL, "
    + " `REGDAT`  DATETIME       NULL, "
    + " `MODUSR`  VARCHAR(20)  CHARACTER SET utf8  NULL, "
    + " `MODDAT`  DATETIME       NULL, "
    + " PRIMARY KEY (ID)"
    + " ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;";
};



exports.PRDSET = function() {
    return "CREATE TABLE IF NOT EXISTS PRDSET "
    + " ( "
    + " `ID`      INT    NOT NULL    AUTO_INCREMENT, "
    + " `STOSEQ`  INT            NULL, "        
    + " `SETSEQ`  INT    NULL, "
    + " `PRDSEQ`  INT    NULL, "
    + " PRIMARY KEY (ID)"
    + " ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;";
};
exports.SETMST = function() {
    return "CREATE TABLE IF NOT EXISTS SETMST"
    + " ("
    + " `ID`      INT            NOT NULL    AUTO_INCREMENT, "
    + " `STOSEQ`  INT            NULL, "        
    + " `SETNAM`  VARCHAR(40)    CHARACTER SET utf8 NULL, "
    + " `SETCST`  INT            NULL, "
    + " `SETEXP`  VARCHAR(100) CHARACTER SET utf8 NULL, "
    + " `SALFLG`  VARCHAR(3)   CHARACTER SET utf8 NULL, "
    + " `SETIMG`  VARCHAR(100) CHARACTER SET utf8 NULL, "
    + " `ORDNUM`  INT    NULL, "
    + " PRIMARY KEY (ID)"
    + " ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;";
}

exports.USRSAL = function() {
    return "CREATE TABLE IF NOT EXISTS USRSAL "
    + " ( "
    + " `ID`      INT            NOT NULL    AUTO_INCREMENT, "
    + " `STOSEQ`  INT            NULL, "        
    + " `RCNSEQ`  INT            NULL, "
    + " `RCNUSR`  VARCHAR(20)  CHARACTER SET utf8  NULL, "
    + " PRIMARY KEY (ID)"
    + " ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;";
};
     
exports.RCNOPT = function() {
    return "CREATE TABLE IF NOT EXISTS RCNOPT "
    + " ( "
    + " `ID`      INT    NOT NULL    AUTO_INCREMENT, "
    + " `STOSEQ`  INT            NULL, "        
    + " `RCNSEQ`  INT    NULL, "
    + " `RCNPRD`  INT    NULL, "
    + " `OPTSEQ`  INT    NULL, "
    + " PRIMARY KEY (ID)"
    + " ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;";
};  

exports.PRDMST = function() {
    return "CREATE TABLE IF NOT EXISTS PRDMST "
    + " ( "
    + " `ID`      INT             NOT NULL    AUTO_INCREMENT, "
    + " `STOSEQ`  INT            NULL, "        
    + " `CATSEQ`  INT             NULL, "
    + " `PRDNAM`  VARCHAR(40)  CHARACTER SET utf8   NULL, "
    + " `PRDCST`  INT             NULL, "
    + " `PRDEXP`  VARCHAR(100) CHARACTER SET utf8   NULL, "
    + " `SALFLG`  VARCHAR(3)      NULL, "
    + " `KITFLG`  VARCHAR(3)      NULL, "
    + " `DISCNT`  INT             NULL, "
    + " `CTRCOD`  VARCHAR(5)      NULL, "
    + " `ORDNUM`  INT      NULL, "
    + " `REGDAT`  DATETIME        NULL, "
    + " `REGUSR`  VARCHAR(20)  CHARACTER SET utf8   NULL, "
    + " `MODUSR`  VARCHAR(20)  CHARACTER SET utf8   NULL, "
    + " PRIMARY KEY (ID)"
    + " ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;";
};

exports.DISMST = function() {
    return "CREATE TABLE IF NOT EXISTS DISMST "
    + " ( "
    + " `ID`      INT           NOT NULL    AUTO_INCREMENT, "
    + " `STOSEQ`  INT            NULL, "        
    + " `DISTYP`  VARCHAR(3)    NULL, "
    + " `DISAMT`  INT           NULL, "
    + " PRIMARY KEY (ID) "
    + " ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;";
};

exports.SALPRD = function() {
    return "CREATE TABLE IF NOT EXISTS SALPRD "
    + " ( "
    + " `ID`      INT           NOT NULL    AUTO_INCREMENT, "
    + " `STOSEQ`  INT            NULL, "        
    + " `RCNSEQ`  INT           NULL, "
    + " `RCNPRD`  INT           NULL, "
    + " `RCNOPT`  INT           NULL, "
    + " `RCNQTY`  INT           NULL, "
    + " `RCNCST`  INT           NULL, "
    + " `RCNDAT`  DATETIME      NULL, "
    + " `RCNFLG`  VARCHAR(3)    NULL, "
    + " `TBLSEQ`  INT           NULL, "
    + " `DLVREQ`  INT           NULL, "
    + " `DLVPAY`  VARCHAR(3)    NULL, "
    + " `NEWFLG`  VARCHAR(3)    NULL, "
    + " `RCTSTS`  VARCHAR(3)    NULL, "
    + " `RCTDAT`  DATETIME      NULL, "
    + " `CSHAMT`  INT           NULL, "
    + " `CRDAMT`  INT           NULL, "
    + " `DISAMT`  INT           NULL, "
    + " PRIMARY KEY (ID)"
    + " ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;";
};

//영업
exports.SALMST = function() {
    return "CREATE TABLE IF NOT EXISTS SALMST "
    + " ("
    + "     `ID`      INT            NOT NULL    AUTO_INCREMENT, "
    + "     `STOSEQ`  INT            NULL, "
    + "     `STRTIM`  DATETIME       NULL, "
    + "     `ENDTIM`  DATETIME       NULL, "
    + "     `ENDFLG`  VARCHAR(3)     NULL, "
    + "     `STRAMT`  INT            NULL, "
    + "     `ACTAMT`  INT            NULL, "
    + "     `TBLAMT`  INT            NULL, "
    + "     `TBLCNT`  INT            NULL, "
    + "     `DLVAMT`  INT            NULL, "
    + "     `DLVCNT`  INT            NULL, "
    + "     `TOTAMT`  INT            NULL, "
    + "     `TOTCNT`  INT            NULL, "
    + "     `CSHAMT`  INT            NULL, "
    + "     `CRDAMT`  INT            NULL, "
    + "     `DISAMT`  INT            NULL, "
    + "     `REGDAT`  DATETIME       NULL, "
    + "     `REGUSR`  VARCHAR(20)    CHARACTER SET utf8     NULL, "
    + "     PRIMARY KEY (ID)"
    + " ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;";
};

exports.CATMST = function() {
    return "CREATE TABLE IF NOT EXISTS CATMST "
    + " ("
    + " `ID`      INT            NOT NULL    AUTO_INCREMENT, "
    + " `STOSEQ`  INT            NULL, "        
    + " `CATNAM`  VARCHAR(40)    CHARACTER SET utf8  NULL, "
    + " `CATNUM`  INT            NULL, "
    + " `CATFIL`  VARCHAR(50)    NULL, "
    + " `REGDAT`  DATETIME       NULL, "
    + " `ORDNUM`  INT            NULL, "
    + " PRIMARY KEY (ID)"
    + " ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;";
};

exports.SALSIO = function() {
    return "CREATE TABLE IF NOT EXISTS SALSIO "
    + " ("
    + "     `ID`      INT             NOT NULL    AUTO_INCREMENT COMMENT '입출금번호', "
    + "     `STOSEQ`  INT             NULL        COMMENT '가게번호', "
    + "     `SALSEQ`  INT             NULL        COMMENT '영업번호', "
    + "     `SIOCOD`  VARCHAR(6)      CHARACTER SET utf8  NULL        COMMENT '입출금코드', " 
    + "     `SIONAM`  VARCHAR(10)     CHARACTER SET utf8  NULL        COMMENT '입출금구분', "
    + "     `REMARK`  VARCHAR(100)    CHARACTER SET utf8  NULL        COMMENT '비고', "
    + "     `SIODAT`  DATETIME        NULL        COMMENT '입출금날짜', "
    + "     `SIOAMT`  INT             NULL        COMMENT '입출금금액', "
    + "     `REGUSR`  VARCHAR(20)     CHARACTER SET utf8  NULL        COMMENT '등록자', "
    + "     PRIMARY KEY (ID)"
    + " ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;"
}

//주문관련
exports.RCNMST = function() {
    return "CREATE TABLE IF NOT EXISTS RCNMST "
        + " ("  
        + " `ID`      INT            NOT NULL    AUTO_INCREMENT, "
        + " `STOSEQ`  INT            NULL, "            
        + " `TOTAMT`  INT            NULL        COMMENT '주문 총 가격', "
        + " `TBLSEQ`  INT            NULL        COMMENT '테이블 번호', "
        + " `REGDAT`  DATETIME       NULL        COMMENT '주문 날짜', "
        + " `USERID`  VARCHAR(20)    CHARACTER SET utf8 NULL        COMMENT '주문 고객', "
        + " `CHKFLG`  VARCHAR(3)     CHARACTER SET utf8 NULL        COMMENT '확인 여부', "
        + " `PAYFLG`  VARCHAR(3)     CHARACTER SET utf8 NULL        COMMENT '결제 여부', "
        + " `FINISH`  VARCHAR(3)     CHARACTER SET utf8 NULL        COMMENT '판매 완료 여부', "
        + " `ORDCNT`  INT            NULL        COMMENT '주문 횟수', "
        + " PRIMARY KEY (ID)"
        + " ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;";
};

exports.RCNRCT = function() {
    return "CREATE TABLE IF NOT EXISTS RCNRCT "
        + " ("
        + " `ID`      INT           NOT NULL      AUTO_INCREMENT, "
        + " `STOSEQ`  INT           NULL, "
        + " `RCNSEQ`  INT           NULL          COMMENT '주문 번호', "
        + " `PAYDAT`  DATETIME      NULL          COMMENT '결제 날짜', "
        + " `TOTAMT`  INT           NULL          COMMENT '결제 총 가격', "
        + " `CSHAMT`  INT           NULL          COMMENT '현금 결제 가격', "
        + " `CRDAMT`  INT           NULL          COMMENT '카드 결제 가격', "
        + " `DISAMT`  INT           NULL          COMMENT '할인 가격', "
        + " `REGDAT`  DATETIME      NULL          COMMENT '등록 날짜', "
        + " `REGUSR`  VARCHAR(20)   CHARACTER SET utf8 NULL   COMMENT '등록자', "
        + " PRIMARY KEY (ID)"
        + " ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;";
}

exports.RCNDET = function() {
    return "CREATE TABLE IF NOT EXISTS RCNDET "
        + " ("
        + " `ID`      INT    NULL        AUTO_INCREMENT COMMENT '주문 세부 번호', "
        + " `STOSEQ`  INT    NULL,                           "            
        + " `RCNSEQ`  INT    NULL        COMMENT '주문 번호', "
        + " `PRDSEQ`  INT    NULL        COMMENT '제품 번호', "
        + " `PRDQTY`  INT    NULL        COMMENT '제품 수량', "
        + " `DETCST`  INT    NULL        COMMENT '가격', "
        + " PRIMARY KEY (ID)"
        + " ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;";
};
exports.OPTSET = function() {
    return "CREATE TABLE IF NOT EXISTS OPTSET "
        + " ("
        + " `ID`         INT    NOT NULL    AUTO_INCREMENT, "
        + " `STOSEQ`  INT           NULL,                   "        
        + " `RCNDETSEQ`  INT    NULL        COMMENT '주문 세부 번호', "
        + " `OPTSEQ`     INT    NULL        COMMENT '옵션 번호', "
        + " PRIMARY KEY (ID)"
        + ") ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;";
};

exports.CALMST = function() {
    return "CREATE TABLE IF NOT EXISTS CALMST "
    + " ("
    + "     `ID`      INT            NOT NULL    AUTO_INCREMENT, "
    + "     `STOSEQ`  INT            NULL        COMMENT '가게 번호', "
    + "     `CALTYP`  VARCHAR(3)     CHARACTER SET utf8 NULL        COMMENT '호출 타입(방향)', "
    + "     `CALNAM`  VARCHAR(100)    CHARACTER SET utf8 NULL        COMMENT '호출 내용', "
    + "     `USERID`  VARCHAR(20)    CHARACTER SET utf8 NULL        COMMENT '호출자', "
    + "     `TBLSEQ`  INT            NULL        COMMENT '테이블번호', "
    + "     `RCNSEQ`  INT            NULL        COMMENT '주문 번호', "
    + "     `POSNAM`  VARCHAR(20)    CHARACTER SET utf8 NULL        COMMENT '포스이름', "
    + "     `CHKFLG`  VARCHAR(3)     CHARACTER SET utf8 NULL        COMMENT '확인여부', "
    + "     `REGDAT`  DATETIME       NULL        COMMENT '등록날짜', "
    + "     PRIMARY KEY (ID)"
    + " ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;"
};

exports.NCALL = function() {
    return "CREATE TABLE IF NOT EXISTS NCALL "
    + " ("
    + "     `ID`      INT           NOT NULL    AUTO_INCREMENT, "
    + "     `STOSEQ`  INT           NULL        COMMENT '가게 번호', "
    + "     `ALMGBN`  INT           NULL        COMMENT '알림 설정', "
    + "     `ALMTIM`  INT           NULL        COMMENT '알림 시작', "
    + "     `ALMADV`  VARCHAR(3)    CHARACTER SET utf8 NULL        COMMENT '알림 사용', "
    + "     PRIMARY KEY (ID)"
    + " ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;";
}

exports.NCALLADV = function() {
    return "CREATE TABLE NCALLADV "
    + " ("
    + "     `ID`      INT             NOT NULL    AUTO_INCREMENT, "
    + "     `STOSEQ`  INT             NULL, "
    + "     `FILTYP`  VARCHAR(3)      CHARACTER SET utf8 NULL, "
    + "     `FILURL`  VARCHAR(100)    CHARACTER SET utf8 NULL, "
    + "     PRIMARY KEY (ID)"
    + " ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;";
}

exports.APPVERSION = function() {
    return "CREATE TABLE APPVERSION "
    + " ("
    + " `ID`       INT            NOT NULL    AUTO_INCREMENT, "
    + " `APPNAM`   VARCHAR(20)    CHARACTER SET utf8 NULL        COMMENT '앱 이름', " 
    + " `VERSION`  INT            NULL        COMMENT '앱 버전', "
    + " `MODDAT`   DATETIME       NULL        COMMENT '수정 날짜', " 
    + " PRIMARY KEY (ID)"
    + " )ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;"
}