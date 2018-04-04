$(document).ready(function () {

    $("#bg_popup").click(function () {  //Thêm thuộc tính click vào thẻ  <a>
        closePopup();
    });

  //  $("article.main").css("min-height", $(window).height());
});


$(window).resize(function () {
    $("#mask , .login-popup").fadeOut(100, function () {
        $("#mask").remove();
    });
});



function showLoading() {

    $("body").append("<div id='bg_loading'></div>");
    $("body").append("<div id='loading'></div>");

    var popMargTop = ($(window).height() - 300) / 2;
    var popMargLeft = ($(window).width() - 400) / 2;

    $("#loading").css({
        "margin-top": - popMargTop
        ,"margin-left": popMargLeft
    });

    $("#bg_loading").fadeIn(300);
    $("#loading").fadeIn(300);

}
function hideLoading() {

    $("#bg_loading , #loading").fadeOut(100, function () {
        $("#loading").remove();
        $("#bg_loading").remove();
   });
    
}

function showPopup(tittle) {

    // set title popop
    $("#popup_box div.popup_title").text(tittle);
    
    // Getting the variable's value from a link 
    var loginBox = "#popup_box"; //$(this).attr('href');   
    
    // Add the mask to body
    $("body").append("<div id='mask'></div>");
    $("#mask").fadeIn(300);
        
    //Fade in the Popup and add close button       
    setTimeout(function () {
        var popMargTop = ($(loginBox).height()) / 2;
        var popMargLeft = ($(window).width() - $(loginBox).width()) / 2;

        $(loginBox).css({
            "margin-top": -popMargTop
            ,"margin-left": popMargLeft
        });

        $(loginBox).fadeIn(400);
    }, 500);    
    //Set the center alignment padding + border
    $("body #mask ").click(function () {  //Thêm thuộc tính click vào thẻ  <a>       
        $("#mask , .login-popup").fadeOut(100, function () {            
            $("#mask").remove();
        });
    });

    return false;
}

// When clicking on the button close or the mask layer the popup closed
$("a.close, #mask").live('click', function () {
    $("#mask , .login-popup").fadeOut(100, function () {
        $("#popup_content").empty();
        $("#mask").remove();
       hideLoading();
    });
    return false;
});


function closePopup() {
    $("#mask , .login-popup").fadeOut(100, function () {
        $("#popup_content").empty();
        $("#mask").remove();
       hideLoading();
    });
}

// back button

// alert custom
function showAlert(tittle) {
    // set title popop
    $("#alert-box div.popup_title").text(tittle);
    // Getting the variable's value from a link 
    var loginBox = "#alert-box"; //$(this).attr('href');   
    // Add the mask to body
    $("body").append("<div id='mask'></div>");
    $("#mask").fadeIn(300);
    //Fade in the Popup and add close button       
    setTimeout(function () {
        var popMargTop = ($(loginBox).height()) / 2;
        //var popMargLeft = ($(window).width() - $(loginBox).width()) / 2;
        $(loginBox).css({
            "margin-top": -popMargTop
            //,"margin-left": -popMargLeft
        });
        $(loginBox).fadeIn(400);
    }, 100);
    //Set the center alignment padding + border
    $("body #mask ").click(function () {  //Thêm thuộc tính click vào thẻ  <a>       
        $("#mask , .login-popup").fadeOut(100, function () {
            $("#mask").remove();
        });
    });
    return false;
}

function closeAlert() {
    $("#mask , .login-popup").fadeOut(100, function () {
        $("#alert_content").empty();
        $("#mask").remove();
        hideLoading();
    });
}

// alert custom
function cusAlert(tittle,msg) {
    // set title popop
    $("#cus_alert div.cus_alert_title").text(tittle);    
    var alertBox = "#cus_alert";
    $("body").append("<div id='alert_mask'></div>");
    $("#alert_mask").fadeIn(300);   
    //Fade in the Popup and add close button
    setTimeout(function () {
        var MargTop = ($(alertBox).height()+200) / 2;
        //var popMargLeft = ($(window).width() - $(loginBox).width()) / 2;
        $(alertBox).css({
            "margin-top": -MargTop
            //,"margin-left": -popMargLeft
        });
        $("#cus_alert_content").text(msg);
        $(alertBox).fadeIn(150);
    }, 100);

    setTimeout(function () {
        $("#alert_mask , .cus_alert").fadeOut(2000, function () {
            $("#alert_mask").remove();
            $("#cus_alert_content").empty();
        });    
    },1000);
    
    return false;
}




