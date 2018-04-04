jQuery.ajaxSetup({
	type: "POST", 
	timeout: 60000, 
	dataType:"json"
});
jQuery( document ).ajaxSend(function( event, jqxhr, settings ){ jqxhr.setRequestHeader("AJAX", true); });
jQuery( document ).ajaxStart(function() { $.loading("open"); });
jQuery( document ).ajaxSuccess(function( event, request, settings ) { $.loading("close"); });
jQuery( document ).ajaxError(function( event, jqxhr, settings, thrownError ) {
	$.loading("close");
	if( jqxhr.status==901 ){ window.parent.location.href = "/login"; 
	}
});

jQuery.loading = function(method){
	if(method=="open"){
		//$(this).attr("disabled", true);
		$("#loadingDialog").remove();
		$('body').append('<div style="text-align:center" id="loadingDialog"><img src="/images/loading.gif"/></div>');
		var loadingDialog = $("#loadingDialog");
		$(loadingDialog).dialog({ modal:true, resizable:false, draggable:false, closeText:"hide", closeOnEscape:false, title:"Loading", open:function(event, ui){
				$(".ui-dialog-titlebar-close", $(this).parent()).hide();
			}
		});
	}else{
		//$(this).attr("disabled", false);
		var loadingDialog = $("#loadingDialog");
		$(loadingDialog).dialog('close');
		$(loadingDialog).remove();
	}
};

jQuery.defaultDialog = function(id, url, data){
	$("#"+id).remove();
	$('body').append('<div id="'+id+'"></div>');
	var obj = $("#"+id);
	return $(obj).load(url, data).dialog({
		modal:true, 
		resizable:false, 
		draggable:false,
		open: function () {
			$.loading("close");
		},
		close: function () {
			obj.dialog('close').remove();
		}
	});
};

jQuery.setFormData = function(form, data){
	var keys = Object.keys(data);
	$.each(keys, function(index, value){
		$("[name="+value+"]", "[name="+form+"]").val( data[value] );
	});
};