$(function() {

    // $("#s1").dropdownchecklist();

    $("input:submit,input:button").button();

    $("#ReportId").multiselect({
        noneSelectedText: 'Select Reports',
        selectedList: 3,
        minWidth: 500
    });

    /*
     * $("multieditor").validate({ rules : { LoadedDBNameTime : {
     * required : true } } });
     */

    if ($("#ReportId option:selected").text().indexOf("Statistical") === -1) {
        $("#statisticalReport").hide();
    }
    $("#ReportId").bind("change", function() {
        var selected = $("#ReportId option:selected");
        var selectedText = selected.text();
        var pos = selectedText.indexOf("Statistical");
        if (pos !== -1) {
            $("#statisticalReport").show();
        } else {
            $("#statisticalReport").hide();
        }

    });

});