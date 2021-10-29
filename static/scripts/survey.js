$(document).ready(function(){
    $("a[id *= nav-link]").removeClass("active");
    $("#nav-link-survey").addClass("active");

    // this is the id of the form
    $("#surveyForm").submit(function(e) {
        e.preventDefault(); // avoid to execute the actual submit of the form.

        var form = $(this);
        var url = form.attr("action");

        var required_fields = ["gender", "age", "impact_life", "impact_work", "wfh", "vaccine", "vaccine_later", "policy", "comment", "end", "satisfaction"];
        var form_selected = form.serialize();
        var send = true;

        for (required_field of required_fields) {
            if (!form_selected.includes(required_field)) {
                alert("Please select all fields :)");
                send = false;
                break;
            }
        }

        if (send) {
            $.ajax({
                type: "POST",
                url: url,
                data: form.serialize(), // serializes the form's elements.
                success: function(data)
                {
                   alert("Thank you for submitting :D"); // show response from the php script.
                }
            });
        }
    });
});