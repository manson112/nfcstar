$(function() {
    var imgnum = 2;

    $("#addImage").click(function() {
        var select = $("#prd_select").clone();
        
        var row = "<tr>";
        row += "<th> <label> </label> </th>";
        row += "<td> <input type='file' name='EVTIMG'> </td>";
        row += "<td id='d_img" + imgnum +"'> </td>"; 
        row += "<td> <button type='button' id='deleteImage' onclick='deleterow(this);'> 삭제 </td>";
        row += "</tr>";

        $("#evtvdo").before(row);

        var td = "#d_img" + imgnum++;
        $(td).append(select);

    });
});
function deleterow(obj) {
    var row = $(obj).parent().parent();
    row.remove();

};