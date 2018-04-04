var defaultTemplate		= {align: 'center',	sortable:false,	formatter: 'text',			edittype: 'text'		};
var textTemplate			= {align: 'left',	 	sortable:false,	formatter: 'text',			edittype: 'text'		};
var numberTemplate 	= {align: 'right', 		sortable:false,	formatter: 'integer',		edittype: 'text',		editoptions: {dataInit:function(el){ $(el).numeric(); $(el).css("ime-mode", "disabled"); } }};
var dateTemplate 		= {align: 'center', 	sortable:false,	formatter: 'date',			edittype: 'text', 		editoptions: {size:12, dataInit:function(el){ $(el).datepicker(); } }};
var checkboxTemplate = {align: 'center', 	sortable:false,	formatter: 'checkbox', 	edittype: 'checkbox',editoptions: {value: 'Y:N', defaultValue: 'N'}};
var selectTemplate 		= {align: 'center', 	sortable:false,	formatter: 'select',		edittype: 'select'		};

jQuery.fn.datagrid = function(page, colName, colModel, height, multiselect, footerrow){
	this.jqGrid({
		datatype: 'local',
        colNames:colName,
        colModel:colModel,
        autowidth: true,
        gridview: true,             
        rownumbers: true,
        multiselect:multiselect,
        sortable:false,
        viewrecords: true,  
        width: 'auto',
        cellEdit:true,
        editurl:'clientArray',
        beforeSubmitCell : function(rorwid, cellname, value){
        	if(multiselect) $(this.rows[rorwid].cells[1]).find(":checkbox").attr("checked",true);
        },
        cellsubmit: 'clientArray',
        pager:$(page),
        //pgbuttons: false,
        //pgtext: null,
        rowNum:1000,
        loadtext : "조회중...",
        loadui : "enable",
        footerrow:footerrow,
        userDataOnFooter:true,
        gridComplete: function(){
        	$(this).jqGrid('footerData','set',{'Customer':'TOTALS:'});
            var colnames = $(this).jqGrid('getGridParam','colModel');
            var multiselect = $(this).getGridParam("multiselect");
            var strRownum = multiselect?2:1;
            for (var i = strRownum; i < colnames.length; i ++){
            	if(colnames[i]['calc']!=null){
	                var tot = $(this).jqGrid('getCol',colnames[i]['name'],false,colnames[i]['calc']);
	                var ob = [];
	                ob[colnames[i]['name']] = tot;
	                $(this).jqGrid('footerData','set',ob);
            	}
            }
        }
	})
	.setGridHeight(height,false);
};

jQuery.fn.setDatagrid = function(data){
	this.clearGridData().setGridParam({ datatype: 'local', data: data }).trigger("reloadGrid");
};

jQuery.fn.getExcelFile = function(fileName, datagrid, url){
	this.click(function(){ 
		var page = $('#'+datagrid).getGridParam('page');
		var rowNum = $('#'+datagrid).getGridParam('rowNum');
		var multiselect = $("#"+datagrid).getGridParam("multiselect");
		
		var colModel = JSON.stringify( $("#"+datagrid).jqGrid('getGridParam','colModel') );
		var data;
		if(multiselect){
			data = $("#"+datagrid).getSelRowData();
		} else {
			data = $("#"+datagrid).jqGrid('getGridParam','data');
			data = data.splice((page-1)*rowNum,page*rowNum);
		}
		data = JSON.stringify( data );
		$('<form id="excelForm" action="'+ url +'" method="post">'
				+'<textarea name="data">'+data+'</textarea>'
				+'<textarea name="colModel">'+colModel+'</textarea>'
				+'<input name="fileName" value="'+fileName+'"/>'
			  	+'</form>').appendTo('body').submit().remove();
	});
};

jQuery.fn.getSelRowsData = function(){
	var selRow	= this.jqGrid('getGridParam', "selarrrow" );
	var selData	= [];
	for ( var i=0; i<selRow.length; i++ ){
		var row  = selRow[i];
		var data = this.getRowData( row );
		selData[i] = data;
	}
	return selData;
};

jQuery.fn.getSelRowData = function(){
	var selRow	= this.jqGrid('getGridParam', "selrow" );
	var selData	= null;
	if( selRow!=null ){
		selData = this.getRowData( selRow );
	}
	return selData;
};

var jqgridRowCnt = 0;
jQuery.fn.jqgridRowspan = function(pk, colIndexs) {
	
	var model = [];
	$.each(this.getGridParam("colModel"), function(idx, value) {
		model.push(value.name);
	});
	var multiselect = this.getGridParam("multiselect");
	var tblObj = this;
	
	this.bind("jqGridLoadComplete", function() {
		var rowspanData = {}; //rowspan될 데이터들이 모이는 곳{"행번호":span수}
		var current;
		var currentIDX = 0;
		var rowcnt = 0; 
		var data = tblObj.getCol(model[multiselect?pk+1:pk]); //해당열의 모든 데이터를 보관
		
		$.each(data, function(idx, value) {
			if (current != value) {
				currentIDX = idx;
				rowspanData[currentIDX] = 1;
				rowcnt++;
			} else rowspanData[currentIDX]++;
			current = value;
		});
		
		$('tbody tr', tblObj).each(function(row, rowObject) {
			if (row > 0) {// 0번째 row는 숨겨진 row다 이것 때문에 width가 깨지는 현상 발생
				var trObj   = this;
				var tmpIDx = 0;
				if (rowspanData[row - 1]) tmpIDx = rowspanData[row - 1];
				
				if (tmpIDx > 0) {
					$.each(colIndexs, function(index, value){
						var colNum = multiselect?value+1:value;
						$(trObj.cells[colNum]).attr("rowspan", tmpIDx);
					});
					if(multiselect){
						$(trObj.cells[1]).attr("rowspan", tmpIDx);
						if(tmpIDx!=1){
							$(trObj.cells[1]).find(":checkbox").click(function(){
								for(var i=1;i<tmpIDx;i++){
									$(tblObj).jqGrid('setSelection', row+i, true);
								}
							});
						}
					}
				} else {
					$.each(colIndexs, function(index, value){
						var colNum = multiselect?value+1:value;
						$(trObj.cells[colNum]).hide();
					});
					if(multiselect) $(trObj.cells[1]).hide();
				}
			}
		});
		
		jqgridRowCnt = rowcnt;
	});
};

