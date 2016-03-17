var projectUtil = {
    fileDownloadCheckTimer: null,
    $stickyActionOffsetTop: 0,
    $headerHeight: 0,
    GetProjectId: function () {
        return $("#hdnProjectId").val();
    },
    GetURLParameter: function () {
        var sPageURL = window.location.href;
        var indexOfLastSlash = sPageURL.lastIndexOf("/");

        if (indexOfLastSlash > 0 && sPageURL.length - 1 !== indexOfLastSlash)
            return sPageURL.substring(indexOfLastSlash + 1);
        else
            return 0;
    },
    finishDownload: function () {
        window.clearInterval(projectUtil.fileDownloadCheckTimer);
        $.cookies.set('fileDownloadToken', null); // clears this cookie value
        $.unblockUI();
    },
    BlockUIonDownload: function (elemntId) {
        var token = new Date().getTime(); // use the current timestamp as the
        // token value
        $('#' + elemntId).val(token);
        $.blockUI({
            message: $('#reportMessage'),
            css: {
                border: 'none',
                padding: '15px',
                backgroundColor: 'grey',
                '-webkit-border-radius': '10px',
                '-moz-border-radius': '10px',
                opacity: 0.5,
                color: '#fff'
            }
        });
        projectUtil.fileDownloadCheckTimer = window.setInterval(function () {
            var cookieValue = $.cookies.get('fileDownloadToken');
            if (cookieValue === token)
                projectUtil.finishDownload();
        }, 1000);
    },
    updateTips: function (t) {
        var tips = $(".validateTips");
        tips.text(t).addClass("ui-state-highlight");
        setTimeout(function () {
            tips.removeClass("ui-state-highlight", 1500);
        }, 500);
    },
    checkLength: function (o, n, min, max) {
        if (o.val().length > max || o.val().length < min) {
            o.addClass("ui-state-error");
            projectUtil.updateTips("Length of " + n + " must be between " + min
                    + " and " + max + ".");
            return false;
        } else {
            return true;
        }
    },
    checkRegexp: function (o, regexp, n) {
        if (!(regexp.test(o.val()))) {
            o.addClass("ui-state-error");
            projectUtil.updateTips(n);
            return false;
        } else {
            return true;
        }
    },
    alertDialog: function (message) {
        var $dialog = $('<div></div>').html(message).dialog({
            modal: true,
            autoOpen: false,
            resizable: false,
            title: 'Alert',
            buttons: {
                "Close": function () {
                    $(this).dialog("close");
                }
            }

        });

        return $dialog;
    },
    stickyActionDiv: function () {

        var scroll_top = $(window).scrollTop() + this.$headerHeight + 40;

        var actionDivWidth = $("#actionDiv").width();

        if (scroll_top > this.$stickyActionOffsetTop) {
            $("#actionDiv").addClass('transparentAction');
            $("#actionDiv").css({
                width: actionDivWidth,
                top: this.$stickyActionOffsetTop - 35
            });
        } else {
            $("#actionDiv").removeClass('transparentAction');
        }
    }

};

