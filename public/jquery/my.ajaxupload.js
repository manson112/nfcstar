(function ($) {
	var ajaxImgUpload = function( fileObj, fileSeqObj ) {
		this.fileObj  		= fileObj;
        this.fileSeqObj 	= fileSeqObj;
        this.fileNameObj= null;
    };
    ajaxImgUpload.prototype = {
   		constructor: function () {
   			
   			//파일업로드 버튼
   			var fileObj = $(this.fileObj);
   			var fileObjId = $(this.fileObj).attr('id');
   			
   			//파일번호 inputbox
   			var fileSeqObj = $(this.fileSeqObj);
   			
   			//파일명 inputbox
   			var fileNameId = fileObjId+"_name";
   			var fileNameNode = '<input type="text" id="'+fileNameId+'" disabled=true/>';
   			
   			//초기화버튼
   			var fileDeleteId = "btn_"+fileObjId;
   			var fileDeleteNode = '<input type="button" id="'+fileDeleteId+'" value="삭제"/>';
   			
   			var tagStr		= '<div class="input_file">'
   							+		fileNameNode
   							+		'<label>'
   							+			'찾아보기'
							+		'</label>'
							+		fileDeleteNode
							+ '</div>';
			fileObj.before(tagStr);
			fileObj.prev().find("label").append(fileObj);
			
			var fileNameObj = $("#"+fileNameId);
   			this.fileNameObj = fileNameObj;
   			
   			$("#"+fileDeleteId).click(function(){
				fileSeqObj.val("");
   				fileNameObj.val("");
   			});
   			$(fileObj).fileupload({
   		        url : '/common/file/ajaxImgUpload.do', 
   		        dataType: 'json',
   		        add: function(e, data){
   		            var uploadFile = data.files[0];
   		            var isValid = true;
   		            if (!(/png|jpe?g|bmp|gif/i).test(uploadFile.name)) {
   		                alert('png, jpg, jpeg, gif 만 가능합니다');
   		                isValid = false;
   		            } else if (uploadFile.size > 10000000) { // 10mb
   		                alert('파일 용량은 10메가를 초과할 수 없습니다.');
   		                isValid = false;
   		            }
   		            if (isValid) {
   		                data.submit();              
   		            }
   		        }, done: function (e, data) {
   		        	// data.result
   		        	// data.textStatus;
   		        	// data.jqXHR;
   		            if(data.result.result) {
   		            	fileSeqObj.val(data.result.filseq);
   		            	fileNameObj.val(data.result.filnam);
   		            } else {
   		                alert(data.result.message);
   		            } 
   		        }, fail: function(e, data){
   		        	// data.errorThrown
   		        	// data.textStatus;
   		        	// data.jqXHR;
   		        	if( data.jqxhr.status==901 ){ location.href = "/login"; 
   		        	}
   		        }
   		    });
   		},
   		setData : function(value) {
   			$(this.fileSeqObj).val(value.filseq);
   			$(this.fileNameObj).val(value.filnam);
   		}
    };
    
    
    var ajaxUpload = function( fileObj, fileSeqObj ) {
		this.fileObj  		= fileObj;
        this.fileSeqObj 	= fileSeqObj;
        this.fileNameObj= null;
    };
    ajaxUpload.prototype = {
   		constructor: function () {
   			
   			//파일업로드 버튼
   			var fileObj = $(this.fileObj);
   			var fileObjId = $(this.fileObj).attr('id');
   			
   			//파일번호 inputbox
   			var fileSeqObj = $(this.fileSeqObj);
   			
   			//파일명 inputbox
   			var fileNameId = fileObjId+"_name";
   			var fileNameNode = '<input type="text" id="'+fileNameId+'" disabled=true/>';
   			
   			//초기화버튼
   			var fileDeleteId = "btn_"+fileObjId;
   			var fileDeleteNode = '<input type="button" id="'+fileDeleteId+'" value="삭제"/>';
   			
   			var tagStr		= '<div class="input_file">'
   							+		fileNameNode
   							+		'<label>'
   							+			'찾아보기'
							+		'</label>'
							+		fileDeleteNode
							+ '</div>';
			fileObj.before(tagStr);
			fileObj.prev().find("label").append(fileObj);
			
			var fileNameObj = $("#"+fileNameId);
   			this.fileNameObj = fileNameObj;
   			
   			$("#"+fileDeleteId).click(function(){
				fileSeqObj.val("");
   				fileNameObj.val("");
   			});
   			$(fileObj).fileupload({
   		        url : '/common/file/ajaxUpload.do', 
   		        dataType: 'json',
   		        add: function(e, data){
   		            var uploadFile = data.files[0];
   		            var isValid = true;
   		            if ((/sh|exe|bat/i).test(uploadFile.name)) {
   		                alert('sh, exe, bat는 업로드 불가합니다.');
   		                isValid = false;
   		            } else if (uploadFile.size > 20000000) { // 5mb
   		                alert('파일 용량은 20메가를 초과할 수 없습니다.');
   		                isValid = false;
   		            }
   		            if (isValid) {
   		                data.submit();              
   		            }
   		        }, done: function (e, data) {
   		        	// data.result
   		        	// data.textStatus;
   		        	// data.jqXHR;
   		            if(data.result.result) {
   		            	fileSeqObj.val(data.result.filseq);
   		            	fileNameObj.val(data.result.filnam);
   		            } else {
   		                alert(data.result.message);
   		            } 
   		        }, fail: function(e, data){
   		        	// data.errorThrown
   		        	// data.textStatus;
   		        	// data.jqXHR;
   		        	if( data.jqxhr.status==901 ){ location.href = "/user"; 
   		        	}
   		        }
   		    });
   		},
   		setData : function(value) {
   			$(this.fileSeqObj).val(value.filseq);
   			$(this.fileNameObj).val(value.filnam);
   		}
    };
    
    
    $.fn.ajaxImgUpload = function( option, value ) {
    	var $this = $(this),
        	data = $this.data('ajaxImgUpload');
    	if (!data) {
            $this.data('ajaxImgUpload', (data = new ajaxImgUpload( this, option )));
            data.constructor();
        }

        if (typeof option === 'string') {
            data[option](value);
        }
    };
    
    $.fn.ajaxUpload = function( option, value ) {
    	var $this = $(this),
        	data = $this.data('ajaxUpload');
    	if (!data) {
            $this.data('ajaxUpload', (data = new ajaxUpload( this, option )));
            data.constructor();
        }

        if (typeof option === 'string') {
            data[option](value);
        }
    };
})(window.jQuery);