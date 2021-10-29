$(document).ready(function(){

    // Get the data 
    $.getJSON("/MainMenuTop4Number", function(data){
        var MainMenuTop4Numbers = new Map(Object.entries(data));
        $("#total_case_world").text(MainMenuTop4Numbers.get("total_case_world"));
        $("#today_case_world").text(MainMenuTop4Numbers.get("today_case_world"));
        $("#total_case_us").text(MainMenuTop4Numbers.get("total_case_us"));
        $("#today_case_us").text(MainMenuTop4Numbers.get("today_case_us"));
    })

});