var trackReports = {
    maxQue: 10,
    init: function () {
        trackReports.configCruiseTable();
        trackReports.configUploder();

        $("#uploaderAccordion").accordion({
            collapsible: true,
            heightStyle: "fill",
            autoHeight: false,
            active: false,
            activate: function (event, ui) {
                alert("done");
            }
        });

        $('#cruiseUploader_start').click(function (e) {
            trackReports.startUploading();
        });

        trackReports.configureEmailDialog();

        trackReports.configureRowDetailsDialog();
    },
    configUploder: function () {
        $("#cruiseUploader").plupload({
            // General settings
            runtimes: 'html5,flash,silverlight,browserplus,gears',
            url: $("#loadUrl").val() + "?projectId="
                    + projectUtil.GetProjectId(),
            max_file_size: '1000000mb',
            max_file_count: trackReports.maxQue, // user can add no more then 20 files at a time

            unique_names: true,
            multiple_queues: true,
            // Resize images on client side if we can
            resize: {
                width: 320,
                height: 240,
                quality: 90
            },
            // Rename files by clicking on their titles
            rename: true,
            // Sort files
            sortable: true,
            // Specify what files to browse for
            filters: [{
                    title: "MDB/Zip files",
                    extensions: "mdb,zip"
                }],
            // Flash settings
            flash_swf_url: $("#pulploadSwf").val(),
            // Silverlight settings
            silverlight_xap_url: $("#pulploadXap").val(),
            /*
             * preinit : { FilesAdded : function(up, files) {
             * plupload.each(files, function(file) { // addRemoveFileToolTip();
             * console.log('[UploadFile]', 'files added' + file.name); }); },
             * QueueChanged : function(up) { addRemoveFileToolTip(); } },
             */
            init: {
                FilesAdded: function (up, files) {

                    var matchRows = [];
                    plupload.each(files, function (file) {

                        /*
                         * var unzipper = new JSUnzip(file); if
                         * (unzipper.isZipFile()) {
                         * unzipper.readEntries(); for (var i = 0; i <
                         * unzipper.entries.length; i++) { var entry =
                         * unzipper.entries[i]; alert(entry.fileName); } }
                         */
                        if ($('#cruisesTable tr:has(td:contains("'
                                + String(file.name) + '"))').length != 0) {
                            matchRows.push(file);

                        }
                    })

                    if (matchRows.length > 0) {
                        var $promptForNo = $('<div></div>')
                                .html('Please rename the files to different unique names to load.')
                                .dialog({
                                    autoOpen: false,
                                    modal: true,
                                    resizable: false,
                                    title: 'Notice!',
                                    buttons: {
                                        "Ok": function () {
                                            $(this).dialog("close");
                                        }
                                    }
                                });
                        var $confirmDelete = $('<div></div>')
                                .html('Database is already loaded.Do you want to overwrite?')
                                .dialog({
                                    autoOpen: false,
                                    modal: true,
                                    resizable: false,
                                    title: 'Notice!',
                                    buttons: {
                                        "No": function () {
                                            jQuery.each(matchRows,
                                                    function () {
                                                        up
                                                                .removeFile(this);
                                                    });

                                            $(this).dialog("close");
                                            $promptForNo.dialog("open");
                                        },
                                        "Yes": function () {
                                            $(this).dialog("close");
                                            trackReports
                                                    .startUploading();
                                        }
                                    }
                                });

                        $confirmDelete.dialog("open");
                    }
                },
                QueueChanged: function (up) {
                    // addRemoveFileToolTip();

                }

            }
        });

        $('#cruiseUploader').plupload('getUploader').bind('FilesAdded',
                function (up, files) {

                    // Check if the size of the queue is bigger than
                    // maxQue
                    if (up.files.length > trackReports.maxQue) {

                        // Removing the extra files
                        while (up.files.length > trackReports.maxQue) {
                            if (up.files.length > trackReports.maxQue)
                                uploader
                                        .removeFile(up.files[trackReports.maxQue]);
                        }

                        alert("Max " + trackReports.maxQue
                                + " files can be uploaded.");

                    }

                });

        $("#cruiseUploader_browse").qtip({
            content: 'Add Upto 10 .MDB Database(Zipped or Unzipped) Files',
            show: 'mouseover',
            hide: 'mouseout',
            style: {
                name: 'cream',
                tip: 'bottomLeft'
            },
            position: {
                corner: {
                    target: 'topLeft',
                    tooltip: 'bottomLeft'
                }
            }
        });

        $("#cruiseUploader_start").qtip({
            content: 'Upload Selected Files',
            show: 'mouseover',
            hide: 'mouseout',
            style: {
                name: 'cream',
                tip: 'bottomLeft'
            },
            position: {
                corner: {
                    target: 'topRight',
                    tooltip: 'bottomMiddle'
                }
            }
        });

    },
    configCruiseTable: function () {
        var colVisible = true;
        var vGrowthTree = $("#IsGrowthTreeVisible").val();

        if ($("#isProjectOnly").val() === 'True') {
            // Use for visibility by role
            colVisible = false;
        }
        var oTable = $('#cruisesTable').dataTable({
            "bPaginate": false,
            "bLengthChange": false,
            "bFilter": false,
            "bSort": true,
            "bInfo": false,
            // "sScrollY" : "280px",
            "sScrollX": "100%",
            "sScrollXInner": "99%",
            "bAutoWidth": true,
            "bScrollCollapse": true,
            "aoColumnDefs": [{
                    bSortable: false,
                    bVisible: colVisible,
                    aTargets: [10, 11, 12, 13, 14, 15]
                }],
            "aoColumns": [{
                    bSortable: false
                }, null, null, null, null, null, null, {
                    "sType": "datetime-us"
                }, null, null, null, {
                    bVisible: vGrowthTree.toLowerCase() == "true"
                            ? true
                            : false
                }, null, null, null, null]
        });

        new FixedHeader(oTable);

        $('.editable').editable($("#updateTagUrl").val(), {
            indicator: 'Saving...',
            event: 'dblclick',
            tooltip: 'Double Click to Edit...',
            name: 'loadTag',
            select: true,
            type: 'text',
            style: 'inherit',
            placeholder: '',
            onblur: 'submit'

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
            onblur: 'cancel',
            ajaxoptions: {
                // async : false,
                // global: false,
                // cache: false,
                /*
                 * success : function(data) { debugger return data; },
                 */
                error: function (xhr, textStatus, errorThrown) {
                    debugger;
                    jQuery.event.trigger("ajaxStop");

                    return false;
                }/*
                 * , complete : function(xhr, textStatus) {
                 * debugger;
                 * 
                 * location.reload(); }
                 */
            }

        });

        $("#cruisesTable tbody td.expand img").qtip({
            content: this.alt,
            show: 'mouseover',
            hide: 'mouseout',
            style: {
                name: 'cream',
                tip: 'bottomLeft',
                cursor: 'pointer'
            },
            position: {
                corner: {
                    target: 'topRight',
                    tooltip: 'bottomMiddle'
                }
            }
        });

        $('#cruisesTable tbody td.expand img').live('click', function () {
            var nTr = $(this).parents('tr')[0];
            if (oTable.fnIsOpen(nTr)) {
                /* This row is already open - close it */
                this.src = "../../Content/images/plussign.png";
                this.alt = "Expand/Collapse";
                oTable.fnClose(nTr);
            } else {

                /* Open this row */
                this.src = "../../Content/images/minus.png";
                var data = trackReports.loadReports(this.id);
                this.alt = 'Collapse';

                $.when(data).then(function (theData) {
                    oTable.fnOpen(nTr, theData, 'details ui-corner-all');

                    var oReportTable = $('#reportTable').dataTable({
                        "bPaginate": false,
                        "bLengthChange": false,
                        "bFilter": false,
                        "bSort": false,
                        "bInfo": false,
                        "bAutoWidth": false,
                        "bDestroy": true,
                        "sScrollY": "150px",
                        "sScrollX": "100%",
                        "sScrollXInner": "99%",
                        "bScrollCollapse": true,
                        "aoColumnDefs": [{
                                aTargets: [0],
                                sTitle: '<input type="checkbox" id="chkReportHeader"></input>'

                            }]
                    });

                    new FixedHeader(oReportTable);

                    $('#chkReportHeader').click(function () {
                        var isChecked = $('#chkReportHeader').attr('checked');
                        $('#reportTable .chkReportColumn').attr('checked',
                                isChecked);
                        if (isChecked) {
                            $('#reportTable tr').addClass('selected');
                        } else {
                            $('#reportTable tr').removeClass('selected');
                        }
                    });

                    $('#reportTable tr .chkReportColumn').click(function () {
                        $(this).closest('tr').toggleClass('selected');
                    });
                    $('#reportTable tr .ahref').click(function () {
                        $("#ReportId_value").val(this.id);
                        projectUtil
                                .BlockUIonDownload('report_token_value');
                        $("#OpenReportForm").submit();

                    });

                    $(".updateVersion").editable($("#updateServiceUrl").val(),
                            {
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

                            }).click(function (evt) {

                        $(this).find('select').keydown(function (event) {

                            if (event.which == 9
                                    || event.which == 13) // 'Enter'
                                $(this).closest('form')
                                        .submit();
                        });
                    });

                });

            }
        });

        $('#cruisesTable tbody td.report img').live('click', function () {
            trackReports.deliverReport(this.id);
        });

        $("#cruisesTable tbody td.report img").qtip({
            content: 'Report',
            show: 'mouseover',
            hide: 'mouseout',
            style: {
                name: 'cream',
                tip: 'bottomLeft',
                cursor: 'pointer'
            },
            position: {
                corner: {
                    target: 'topRight',
                    tooltip: 'bottomMiddle'
                }
            }
        });

        $('#cruisesTable tbody td.grow img').live('click', function () {
            trackReports.growthVolume(this.id, $(this).closest('tr')
                    .find('.dbname').html());
        });
        $("#cruisesTable tbody td.grow img").qtip({
            content: 'Grow',
            show: 'mouseover',
            hide: 'mouseout',
            style: {
                name: 'cream',
                tip: 'bottomLeft',
                cursor: 'pointer'
            },
            position: {
                corner: {
                    target: 'topRight',
                    tooltip: 'bottomMiddle'
                }
            }
        });
        $('#cruisesTable tbody td.delete img').live('click', function () {
            trackReports.deleteReport(this.id, $(this).closest('tr')
                    .find('.dbname').html());
        });
        $("#cruisesTable tbody td.delete img").qtip({
            content: 'Delete',
            show: 'mouseover',
            hide: 'mouseout',
            style: {
                name: 'cream',
                tip: 'bottomLeft',
                cursor: 'pointer'
            },
            position: {
                corner: {
                    target: 'topRight',
                    tooltip: 'bottomMiddle'
                }
            }
        });
        $('#cruisesTable tbody td.move img').live('click', function () {
            trackReports.moveDatabase(this.id);
        });
        $("#cruisesTable tbody td.move img").qtip({
            content: 'Move',
            show: 'mouseover',
            hide: 'mouseout',
            style: {
                name: 'cream',
                tip: 'bottomLeft',
                cursor: 'pointer'
            },
            position: {
                corner: {
                    target: 'topRight',
                    tooltip: 'bottomMiddle'
                }
            }
        });

        $("#cruisesTable tbody td.strata img").live('click', function () {
            trackReports.showStrataAcres(this.id);
        });

        $("#cruisesTable tbody td.strata img").qtip({
            content: 'Strata Acres',
            show: 'mouseover',
            hide: 'mouseout',
            style: {
                name: 'cream',
                tip: 'bottomMiddle',
                cursor: 'pointer'
            },
            position: {
                corner: {
                    target: 'topRight',
                    tooltip: 'bottomMiddle'
                }
            }
        });

        $("#cruisesTable tbody td.stratum img").live('click', function () {
            trackReports.showPlotStratum(this.id);
        });

        $("#cruisesTable tbody td.stratum img").qtip({
            content: 'Plot Stratum',
            show: 'mouseover',
            hide: 'mouseout',
            style: {
                name: 'cream',
                tip: 'bottomMiddle',
                cursor: 'pointer'
            },
            position: {
                corner: {
                    target: 'topRight',
                    tooltip: 'bottomMiddle'
                }
            }
        });
    },
    loadReports: function (dbId) {
        return $.ajax({
            url: $("#getReports").val(),
            data: {
                DbId: dbId
            },
            cache: false,
            dataType: "html"

        });

    },
    startUploading: function () {
        var uploader = $('#cruiseUploader').plupload('getUploader');
        $.blockUI({
            message: $('#domMessage'),
            css: {
                border: 'none',
                padding: '15px',
                backgroundColor: 'grey',
                '-webkit-border-radius': '10px',
                '-moz-border-radius': '10px',
                opacity: 0.5,
                color: '#fff'
            }
        });

        // Files in queue upload them first
        if (uploader.files.length > 0) {
            // When all files are uploaded submit form
            uploader.bind('StateChanged', function () {
                if (uploader.files.length === (uploader.total.uploaded + uploader.total.failed)) {

                    $('#ProjectDetailsForm').submit();
                }
            });
            uploader.start();
        } else
            alert('You must at least upload one file.');
        return false;
    },
    deliverReport: function (dbId) {
        $("#projectId_value").val(projectUtil.GetProjectId());
        $("#reportId_value").val(dbId);
        $.ajax({
            url: $("#validateUrl").val(),
            datatype: "json",
            cache: false,
            success: function (data) {
                if (data === 'Download') {
                    projectUtil
                            .BlockUIonDownload('report_download_token_value');
                    $("#GenerateReportForm").submit();
                } else if (data === 'Email') {
                    $.ajax({
                        url: $("#deliverReportUrl").val(),
                        datatype: "json",
                        type: "POST",
                        cache: false,
                        data: {
                            'ReportId': $("#reportId_value")
                                    .val(),
                            'DownloadToken': '',
                            'ProjectId': $("#projectId_value")
                                    .val()
                        },
                        success: function (data) {
                            alert(data);
                        },
                        error: function (data) {
                            alert(data);
                        }
                    });
                } else {
                    alert(data);
                }
            }
        });

    },
    growthVolume: function (dbId, dbName) {
        var $growYears = $('<div></div>').dialog({
            autoOpen: false,
            modal: true,
            resizable: false,
            title: 'Growth and Volume',
            buttons: {
                "Continue": function () {

                    var growUrl = $("#growUrl").val();
                    $.ajax({
                        url: growUrl,
                        data: {
                            id: dbId,
                            dbName: dbName,
                            projectId: projectUtil.GetProjectId()

                        },
                        cache: false,
                        dataType: "html",
                        success: function (data) {
                            var $dialog = $('<div></div>').html(data)
                                    .dialog({
                                        modal: true,
                                        autoOpen: true,
                                        resizable: false,
                                        title: 'Growth Running',
                                        buttons: {
                                            "Ok": function () {
                                                $(this).dialog("close");
                                            }
                                        }

                                    });

                        }
                    });

                    $(this).dialog("close");
                },
                "Cancel": function () {
                    $(this).dialog("close");
                    // $(this).dialog("destroy");
                }
            }
        });

        $.ajax({
            url: $("#growthVolumeUrl").val(),
            cache: false,
            dataType: "json",
            type: "GET",
            success: function (data) {
                var growthYear = !data.GrowthYear ? new Date()
                        .getFullYear() : data.GrowthYear;
                var message = !data.FortBragg
                        ? 'standard diameter growth model to '
                        + growthYear
                        : 'Fort Bragg diameter growth model to '
                        + growthYear;
                $growYears.html('Please click continue to grow '
                        + message);
                $growYears.dialog("open");
            }
        });
    },
    deleteReport: function (dbId, dbName) {
        var $confirmDelete = $('<div></div>').dialog({
            autoOpen: false,
            modal: true,
            resizable: false,
            title: 'Notice!',
            buttons: {
                "Confirm": function () {
                    var delUrl = $("#delUrl").val();
                    $.ajax({
                        url: delUrl,
                        type: "POST",
                        data: {
                            id: dbId,
                            projectId: projectUtil
                                    .GetProjectId()
                        },
                        cache: false,
                        dataType: "json",
                        success: function (data) {
                            $(this).dialog("close");
                            alert(data);
                            $("#ProjectDetailsForm").submit();
                            // location.reload();
                        }
                    });

                    $(this).dialog("close");
                },
                "Cancel": function () {
                    $(this).dialog("close");
                }
            }
        });

        $confirmDelete.html('Are you sure you want to delete ' + dbName
                + ' ? All its reports will be deleted too.');
        $confirmDelete.dialog("open");
    },
    moveDatabase: function (dbId) {
        var $moveWindow = $("#docWindow").dialog({
            autoOpen: false,
            height: 300,
            width: 350,
            title: "Move Database",
            modal: true,
            buttons: {
                "Move": function () {
                    $.ajax({
                        url: $("#moveDbUrl").val(),
                        dataType: 'html',
                        data: {
                            DbId: dbId,
                            ProjectId: $("#drpProjectList")
                                    .val()
                        },
                        type: 'POST',
                        cache: false,
                        success: function (result) {
                            $(this).dialog("close");
                            location.reload();
                        }
                    });

                },
                Cancel: function () {
                    $(this).dialog("close");
                }
            }
        });

        $moveWindow.dialog("open");

    },
    getSelectedReportIds: function () {
        var reportId = null;
        $('#reportTable tr').each(function () {
            if ($(this).hasClass('selected')) {
                if (reportId !== null) {
                    reportId = reportId
                            + ";"
                            + $(this).children('td').find('.chkReportColumn')
                            .attr('id');
                } else {
                    reportId = $(this).children('td').find('.chkReportColumn')
                            .attr('id');
                }
            }
        });

        return reportId;
    },
    downloadSelectedReports: function () {
        $("#SavedReportId_value").val(trackReports.getSelectedReportIds());
        $("#SavedDocId_value").val(docService.getSelectedDocIds());
        projectUtil.BlockUIonDownload('download_token_value');
        $("#ReportDownloadgForm").submit();
        return true;
    },
    configureEmailDialog: function () {
        var recipients = $("#txtRecipients"), subject = $("#txtSubject"), body = $("#txtBody"), allFields = $([])
                .add(recipients).add(subject).add(body);
        $("#emailDialog").dialog({
            title: 'Send Email',
            height: 520,
            width: 550,
            modal: true,
            autoOpen: false,
            resizable: false,
            close: function () {
                allFields.val("").removeClass("ui-state-error");
            },
            buttons: {
                "Send": function () {

                    var bValid = true;
                    allFields.removeClass("ui-state-error");
                    var email = "[A-Za-z0-9\._%-]+@[A-Za-z0-9\.-]+\.[A-Za-z]{2,4}";
                    var reg = new RegExp('^' + email + '(;\\n*' + email
                            + ')*;?$');

                    bValid = bValid && projectUtil.checkRegexp(recipients,
                            // /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i,
                            reg, "eg. f4tech@admin.com");

                    bValid = bValid
                            && projectUtil.checkLength(subject, "username", 1,
                                    500);

                    if (!bValid) {
                        return;
                    }

                    $.post($("#mailUrl").val(), {
                        savedReportsId: String(trackReports
                                .getSelectedReportIds()),
                        savedDocsId: String(docService
                                .getSelectedDocIds()),
                        subject: $("#txtSubject").val(),
                        recipients: $("#txtRecipients").val(),
                        mailBody: $("#txtBody").val()
                    }, function (data) {
                        $("#emailDialog").dialog("close");
                    });

                },
                Cancel: function () {
                    $(this).dialog("close");
                }
            }
        });
    },
    emailSelectedReports: function () {
        $("#emailDialog").dialog("open");
    },
    deleteSelectedReports: function () {
        var $deleteDialog = $("<div></div>").html('Are you sure about this?')
                .dialog({
                    autoOpen: false,
                    modal: true,
                    resizable: false,
                    title: 'Confirmation',
                    buttons: {
                        "Yes": function () {
                            var delUrl = $("#delSavedUrl").val();
                            $.ajax({
                                url: delUrl,
                                data: {
                                    savedReportId: String(trackReports
                                            .getSelectedReportIds()),
                                    savedDocsId: String(docService
                                            .getSelectedDocIds())
                                },
                                cache: false,
                                dataType: "html",
                                success: function (data) {
                                    $("#ProjectDetailsForm").submit();
                                    // location.reload();
                                }
                            });

                            $(this).dialog("close");
                        },
                        "No": function () {
                            $(this).dialog("close");
                        }
                    }
                });

        $deleteDialog.dialog("open");
    },
    configureRowDetailsDialog: function () {
        $("#rowDetailsDialog").dialog({
            modal: true,
            autoOpen: false,
            resizable: true,
            open: function (event, ui) {

                trackReportRowDetails.slickGrid.resizeCanvas();

            },
            close: function (event, ui) {
                // remove all previous validation
                trackReportRowDetails.slickGrid.invalidate();
            }
        });

    },
    showStrataAcres: function (dbId) {

        trackReportRowDetails.slickGrid = new Slick.Grid("#rowDetailsGrid", [],
                trackReportRowDetails.strataAcreas.columns,
                trackReportRowDetails.strataAcreas.options);

        trackReportRowDetails.slickGrid.onCellChange.subscribe(
                function (e, args) {
                    trackReportRowDetails.gridEvents.onCellChange.call(
                            trackReportRowDetails.strataAcreas, e, args);
                });
        trackReportRowDetails.slickGrid.onValidationError.subscribe(function (e,
                args) {
            trackReportRowDetails.gridEvents.onValidationError.call(
                    trackReportRowDetails.strataAcreas, e, args);
        });
        trackReportRowDetails.slickGrid.onDblClick.subscribe(function (e) {
            trackReportRowDetails.gridEvents.onDblClick.call(
                    trackReportRowDetails.strataAcreas, e);

        });

        trackReportRowDetails.strataAcreas.getData(dbId);
    },
    showPlotStratum: function (dbId) {

        trackReportRowDetails.slickGrid = new Slick.Grid("#rowDetailsGrid", [],
                trackReportRowDetails.plotStratum.columns,
                trackReportRowDetails.plotStratum.options);

        trackReportRowDetails.slickGrid.onDblClick.subscribe(function (e) {
            trackReportRowDetails.gridEvents.onDblClick.call(
                    trackReportRowDetails.plotStratum, e);
        });
        trackReportRowDetails.slickGrid.onCellChange.subscribe(
                function (e, args) {
                    trackReportRowDetails.gridEvents.onCellChange.call(
                            trackReportRowDetails.plotStratum, e, args);
                });
        trackReportRowDetails.plotStratum.getData(dbId);

    }

};

