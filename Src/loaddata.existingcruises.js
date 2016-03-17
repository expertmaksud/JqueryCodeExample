$(function() {

    var currentUser = $("#UserName").val();
    var selectedRowVal = null;
    $('#cruisesTable tr:not(:first)').mousedown(function(event) {
        $('#cruisesTable tr').each(function() {
            $(this).children('td').css('background', '');
        });
        $(this).children('td').css('background', '#dccca4');

        selectedRowVal = {
            dbId: $(this).find('.editable').attr('id'),
            dbName: $(this).find('.dbname').html()

        };

    });

    $('#cruisesTable').fixheadertable({
        colratio: getColumnWidth(),
        height: 300,
        // width : tableWidth,
        resizeCol: true,
        minColWidth: 50
                /*
                 * , sortable : true, sortType : ['string','string','string','string',
                 * 'integer', 'integer','date','date','string'], dateFormat : 'd-m-y'
                 */
    });

    function getColumnWidth() {
        var tableWidth = $("#cruisesTable").width();
        var columnsWidth = null;
        if ($.cookies.get(currentUser + 'existingcruisesColWidth') == null) {
            columnsWidth = [(tableWidth * 15) / 100, (tableWidth * 10) / 100,
                (tableWidth * 10) / 100, (tableWidth * 15) / 100,
                (tableWidth * 8) / 100, (tableWidth * 8) / 100,
                (tableWidth * 12) / 100, (tableWidth * 12) / 100,
                (tableWidth * 10) / 100];
        } else {
            columnsWidth = eval("["
                    + $.cookies.get(currentUser + 'existingcruisesColWidth')
                    + "]");
        }
        return columnsWidth;
    }

    $.subscribe("/fixheadertable/endresize", function(e) {
        var columnWidth = [];
        var i = 0;
        $('#cruisesTable tr:first td').each(function() {
            columnWidth.push($(this).width());
            i++;
        });
        $.cookies.set(currentUser + 'existingcruisesColWidth',
                String(columnWidth), {
            expiresAt: new Date((new Date().getTime() + 5
                    * 365 * 24 * 60 * 60 * 1000))
                    // 5 years from now
        });

    });

    $('#cruisesTable tr td').qtip({
        content: 'Right click to report or delete database',
        show: 'mouseover',
        hide: 'mouseout',
        position: {
            corner: {
                target: 'topMiddle',
                tooltip: 'bottomMiddle'
            }
        },
        style: {
            width: 200,
            padding: 5,
            background: 'tan',
            color: 'black',
            textAlign: 'center',
            border: {
                width: 7,
                radius: 5,
                color: 'tan'
            },
            tip: 'bottomLeft',
            name: 'light'
        }
    });

    $("input:button").button();

    $('.editable').editable($("#updateUrl").val(), {
        indicator: 'Saving...',
        event: 'dblclick',
        tooltip: 'Double Click to Edit...',
        name: 'loadTag',
        select: true,
        type: 'text',
        style: 'inherit',
        placeholder: '',
        onblur: 'submit'
                // loaddata : {id: selectedRowsChkBoxValue}
                // submitdata:{id: $("#reportId_value").val() }
    });
    $('.editableDate').editable($("#updateCruiseDate").val(), {
        indicator: 'Saving...',
        event: 'dblclick',
        tooltip: 'Double Click to Edit...',
        name: 'cruiseDate',
        select: true,
        type: 'datepicker',
        style: 'inherit',
        placeholder: '',
        onblur: 'cancel'
                // loaddata : {id: selectedRowsChkBoxValue}
                // submitdata:{id: $(this).find('.editable').attr('id') }
    });

    var fileDownloadCheckTimer;
    function BlockUIonDownload() {
        var token = new Date().getTime(); // use the current
        // timestamp as the token value
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
    var $confirmDelete = $('<div></div>').dialog({
        autoOpen: false,
        modal: true,
        resizable: false,
        title: 'Notice!',
        buttons: {
            "Confirm": function() {
                var delUrl = $("#delUrl").val();
                $.ajax({
                    url: delUrl,
                    data: {
                        id: String(selectedRowVal.dbId)
                    },
                    cache: false,
                    dataType: "html",
                    success: function(data) {
                        $("#ManageCruises").html(data);
                    }
                });

                $(this).dialog("close");
            },
            "Cancel": function() {
                $(this).dialog("close");
            }
        }
    });

    var $growYears = $('<div></div>').dialog({
        autoOpen: false,
        modal: true,
        resizable: false,
        title: 'Growth and Volume',
        close: function(event, ui) {
            // $("#numYrs").val("").removeClass("ui-state-error");
            // $(this).dialog("destroy");
        },
        buttons: {
            "Continue": function() {

                var growUrl = $("#growUrl").val();
                $.ajax({
                    url: growUrl,
                    data: {
                        id: String(selectedRowVal.dbId),
                        dbName: String(selectedRowVal.dbName)
                                // ,
                                // yrs : String(growYrs)
                    },
                    cache: false,
                    dataType: "html",
                    success: function(data) {
                        var $dialog = $('<div></div>').html(data)
                                .dialog({
                                    modal: true,
                                    autoOpen: true,
                                    resizable: false,
                                    title: 'Growth Running',
                                    buttons: {
                                        "Ok": function() {
                                            $(this)
                                                    .dialog("close");
                                        }
                                    }

                                });
                        // alert(data);
                        // window.location.reload();
                    }
                });

                $(this).dialog("close");
            },
            "Cancel": function() {
                $(this).dialog("close")
                // $(this).dialog("destroy");
            }
        }
    });
    // Show menu when a list item is clicked
    $("#cruisesTable tbody tr").contextMenu({
        menu: 'reportMenu'
    }, function(action, el, pos) {
        var DbId = selectedRowVal.dbId;
        if (action == "report") {
            $("#reportId_value").val(DbId);
            BlockUIonDownload();
            $("#ReportingForm").submit();
        }
        if (action == "delete") {
            $confirmDelete.html('Are you sure you want to delete '
                    + selectedRowVal.dbName
                    + ' ? All its reports will be deleted too.')
            $confirmDelete.dialog("open");
        }
        /*
         * if (action == "grow") { $growYears.html('Number of years to
         * grow ' + selectedRowVal.dbName + ' ?' + '<input type="text"
         * id="numYrs" />') $growYears.dialog("open"); }
         */
        if (action == "grow") {
            $.ajax({
                url: $("#growthUrl").val(),
                cache: false,
                dataType: "json",
                type: "GET",
                success: function(data) {
                    // debugger;
                    var growthYear = !data.GrowthYear
                            ? new Date().getFullYear()
                            : data.GrowthYear;
                    var message = !data.FortBragg
                            ? 'standard diameter growth model to '
                            + growthYear
                            : 'Fort Bragg diameter growth model to '
                            + growthYear;
                    $growYears
                            .html('Please click continue to grow '
                                    + message)
                    $growYears.dialog("open")
                }
            });

            ;
        }
    });
})
