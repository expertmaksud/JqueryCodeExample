$(function() {

    $(document).ajaxStart($.blockUI).ajaxStop($.unblockUI);
    $("#tabs").tabs({
        select: function(event, ui) {
            if (ui.index === 1) {
                var reportUrl = $("#reportUrl").val();
                $.ajax({
                    url: reportUrl,
                    cache: false,
                    dataType: "html",
                    success: function(data) {
                        $("#ReportManagement")
                                .html(data);
                    }
                });
                // $("#ReportManagement").load(reportUrl);

            }
        }

    });

    $("input:submit,input:button").button();

})