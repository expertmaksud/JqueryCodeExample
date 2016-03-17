function fileSelectedChanged(obj) {
    var filePath = obj.value;

    var ext = filePath.substring(filePath.lastIndexOf('.') + 1).toLowerCase();
    if (ext !== 'zip' && ext !== 'mdb') {
        alert('Only zip files with the file extension zip or mdb are allowed');
        // Clear file path
        // obj.value = ''; Not allowed due to security issues
        var form = document.getElementById("LoadDataForm");
        form.reset();
    }
}

$(function() {

    $("#tabs").tabs({
        selected: 0
    });

    $("input:submit,input:button").button();

    $(document).ajaxStart($.blockUI).ajaxStop($.unblockUI);

    var maxQue = 10;
    $("#uploader").plupload({
        // General settings
        runtimes: 'html5,flash,silverlight,browserplus,gears',
        url: $("#loadUrl").val() + '?projectId=0',
        max_file_size: '1000000mb',
        max_file_count: maxQue, // user can add no more then 20
        // files at a time

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
                title: "MDB/Zip files",
                extensions: "mdb,zip"
            }],
        // Flash settings
        flash_swf_url: $("#pulploadSwf").val(),
        // Silverlight settings
        silverlight_xap_url: $("#pulploadXap").val(),
        /*
         * preinit : { FilesAdded : function(up, files) { plupload.each(files,
         * function(file) { // addRemoveFileToolTip();
         * console.log('[UploadFile]', 'files added' + file.name); }); },
         * QueueChanged : function(up) { addRemoveFileToolTip(); }
         *  },
         */
        init: {
            FilesAdded: function(up, files) {

                var matchRows = [];
                plupload.each(files, function(file) {

                    /*
                     * var unzipper = new JSUnzip(file); if
                     * (unzipper.isZipFile()) { unzipper.readEntries();
                     * for (var i = 0; i < unzipper.entries.length; i++) {
                     * var entry = unzipper.entries[i];
                     * alert(entry.fileName); } }
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
                                    "Ok": function() {
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
                                    "No": function() {
                                        jQuery.each(matchRows,
                                                function() {
                                                    up.removeFile(this);
                                                });

                                        $(this).dialog("close");
                                        $promptForNo.dialog("open");
                                    },
                                    "Yes": function() {
                                        $(this).dialog("close");
                                        startUploading();
                                    }
                                }
                            });

                    $confirmDelete.dialog("open");
                }
            },
            QueueChanged: function(up) {
                // addRemoveFileToolTip();

            }

        }
    });

    // Client side form validation
    $('#uploader_start').click(function(e) {
        startUploading();
    });

    $('#uploader').plupload('getUploader').bind('FilesAdded',
            function(up, files) {

                // Check if the size of the queue is bigger than maxQue
                if (up.files.length > maxQue) {

                    // Removing the extra files
                    while (up.files.length > maxQue) {
                        if (up.files.length > maxQue)
                            uploader.removeFile(up.files[maxQue]);
                    }

                    alert("Max " + maxQue + " files can be uploaded.");

                }

            });

    $("#uploader_browse").qtip({
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

    $("#uploader_start").qtip({
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

    function addRemoveFileToolTip() {
        debugger
        $(".plupload_file_action .ui-icon-circle-minus").qtip({
            content: 'Remove File',
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
    }

    function startUploading() {
        var uploader = $('#uploader').plupload('getUploader');
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
            uploader.bind('StateChanged', function() {
                if (uploader.files.length === (uploader.total.uploaded + uploader.total.failed)) {

                    $('#LoadDataForm').submit();
                }
            });
            uploader.start();
        } else
            alert('You must at least upload one file.');
        return false;
    }

})