var rowDetailsGridUtil = {
    hasOwnProperty: Object.prototype.hasOwnProperty,
    is_empty: function (obj) {

        // null and undefined are empty
        if (obj === null)
            return true;
        // Assume if it has a length property with a non-zero value
        // that that property is correct.
        if (obj.length && obj.length > 0)
            return false;
        if (obj.length === 0)
            return true;

        for (var key in obj) {
            if (rowDetailsGridUtil.hasOwnProperty.call(obj, key))
                return false;
        }

        return true;
    },
    unique: function (origArr) {
        var newArr = [], origLen = origArr.length, found, x, y;
        for (x = 0; x < origLen; x++) {
            found = undefined;
            for (y = 0; y < newArr.length; y++) {
                if (origArr[x] === newArr[y]) {
                    found = true;
                    break;
                }
            }
            if (!found)
                newArr.push(origArr[x]);
        }
        return newArr;
    },
    requiredFieldValidator: function (value) {
        if (value === null || value === undefined || !value.length)
            return {
                valid: false,
                msg: "This is a required field"
            };
        else
            return {
                valid: true,
                msg: null
            };
    },
    numericValidator: function (value) {
        if (value === null || value === undefined || !value.length)
            return {
                valid: false,
                msg: "This is a required field"
            };
        else if (!/^\d+(\.\d{1,4})?$/.test(value))
            return {
                valid: false,
                msg: "Invalid input value"

            };
        else
            return {
                valid: true,
                msg: null
            };
    },
    numericRangeValidator: function (value) {
        if (value === null || value === undefined || !value.length)
            return {
                valid: false,
                msg: "This is a required field"
            };
        else if (!/^\d+$/.test(value))
            return {
                valid: false,
                msg: "Invalid input value"

            };
        else if (value < 0 || value > 999)
            return {
                valid: false,
                msg: "Value out of range"

            };
        else
            return {
                valid: true,
                msg: null
            };
    }
};
/**
 * This code show table info(strata acres, plot stratum etc) agains a database
 * from project details.
 */

