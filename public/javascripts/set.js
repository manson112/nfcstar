var setnum = 2;
var prd;
$(document).ready(function() {
    prd = $.parseJSON($("#prdlist").val());
    $("#prd1cst").html(prd[0].PRDCST + " 원"); 
    $("#prd2cst").html(prd[0].PRDCST + " 원"); 
   
    $("#prev1cst").attr("value", prd[0].PRDCST);
    $("#prev2cst").attr("value", prd[0].PRDCST);
    
    $("#setscst").val(parseInt(prd[0].PRDCST) + parseInt(prd[0].PRDCST));
});
$(function() {
    $("#addProduct").click(function() {
        var select = $("#prd2").clone().attr("id", "prd"+(++setnum)).attr("onChange", "prdChange("+setnum+")");
        
        var row = "<tr>";
        row += "<th> <label>  </label> </th>";
        row += "<td id='set" + setnum + "'> </td>";
        row += "<td id='prd"+ setnum + "cst'>" + prd[0].PRDCST + " 원 </td>";
        row += "<td> <button type='button' id='deleteSet' onclick='deleterow(this, "+ setnum +");'> 삭제 </td>";
        row += "<td> <input type='hidden' id='prev"+ setnum +"cst' value='" + prd[0].PRDCST + "'> </td>";
        row += "</tr>";
        $("#setcst").before(row);
        var td = "#set"+(setnum);
    
        $(td).append(select);

        var total = $("#setscst").val();
        
        $("#setscst").val(parseInt(total) + parseInt(prd[$("#prd"+setnum).val() - 1].PRDCST));

    });
});

function prdChange(obj) {
    var id = "#prd" + obj;
    var seq = $(id).val() - 1;
    var td = "#prd" + obj + "cst";
    $(td).html(prd[seq].PRDCST + " 원");


    var total = $("#setscst").val();
    var prev = "#prev"+obj+"cst";
    $("#setscst").attr("value", parseInt(total) - parseInt($(prev).val()) + parseInt(prd[$("#prd"+obj).val() - 1].PRDCST));
    $(prev).attr("value", prd[$("#prd"+obj).val() - 1].PRDCST);
}

function deleterow(obj, index) {
    var total = $("#setscst").val();
    var now = $("#prev"+index+"cst").val();
    $("#setscst").attr("value", parseInt(total) - parseInt(now));

    var row = $(obj).parent().parent();
    row.remove();

};