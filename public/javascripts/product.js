
$(function() {
    var optnum = 2;

    $("#addImage").click(function() {
        var row = "<tr>";
        row += "<th> <label> </label> </th>";
        row += "<td> <input type='file' name='PRDIMG'> </td>";
        row += "<td> <button type='button' id='deleteImage' onclick='deleterow(this);'> 삭제 </td>";
        row += "</tr>";

        $("#salflg").before(row);
    });

    $("#addOption").click(function() {
        var select = $("#optcatselect").clone();
        
        var row = "<tr>";
        row += "<th> <label>  </label> </th>";
        row += "<td id='opt" + optnum + "'> </td>";
        row += "<td> <button type='button' id='deleteOption' onclick='deleterow(this);'> 삭제 </td>";
        row += "</tr>";
        $("#prdimg").before(row);
        var td = "#opt"+(optnum++);
        $(td).append(select);
    });

    $("#insertOption").click(function() {
        var w = window.open("/addoption", "popupWindow", "width=600, height=400, scrollbars=yes");
    });

});
function deleterow(obj) {
    var row = $(obj).parent().parent();
    row.remove();

};