var trackReportRowDetails = {
    slickGrid: null,
    strataAcreas: {
        url: $("#getStrataAcres").val(),
        data: [],
        changed: false,
        saving: false,
        valid: true,
        modifiedData: [],
        columns: [{
                id: "Stratum",
                name: "Stratum",
                field: "Stratum",
                width: 100,
                sortable: false
            }, {
                id: "Acres",
                name: "Acres",
                field: "Acres",
                width: 60,
                editor: Slick.Editors.Text,
                cssClass: "required",
                validator: rowDetailsGridUtil.numericValidator,
                sortable: false
            }, {
                id: "SiSiteIndex",
                name: "Site Index",
                field: "SiSiteIndex",
                width: 60,
                sortable: false,
                editor: Slick.Editors.Text,
                validator: rowDetailsGridUtil.numericRangeValidator
            }, {
                id: "SpeciesName",
                name: "Site Species",
                field: "SpeciesName",
                width: 150,
                editor: Slick.Editors.SelectCell,
                options: "a,b,c",
                sortable: false
            }, {
                id: "Location",
                name: "Site Location",
                field: "Location",
                width: 140,
                editor: Slick.Editors.SelectCell,
                options: "a,b,c",
                sortable: false
            }, {
                id: "Management",
                name: "Site Management",
                field: "Management",
                width: 100,
                editor: Slick.Editors.SelectCell,
                options: "Plant, Natural",
                sortable: false
            }, {
                id: "Variant",
                name: " Default Forest",
                field: "Variant",
                width: 120,
                editor: Slick.Editors.SelectCell,
                options: "a,b,c",
                sortable: false
                        // asyncPostRender : this.renderVariant
            }, {
                id: "VariantLocation",
                name: "Default Location",
                field: "VariantLocation",
                width: 150,
                editor: Slick.Editors.SelectCell,
                options: "a,b,c",
                sortable: false
            }],
        options: {
            enableCellNavigation: true,
            editable: true,
            enableAddRow: false,
            asyncEditorLoading: false,
            autoEdit: false,
            multiColumnSort: false

        },
        getData: function (dbId) {

            $.ajax({
                url: this.url,
                dataType: 'json',
                data: {
                    DbId: dbId
                },
                type: 'GET',
                cache: false,
                success: function (response) {
                    trackReportRowDetails.strataAcreas.setData.call(
                            trackReportRowDetails.strataAcreas,
                            response);
                }
            });
        },
        setData: function (response) {

            this.data = response;

            trackReportRowDetails.slickGrid.setData(this.data);
            trackReportRowDetails.strataAcreas.getDropDownData();
            // trackReportRowDetails.slickGrid.updateRowCount();
            // trackReportRowDetails.slickGrid.render();

            this.openDialog(response[0].DBName);

        },
        openDialog: function (dbName) {
            $("#rowDetailsDialog").dialog("option", "title",
                    "Strata Acares - " + dbName);
            $("#rowDetailsDialog").dialog("option", "height", 450);
            $("#rowDetailsDialog").dialog("option", "width", 900);
            $("#rowDetailsDialog").dialog("option", "buttons", [{
                    text: "Save",
                    click: function () {
                        trackReportRowDetails.slickGrid.getEditorLock()
                                .commitCurrentEdit();
                        trackReportRowDetails.strataAcreas.saveData();
                    }
                }]);
            $("#rowDetailsDialog").dialog('open');
        },
        getDropDownData: function () {

            $.ajax({
                url: $("#getAllStrataAcresSelectList").val(),
                dataType: 'json',
                data: '',
                type: 'GET',
                cache: false,
                async: true,
                success: function (response) {
                    trackReportRowDetails.strataAcreas.setDropDownData
                            .call(trackReportRowDetails.strataAcreas,
                                    response);
                },
                error: trackReportRowDetails.strataAcreas.onAjaxerror
            });

        },
        setDropDownData: function (data) {
            this.setSiteSpecies.call(this, data.SiteSpecies);
            this.setSiteLocation.call(this, data.SiteLocations);
            this.setDeafultForest.call(this, data.DefaultForests);
            this.setDeafultLocation.call(this, data.DefaultLocations);
            // $.unblockUI();
        },
        setSiteSpecies: function (data) {
            var speciesNames = [];
            speciesNames.push('');
            for (var i = 0; i < data.length; i++) {
                if (data[i].GrowthSpeciesName !== null) {
                    speciesNames.push(data[i].GrowthSpeciesName);
                }
            }
            this.columns[3].options = speciesNames.join(",");

        },
        setSiteLocation: function (data) {
            var Locations = [];
            Locations.push('');
            for (var i = 0; i < data.length; i++) {
                if (data[i].SiteLocationName !== null) {
                    if ($.inArray(data[i].SiteLocationName, Locations) === -1) {
                        Locations.push(data[i].SiteLocationName);
                    }
                }
            }
            this.columns[4].options = Locations.join(",");
        },
        setDeafultForest: function (data) {
            var forests = [];
            forests.push('');
            for (var i = 0; i < data.length; i++) {
                if (data[i].NationalForest !== null) {
                    if ($.inArray(data[i].NationalForest, forests) === -1) {
                        forests.push(data[i].NationalForest);
                    }
                }
            }
            this.columns[6].options = forests.join(",");
        },
        setDeafultLocation: function (data) {
            var locations = [];
            locations.push('');
            for (var i = 0; i < data.length; i++) {
                if (data[i].District !== null) {
                    if ($.inArray(data[i].District, locations) === -1) {
                        locations.push(data[i].District);
                    }
                }
            }
            this.columns[7].options = locations.join(",");
            // $.unblockUI();

        },
        onAjaxerror: function (request, status, error) {
            alert(request.responseText);
        },
        postVal: function ($url, $data) {
            $.ajax({
                url: $url,
                // dataType : 'html',
                data: $data,
                type: 'POST',
                cache: false,
                success: trackReportRowDetails.strataAcreas.savedData
            });
        },
        saveData: function () {
            debugger
            if (!this.valid) {
                this.valid = true;
                return false;
            }

            var data = rowDetailsGridUtil.unique(this.modifiedData);

            if (rowDetailsGridUtil.is_empty(data)) {
                alert("Please update some values to save");
                return false;
            }

            var canSave = true;
            this.saving = true;

            if (!canSave)
                return false;

            var json = {
                strataAcres: JSON.stringify(data)
            };

            this.postVal($("#updateStrataAcresUrl").val(), json);

        },
        savedData: function () {
            trackReportRowDetails.strataAcreas.saving = false;
            trackReportRowDetails.strataAcreas.changed = false;
            trackReportRowDetails.strataAcreas.modifiedData = [];

        }
    },
    plotStratum: {
        url: $("#getPlotStratum").val(),
        data: [],
        changed: false,
        saving: false,
        valid: true,
        modifiedData: [],
        columns: [{
                id: "PlotIndex",
                name: "Plot Index",
                field: "PlotIndex",
                width: 80,
                sortable: false
            }, {
                id: "PlotID",
                name: "Plot ID",
                field: "PlotID",
                width: 100,
                sortable: false
            }, {
                id: "Stratum",
                name: "Stratum",
                field: "Stratum",
                width: 200,
                editor: Slick.Editors.SelectCell,
                options: "",
                cssClass: "required",
                validator: rowDetailsGridUtil.requiredFieldValidator,
                sortable: false
            }],
        options: {
            enableCellNavigation: true,
            editable: true,
            enableAddRow: false,
            asyncEditorLoading: false,
            autoEdit: false,
            multiColumnSort: false

        },
        getData: function (dbId) {
            $.ajax({
                url: this.url,
                dataType: 'json',
                data: {
                    DbId: dbId
                },
                type: 'GET',
                cache: false,
                success: function (response) {
                    trackReportRowDetails.plotStratum.setData
                            .call(trackReportRowDetails.plotStratum,
                                    response);
                }
            });
        },
        setData: function (response) {

            this.data = response;

            trackReportRowDetails.slickGrid.setData(this.data);

            this.openDialog(response[0].DBName);

        },
        openDialog: function (dbName) {
            $("#rowDetailsDialog").dialog("option", "title",
                    "Plot Stratum - " + dbName);
            $("#rowDetailsDialog").dialog("option", "height", 350);
            $("#rowDetailsDialog").dialog("option", "width", 430);
            $("#rowDetailsDialog").dialog("option", "buttons", [{
                    text: "Save",
                    click: function () {
                        trackReportRowDetails.slickGrid.getEditorLock()
                                .commitCurrentEdit();
                        trackReportRowDetails.plotStratum.saveData();
                    }
                }]);
            $("#rowDetailsDialog").dialog('open');
        },
        saveData: function () {
            if (!this.valid) {
                this.valid = true;
                return false;
            }

            var data = rowDetailsGridUtil.unique(this.modifiedData);

            if (rowDetailsGridUtil.is_empty(data)) {
                alert("Please update some values to save");
                return false;
            }

            var canSave = true;
            this.saving = true;

            if (!canSave)
                return false;

            var json = {
                plotStratum: JSON.stringify(data)
            };

            this.postVal($("#savePlotsUrl").val(), json);

        },
        postVal: function ($url, $data) {
            $.ajax({
                url: $url,
                data: $data,
                type: 'POST',
                cache: false,
                success: function (result) {
                    trackReportRowDetails.plotStratum.savedData();
                }
            });
        },
        savedData: function () {
            trackReportRowDetails.plotStratum.saving = false;
            trackReportRowDetails.plotStratum.changed = false;
            trackReportRowDetails.plotStratum.modifiedData = [];

        }
    },
    gridEvents: {
        onCellChange: function (e, args) {
            // alert('called');
            var item = args.item;
            this.changed = true;
            this.modifiedData.push(item);
        },
        onDblClick: function (e) {
            this.changed = true;
            var cell = trackReportRowDetails.slickGrid.getCellFromEvent(e);

            if (trackReportRowDetails.slickGrid.getColumns()[cell.cell].id === "Stratum") {
                $.ajax({
                    url: $("#getPlotByDbId").val(),
                    dataType: 'json',
                    data: {
                        'dbName': this.data[cell.row].DBName
                    },
                    type: 'GET',
                    cache: false,
                    async: false,
                    success: function (data) {
                        var stratumOption = [];

                        for (var i = 0; i < data.length; i++) {
                            stratumOption.push(data[i].Stratum);
                        }

                        trackReportRowDetails.plotStratum.columns[2].options = stratumOption
                                .join(",");
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        alert(jqXHR);
                    }
                });

                trackReportRowDetails.slickGrid.updateRow(cell.row);
                e.stopPropagation();

            }
        },
        onValidationError: function (e, args) {
            alert(args.validationResults.msg);
            this.valid = false;
        }
    }
};

