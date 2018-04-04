$(function() {
    $("#addOption").click(function() {
        var row = "<tr>";
        row += "<th> 옵션 항목 </th>";
        row += "<td> <input type='text' name='OPTNAM' required> </td>";
        row += "<td> <input type='text' name='OPTCST' placeholder='가격' required> </td>";
        row += "<td> <button type='button' onclick='deleterow(this)'> 삭제 </td>";
        row += "</tr>";
        
        $("#optsubmit").before(row);
    
    });
});
function deleterow(obj) {
    var row = $(obj).parent().parent();
    row.remove();

};