$.subscribe("/companyadmin/manage", function(e, companyId) {
    $("#CompanyId").val(companyId);
    var configUrl = $("#configUrl").val();
    $.ajax({
        url: configUrl,
        data: {
            companyId: companyId
        },
        cache: false,
        dataType: "html",
        success: function(data) {
            $("#configuration").html(data);
            $("#ReportParameter").multiselect({
                noneSelectedText: 'Select Configuration',
                selectedList: 2,
                minWidth: 500
            });
        }
    });
    $("#configuration").dialog("open");
});

$.subscribe("/companyadmin/saveconfig", function(e) {
    $("#CompanyConfigForm").submit();
    $("#configuration").dialog("close");
});

$(function() {

    $("#configuration").dialog({
        autoOpen: false,
        modal: true,
        width: 520,
        resizable: false,
        title: 'Company Configuration',
        buttons: {
            "Save": function() {
                $.publish("/companyadmin/saveconfig");

            },
            "Cancel": function() {
                $(this).dialog("close");
            }
        }

    });

    $(".companyConfig").click(function() {
        $.publish("/companyadmin/manage", $(this)
                .attr("companyId"));

    });
});