var docService = {
    init: function () {
        docService.configDocTable();
        docService.configUploder();
        $("#docAccordion").accordion({
            collapsible: true,
            heightStyle: "content",
            active: false
        });

        $('#docUploader_start').click(function (e) {
            docService.startUploading();
        });
        docService.loadActiveProject();
        docService.configMoveWindow();
        this.editVersion();
    },
    maxQue: 10,
    configUploder: function () {

        $("#docUploader").plupload({
            // General settings
            runtimes: 'html5,flash,silverlight,browserplus,gears',
            url: $("#saveDoc").val() + "?projectId="
                    + projectUtil.GetProjectId(),
            max_file_size: '1000000mb',
            max_file_count: docService.maxQue, // user can add
            // no more then
            // 20 files at a time

            unique_names: true,
            multiple_queues: true,
            // Resize images on clientside if we can
            resize: {
                width: 320,
                height: 240,
                quality: 90
            },
            // Rename files by clicking on their titles
            rename: true,
            // Sort files
            sortable: true,
            // Specify what files to browse for
            filters: [{
                    title: "All files",
                    extensions: "*"
                }],
            // Flash settings
            flash_swf_url: $("#pulploadSwf").val(),
            // Silverlight settings
            silverlight_xap_url: $("#pulploadXap").val(),
            /*
             * preinit : { FilesAdded : function(up, files) {
             * plupload.each(files, function(file) { // addRemoveFileToolTip();
             * console.log('[UploadFile]', 'files added' + file.name); }); },
             * QueueChanged : function(up) { addRemoveFileToolTip(); } },
             */
            init: {
                FilesAdded: function (up, files) {

                    var matchRows = [];
                    plupload.each(files, function (file) {

                        /*
                         * var unzipper = new JSUnzip(file); if
                         * (unzipper.isZipFile()) {
                         * unzipper.readEntries(); for (var i = 0; i <
                         * unzipper.entries.length; i++) { var entry =
                         * unzipper.entries[i]; alert(entry.fileName); } }
                         */
                        if ($('#cruisesTable tr:has(td:contains("'
                                + String(file.name) + '"))').length !== 0) {
                            matchRows.push(file);

                        }
                    });

                    if (matchRows.length > 0) {
                        var $promptForNo = $('<div></div>')
                                .html('Please rename the files to different unique names to load.')
                                .dialog({
                                    autoOpen: false,
                                    modal: true,
                                    resizable: false,
                                    title: 'Notice!',
                                    buttons: {
                                        "Ok": function () {
                                            $(this).dialog("close");
                                        }
                                    }
                                });
                        var $confirmDelete = $('<div></div>')
                                .html('Database is already loaded.Do you want to overwrite?')
                                .dialog({
                                    autoOpen: false,
                                    modal: true,
                                    resizable: false,
                                    title: 'Notice!',
                                    buttons: {
                                        "No": function () {
                                            jQuery.each(matchRows,
                                                    function () {
                                                        up
                                                                .removeFile(this);
                                                    });

                                            $(this).dialog("close");
                                            $promptForNo.dialog("open");
                                        },
                                        "Yes": function () {
                                            $(this).dialog("close");
                                            docService.startUploading();
                                        }
                                    }
                                });

                        $confirmDelete.dialog("open");
                    }
                }

            }
        });
    },
    startUploading: function () {
        var uploader = $('#docUploader').plupload('getUploader');
        $.blockUI({
            message: $('#domMessage'),
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

        // Files in queue upload them first
        if (uploader.files.length > 0) {
            // When all files are uploaded submit form
            uploader.bind('StateChanged', function () {
                if (uploader.files.length === (uploader.total.uploaded + uploader.total.failed)) {

                    $('#ProjectDetailsForm').submit();
                }
            });
            uploader.start();
        } else
            alert('You must at least upload one file.');
        return false;
    },
    configDocTable: function () {
        $('#documentTable').dataTable({
            "bPaginate": false,
            "bLengthChange": false,
            "bFilter": false,
            "bSort": true,
            "bInfo": false,
            // "sScrollY" : "300px",
            "sScrollX": "98%",
            "sScrollXInner": "99%",
            "bAutoWidth": true,
            "bScrollCollapse": true,
            "aoColumnDefs": [{
                    aTargets: [0],
                    sTitle: '<input type="checkbox" id="chkDocHeader"></input>'
                }, {
                    bSortable: false,
                    aTargets: [0, 5]
                }]
        });

        $('#chkDocHeader').click(function () {
            var isChecked = $('#chkDocHeader').attr('checked');
            $('#documentTable .chkDocColumn')
                    .attr('checked', isChecked);
            if (isChecked) {
                $('#documentTable tr').addClass('selected');
            } else {
                $('#documentTable tr').removeClass('selected');
            }
        });

        $('#documentTable tr .chkDocColumn').click(function () {
            $(this).closest('tr').toggleClass('selected');
        });

        $("#documentTable tbody td.moveDoc img").qtip({
            content: 'Move',
            show: 'mouseover',
            hide: 'mouseout',
            style: {
                name: 'cream',
                tip: 'bottomLeft',
                cursor: 'pointer'
            },
            position: {
                corner: {
                    target: 'topRight',
                    tooltip: 'bottomMiddle'
                }
            }
        });

    },
    configMoveWindow: function () {
        $("#docWindow").dialog({
            autoOpen: false,
            height: 300,
            width: 350,
            modal: true,
            buttons: {
                "Move": function () {
                    $.ajax({
                        url: $("#updateDocProject").val(),
                        dataType: 'html',
                        data: {
                            docId: $("#docId").val(),
                            ProjectId: $("#drpProjectList")
                                    .val()
                        },
                        type: 'POST',
                        cache: false,
                        success: function (result) {
                            $(this).dialog("close");
                            location.reload();
                        }
                    });

                },
                Cancel: function () {
                    $(this).dialog("close");
                }
            }
        });
        $('#documentTable tbody td.moveDoc img').live('click', function () {
            $("#docId").val(this.id);
            docService.openProjectMoveWin();
        });
    },
    openProjectMoveWin: function () {
        $("#docWindow").dialog("open");
    },
    loadActiveProject: function () {
        $.ajax({
            url: $("#getActiveProject").val(),
            dataType: 'json',
            data: '',
            type: 'GET',
            cache: false,
            success: function (result) {
                var options = $("#drpProjectList");
                // options.append($("<option />"));
                $.each(result, function () {
                    options.append($("<option />")
                            .val(this.ProjectId)
                            .text(this.Name));
                });
            }
        });
    },
    getSelectedDocIds: function () {
        var docId = null;
        $('#documentTable tr').each(function () {
            if ($(this).hasClass('selected')) {
                if (docId !== null) {
                    docId = docId
                            + ";"
                            + $(this).children('td').find('.chkDocColumn')
                            .attr('id');
                } else {
                    docId = $(this).children('td').find('.chkDocColumn')
                            .attr('id');
                }
            }
        });

        return docId;
    },
    editVersion: function () {

        $(".updateDocVersion").editable($("#updateDocService").val(), {
            indicator: "Saving...",
            event: "click",
            tooltip: "Click to Edit...",
            id: "DocId",
            name: "version",
            data: '{"Initial":"Initial","Draft":"Draft","Final":"Final","selected":"'
                    + $(this).val() + '"}',
            type: "select",
            placeholder: "",
            onblur: "cancel"

        }).click(function (evt) {

            $(this).find('select').keydown(function (event) {

                if (event.which === 9 || event.which === 13) // 'Enter'
                    $(this).closest('form').submit();
            });
        });

    }
};

var dbAggregator = {
    generateReport: function (projectId) {
        $("#ProjectId_value").val(projectId);
        projectUtil.BlockUIonDownload('AllReport_download_token_value');
        $("#AllReportDownloadForm").submit();
        return true;
    },
    grow: function (projectId) {
        var $growYears = $('<div></div>').dialog({
            autoOpen: false,
            modal: true,
            resizable: false,
            title: 'Growth and Volume',
            buttons: {
                "Continue": function () {

                    var growUrl = $("#projectGrowthAndVolume").val();
                    $.ajax({
                        url: growUrl,
                        data: {
                            projectId: projectId

                        },
                        cache: false,
                        dataType: "html",
                        success: function (data) {
                            var $dialog = $('<div></div>').html(data)
                                    .dialog({
                                        modal: true,
                                        autoOpen: true,
                                        resizable: false,
                                        title: 'Growth Running',
                                        buttons: {
                                            "Ok": function () {
                                                $(this).dialog("close");
                                            }
                                        }

                                    });

                        }
                    });

                    $(this).dialog("close");
                },
                "Cancel": function () {
                    $(this).dialog("close");
                    // $(this).dialog("destroy");
                }
            }
        });
        
        $.ajax({
            url: $("#growthVolumeUrl").val(),
            cache: false,
            dataType: "json",
            type: "GET",
            success: function (data) {
                var growthYear = !data.GrowthYear ? new Date()
                        .getFullYear() : data.GrowthYear;
                var message = !data.FortBragg
                        ? 'standard diameter growth model to '
                        + growthYear
                        : 'Fort Bragg diameter growth model to '
                        + growthYear;
                $growYears.html('Please click continue to grow '
                        + message);
                $growYears.dialog("open");
            }
        });
    }
};

$(function () {
    $(document).ajaxStart($.blockUI).ajaxStop($.unblockUI);
    $(document).ajaxError(function (e, jqxhr, settings, exception) {

        if (jqxhr.readyState === 0 || jqxhr.status === 0) {
            return false; // Skip this error 
        }
    });
    trackReports.init();
    docService.init();
    $("button,input[type=button]").button();

    $("#actionDiv").appendTo("#actionContainer");
    // $("#actionDiv").remove();

    $("#projectId").val(projectUtil.GetProjectId());

    $('#btnEdit').click(function () {
        // $("#frmEditProject").submit();
        document.location = $('#editUrl').val();
    });

    $('#btnDownloadAll').click(function () {
        if (trackReports.getSelectedReportIds() === null
                && docService.getSelectedDocIds() === null) {
            projectUtil
                    .alertDialog('Please select a report or document row before you perform this operation.')
                    .dialog("open");
            return false;
        }

        trackReports.downloadSelectedReports();

    });

    $('#btnEmailAll').click(function () {
        if (trackReports.getSelectedReportIds() === null
                && docService.getSelectedDocIds() === null) {
            projectUtil
                    .alertDialog('Please select a report or document row before you perform this operation.')
                    .dialog("open");
            return false;
        }

        trackReports.emailSelectedReports();

    });

    $('#btnDeleteAll').click(function () {
        if (trackReports.getSelectedReportIds() === null
                && docService.getSelectedDocIds() === null) {
            projectUtil
                    .alertDialog('Please select a report or document row before you perform Delete.')
                    .dialog("open");
            return false;
        }

        trackReports.deleteSelectedReports();

    });

    $("#btnDBReport").click(function () {
        var projectId = projectUtil.GetProjectId();
        dbAggregator.generateReport(projectId);
    });

    $("#btnDBGrow").click(function () {
        var projectId = projectUtil.GetProjectId();
        dbAggregator.grow(projectId);
    });

    $("#btnTests").click(function () {
        alert("clicked");
    });

    /*
     * projectUtil.$stickyActionOffsetTop = $("#actionDiv").offset().top;
     * projectUtil.$headerHeight = $("#header").height();
     * 
     * projectUtil.stickyActionDiv();
     * 
     * $(window).scroll(function() { projectUtil.stickyActionDiv(); });
     */
});