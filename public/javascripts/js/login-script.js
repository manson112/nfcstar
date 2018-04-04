if(parent && parent!=this) window.parent.location.href = "/login";

$("body").css("background","#333333");

$(document).ready(function(){
	if($("#userid").val()!=""){
		$("#userpw").focus();
	} else {
		$("#userid").focus();
	}
});

function keyDown(obj, event){
	if(event.keyCode==13){
		if(obj==document.getElementById("userid")){
			$("#userpw").focus();
		} else if(obj==document.getElementById("userpw")){
			if(chkForm(obj)) goLogin();
		}
	}
}

function chkForm(obj){
	if(obj==document.getElementById("userid")){
		if(obj.value==""){
			alert("아이디를 입력하여 주세요."); 
			obj.focus();
			return false;	
		}
		return true;
	} else if(obj==document.getElementById("userpw")){
		if(obj.value==""){
			alert("패스워드를 입력하여 주세요."); 
			obj.focus();
			return false;	
		}
		return true;
	}
}

function goLogin(){
	if(!chkForm($("#userid")[0])) return false;
	if(!chkForm($("#userpw")[0])) return false;
	/*
	$.cookie("userid", null);
	if( $("#chk_save_id").is(":checked") ){
		$.cookie("userid", $("#userid").val(), {expires:999});
	}
	*/
	document.form_admin.submit();
}