$(function() {
    var currentUser = $("#UserName").val();
    $('#reportTable').fixheadertable({
        colratio: getColumnWidth(),
        height: 300,
        // width : tableWidth,
        resizeCol: true,
        minColWidth: 50
                /*
                 * , sortable : true, sortType :
                 * ['string','string','string','date','string','string'], dateFormat : 'm/d/y
                 * h:MM:ss TT'
                 */
    });

    /*
     * $('#reportTable').tablesorter({ theme: 'blackice', selectorHeaders: '>
     * thead tr th, > thead tr td' });
     */
    function getColumnWidth() {
        var tableWidth = $("#reportTable").width();
        var columnsWidth = null;
        if ($.cookies.get(currentUser + 'reportManagementColWidth') === null) {
            columnsWidth = [(tableWidth * 15) / 100, (tableWidth * 30) / 100,
                (tableWidth * 15) / 100, (tableWidth * 15) / 100,
                (tableWidth * 15) / 100, (tableWidth * 10) / 100];
        } else {
            columnsWidth = eval("["
                    + $.cookies.get(currentUser + 'reportManagementColWidth')
                    + "]");
        }
        return columnsWidth;
    }

    $.subscribe("/fixheadertable/endresize", function(e) {
        var columnWidth = [];
        var i = 0;
        $('#reportTable tr:first td').each(function() {
            columnWidth.push($(this).width());
            i++;
        });
        $.cookies.set(currentUser + 'reportManagementColWidth',
                String(columnWidth), {
            expiresAt: new Date((new Date().getTime() + 5 * 60 * 1000))
        });

    });
    /*
     * $('#reportTable').selectable({ filter : 'tr', stop : function() {
     * $(".ui-selected", this).each(function() { var index = $("#myTable
     * tr").index(this) - 1; $('#myTable tbody tr:eq(' + index + ')')
     * .toggleClass('row_selected'); $('#myTable tbody tr:eq(' + index + ')')
     * .toggleClass('ui-selected'); }); } });
     */

    /*
     * $('#reportTable tr').mousedown(function(event) { $('#reportTable
     * tr').each(function() { $(this).children('td,th').removeClass('selected')
     * });
     * 
     * $(this).children('td,th').addClass('selected')
     * 
     * $selectedRowVal = { reportId : $(this).find('input:checkbox').val() };
     * 
     * });
     */
    $('#reportTable tr').click(function() {
        $(this).toggleClass('selected');
        /*
         * $('#cruisesTable tr').each(function() { $(this).children('td,
         * th').toggleClass('selected');
         * 
         * });
         */

    });

    function getReportId() {
        debugger
        var reportId = null;
        $('#reportTable tr').each(function() {
            if ($(this).hasClass('selected')) {

                if (reportId != null) {
                    reportId = reportId
                            + ";"
                            + $(this).children('td').find('.updateVersion')
                            .attr('id');
                } else {
                    reportId = $(this).children('td').find('.updateVersion')
                            .attr('id');

                }
            }
        });

        return reportId;
    }

    // Editing Version field
    $(".updateVersion").editable($("#updateUrl").val(), {
        indicator: "Saving...",
        event: "click",
        tooltip: "Click to Edit...",
        id: "reportId",
        name: "version",
        data: '{"Draft":"Draft","Final":"Final","Initial":"Initial","None":"_______","selected":"'
                + $(this).val() + '"}',
        type: "select",
        placeholder: "",
        onblur: "cancel"

    }).click(function(evt) {

        $(this).find('select').keydown(function(event) {

            if (event.which == 9 || event.which == 13) // 'Enter'
                $(this).closest('form').submit();
        });
    });

    $("input:button").button();
    var recipients = $("#txtRecipients"), subject = $("#txtSubject"), body = $("#txtBody"), allFields = $([])
            .add(recipients).add(subject).add(body), tips = $(".validateTips");

    function updateTips(t) {
        tips.text(t).addClass("ui-state-highlight");
        setTimeout(function() {
            tips.removeClass("ui-state-highlight", 1500);
        }, 500);
    }
    function checkLength(o, n, min, max) {
        if (o.val().length > max || o.val().length < min) {
            o.addClass("ui-state-error");
            updateTips("Length of " + n + " must be between " + min + " and "
                    + max + ".");
            return false;
        } else {
            return true;
        }
    }
    function checkRegexp(o, regexp, n) {
        if (!(regexp.test(o.val()))) {
            o.addClass("ui-state-error");
            updateTips(n);
            return false;
        } else {
            return true;
        }
    }

    var $dialog = $('<div></div>')
            .html('Please select a row before you perform this operation.')
            .dialog({
                modal: true,
                autoOpen: false,
                resizable: false,
                title: 'Information',
                buttons: {
                    "Close": function() {
                        $(this).dialog("close");
                    }
                }

            });

    $("#dialog").dialog({
        autoOpen: false,
        modal: true,
        resizable: false
    });

    $("#emailDialog").dialog({
        title: 'Send Email',
        height: 520,
        width: 550,
        modal: true,
        autoOpen: false,
        resizable: false,
        close: function() {
            allFields.val("").removeClass("ui-state-error");
        }
    });

    $("#btnSendEmail").click(function() {
        var bValid = true;
        allFields.removeClass("ui-state-error");
        var email = "[A-Za-z0-9\._%-]+@[A-Za-z0-9\.-]+\.[A-Za-z]{2,4}";
        var reg = new RegExp('^' + email + '(;\\n*' + email + ')*;?$');

        bValid = bValid && checkRegexp(recipients,
                // /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i,
                reg, "eg. f4tech@admin.com");

        bValid = bValid && checkLength(subject, "username", 1, 500);

        if (!bValid) {
            return;
        }

        // This code is unused due to implementing context menu
        /*
         * var reportId;
         * $("input:checkbox[name=Selects]:checked").each(function() {
         * if (reportId != null) { reportId = reportId + ";" +
         * $(this).val(); } else { reportId = $(this).val(); }
         * 
         * });
         */

        $.post($("#mailUrl").val(), {
            savedReportsId: String(getReportId()),
            subject: $("#txtSubject").val(),
            recipients: $("#txtRecipients").val(),
            mailBody: $("#txtBody").val()
        }, function(data) {
            $("#emailDialog").dialog("close");
        });

    });

    var fileDownloadCheckTimer;
    function BlockUIonDownload() {
        var token = new Date().getTime(); // use the current
        // timestamp as the
        // token value
        $('#download_token_value').val(token);
        $.blockUI({
            message: $('#reportMessage'),
            css: {
                border: 'none',
                padding: '15px',
                backgroundColor: 'grey',
                '-webkit-border-radius': '10px',
                '-moz-border-radius': '10px',
                opacity: .5,
                color: '#fff'
            }
        });
        fileDownloadCheckTimer = window.setInterval(function() {
            var cookieValue = $.cookies.get('fileDownloadToken');
            if (cookieValue == token)
                finishDownload();
        }, 1000);
    }

    function finishDownload() {
        window.clearInterval(fileDownloadCheckTimer);
        $.cookies.set('fileDownloadToken', null); // clears this cookie
        // value
        $.unblockUI();
    }

    // Show context menu and perform menu click action
    $("#reportTable tbody tr").contextMenu({
        menu: 'reportMenu'
    }, function(action, el, pos) {
        if (getReportId() == null) {
            $dialog.dialog('open');
            return false;
        }
        debugger
        if (action == "email") {
            $("#emailDialog").dialog('open');
        }
        if (action == "download") {
            $("#reportId_value").val(getReportId());
            BlockUIonDownload();
            $("#ReportingForm").submit();
            return true;
        }
        if (action == "delete") {
            $("#dialog").dialog({
                buttons: {
                    "Confirm": function() {
                        var delUrl = $("#delSavedUrl").val();
                        $.ajax({
                            url: delUrl,
                            data: {
                                savedReportId: String(getReportId())
                            },
                            cache: false,
                            dataType: "html",
                            success: function(data) {
                                $("#ReportManagement")
                                        .html(data);
                            }
                        });

                        $(this).dialog("close");
                    },
                    "Cancel": function() {
                        $(this).dialog("close");
                    }
                }
            });

            $("#dialog").dialog("open");
        }
    });

})