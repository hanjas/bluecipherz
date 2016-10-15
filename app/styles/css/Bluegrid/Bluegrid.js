$(document).ready(function(){
    $('.blueNav  li').click(function(){
        $(this).parent().find('li').removeClass('active');
        $(this).addClass('active');
    });

});