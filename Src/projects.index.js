var projectDataView, projectGrid;

var projectIndexUtil = {
    projectNameFormatter: function(row, cell, value, columnDef, dataContext) {
        var securityToken = $('[name=__RequestVerificationToken]').val();
        var href = $("#projectDetailsUrl").val() + "/" + dataContext.ProjectId
                + "&__RequestVerificationToken="
                + encodeURIComponent(securityToken);
        return "<b><a id=" + dataContext.ProjectId + " href=#>"
                + dataContext.Name + "</a></b>";

    },
    checkBoxFormatter: function(row, cell, value, columnDef, dataContext) {
        try {
            var $chkbox;
            if (value === true)
                $chkbox = '<input type="checkbox" class="chkArchive" id="'
                        + dataContext.ProjectId + '" name="archive" checked/>';
            else
                $chkbox = '<input type="checkbox" class="chkArchive" id="'
                        + dataContext.ProjectId + '" name="archive" />';

            return $chkbox;

        } catch (e) {
            return '';
        }
    },
    deleteLinkFormater: function(row, cell, value, columnDef, dataContext) {
        var po = $('#ProjectsOnly').val();

        if (po != "True") {
            return '<div class="ahref" ><img style="cursor:pointer;" id="'
                    + dataContext["ProjectId"]
                    + '" src="Content/images/deletered24.png" alt="Delete"  /></img></div>';
        } else {
            return '<div></div>';
        }

    },
    gridFilter: function(item, args) {
        if (args.projectNameStr != ""
                && item["Name"].indexOf(args.projectNameStr) == -1) {
            return false;
        }

        if (args.assignToStr != ""
                && item["AssignedTo"].indexOf(args.assignToStr) == -1) {
            return false;
        }

        return true;
    }
};

var projectTable = {
    url: $("#getProjects").val(),
    data: [],
    columns: [{
            id: "Name",
            name: "Project Name",
            field: "Name",
            formatter: projectIndexUtil.projectNameFormatter,
            sortable: true,
            width: 200
        }, {
            id: "AssignedTo",
            name: "Assigned To",
            field: "PersonName",
            sortable: true,
            width: 250
        }, {
            id: "Description",
            name: "Description",
            field: "Description",
            sortable: true,
            width: 330
        }, {
            id: "Archived",
            name: "Archived",
            field: "Archived",
            formatter: projectIndexUtil.checkBoxFormatter,
            width: 80
        }, {
            id: "Delete",
            name: "",
            field: "ProjectId",
            formatter: projectIndexUtil.deleteLinkFormater,
            width: 40
        }],
    options: {
        enableCellNavigation: true,
        editable: false,
        enableAddRow: false,
        asyncEditorLoading: false,
        autoEdit: false,
        multiColumnSort: true

    },
    getData: function(tableConfig) {
        $.ajax({
            url: projectTable.url,
            dataType: 'json',
            data: {
                projectName: tableConfig.projectName,
                assignTo: tableConfig.assignTo,
                isArchive: tableConfig.isArchive
            },
            type: 'GET',
            cache: false,
            success: projectTable.setData
        });
    },
    setData: function(data) {

        projectTable.data = data;

        projectGrid.setData(projectTable.data);
        projectGrid.updateRowCount();
        projectGrid.render();

        // initialize the model after all the events have been hooked up
        /*
         * projectDataView.beginUpdate();
         * projectDataView.setItems(projectTable.data,'ProjectId');
         * projectDataView.setFilterArgs({ projectNameStr : "", assignToStr : ""
         * }); projectDataView.setFilter(projectUtil.gridFilter);
         * projectDataView.endUpdate(); projectDataView.refresh();
         * projectDataView.syncGridSelection(projectGrid, true);
         */
    },
    postVal: function($url, $data) {
        $.ajax({
            url: $url,
            dataType: 'html',
            data: $data,
            type: 'POST',
            cache: false,
            contentType: "application/json; charset=utf-8",
            success: function(result) {
                $("#btnArchive").trigger('click');
            }
        });
    },
    deleteRow: function(e, cell) {
        var po = $('#ProjectsOnly').val();

        if (po != "True") {
            var $confirmDelete = $('<div></div>').dialog({
                autoOpen: false,
                modal: true,
                resizable: false,
                title: 'Notice!',
                buttons: {
                    "Confirm": function() {
                        var delUrl = $("#projectDelUrl").val();
                        $.ajax({
                            url: delUrl,
                            type: "POST",
                            data: {
                                id: $(e.target).context.id
                            },
                            cache: false,
                            dataType: "html",
                            success: function(data) {
                                // location.reload();
                                var tableConfig = {
                                    isArchive: $('#btnArchive').val() == 'Show Archived'
                                            ? false
                                            : true,
                                    assignTo: $('#drpAssignTo').val(),
                                    projectName: projectIndex
                                            .getProjectNameFilterText()
                                };
                                projectTable.getData(tableConfig);
                            }
                        });

                        $(this).dialog("close");
                    },
                    "Cancel": function() {
                        $(this).dialog("close");
                    }
                }
            });

            $confirmDelete
                    .html('Are you sure you want to delete this project? All its reports and documents will be deleted also.');
            $confirmDelete.dialog("open");
        }
    },
    toggleArchive: function(e, cell) {
        var checkbox = $(e.target);
        var selectedData = projectTable.data[cell.row];

        if (checkbox.context.checked) {
            selectedData.Archived = true;
            $("#btnArchive").val('Show Active');

        } else {
            selectedData.Archived = false;
            $("#btnArchive").val('Show Archived');

        }

        var $url = $("#updateProject").val();

        projectTable.postVal($url, JSON.stringify(selectedData));

    }

};

var projectIndex = {
    waterMarkText: 'Type here to filter',
    init: function() {
        projectIndex.waterMarkInput();
        projectIndex.configureAutoComplete();
        projectIndex.loadUserInfo();
        /*
         * projectDataView = new Slick.Data.DataView({ inlineFilters : true });
         * projectGrid = new Slick.Grid("#projectGridDiv", projectDataView,
         * projectTable.columns, projectTable.options);
         * projectGrid.setSelectionModel(new Slick.RowSelectionModel());
         */
        projectGrid = new Slick.Grid("#projectGridDiv", [],
                projectTable.columns, projectTable.options);
        var tableConfig = {
            isArchive: false,
            assignTo: '',
            projectName: ''
        };
        projectTable.getData(tableConfig);
    },
    loadUserInfo: function() {
        $.ajax({
            url: $("#getUserInfo").val(),
            dataType: 'json',
            data: '',
            type: 'GET',
            cache: false,
            success: function(result) {
                var options = $("#drpAssignTo");
                options.append($("<option />"));
                $.each(result, function() {
                    options.append($("<option />")
                            .val(this.UserId)
                            .text(this.FirstName + ' '
                                    + this.LastName));
                });
            }
        });
    },
    waterMarkInput: function() {
        var watermark = projectIndex.waterMarkText;
        $('#txtFilter').blur(function() {
            if ($(this).val().length === 0)
                $(this).val(watermark).addClass('watermark');
        }).focus(function() {
            if ($(this).val() == watermark)
                $(this).val('').removeClass('watermark');
        }).val(watermark).addClass('watermark');
    },
    getProjectNameFilterText: function() {
        return $('#txtFilter').val() == projectIndex.waterMarkText
                ? ''
                : $('#txtFilter').val();
    },
    configureAutoComplete: function() {
        var cache = {}, assignTo, lastXhr;
        $("#txtFilter").autocomplete({
            minLength: 2,
            source: function(request, response) {
                var lastXhr, term = request.term;

                /*
                 * if (term in cache && assignTo in cache) {
                 * response(cache[term]); return; }
                 */

                lastXhr = $.getJSON($('#getProjectNames').val(), {
                    term: request.term,
                    assignTo: $('#drpAssignTo').val()
                }, function(data, status, xhr) {
                    // cache[term] = data;
                    // cache[assignTo]=
                    // $('#drpAssignTo').val();
                    if (xhr === lastXhr) {
                        response(data);
                    }
                });
            },
            select: function(event, ui) {
                var tableConfig = {
                    isArchive: $('#btnArchive').val() == 'Show Archived'
                            ? false
                            : true,
                    assignTo: $('#drpAssignTo').val(),
                    projectName: projectIndex.getProjectNameFilterText()
                };
                projectTable.getData(tableConfig);
            }
        });
    }
};

$(function() {
    $(document).ajaxStart($.blockUI).ajaxStop($.unblockUI);

    $("input[type=button]").button();

    projectIndex.init();

    $("#btnArchive").click(function() {

        if (this.value == 'Show Archived') {
            this.value = 'Show Active';
            projectTable.getData({
                isArchive: true,
                assignTo: $('#drpAssignTo').val(),
                projectName: projectIndex
                        .getProjectNameFilterText()
            });
        } else {
            this.value = 'Show Archived';
            projectTable.getData({
                isArchive: false,
                assignTo: $('#drpAssignTo').val(),
                projectName: projectIndex
                        .getProjectNameFilterText()
            });
        }

    });

    $("#drpAssignTo").change(function(e) {
        var tableConfig = {
            isArchive: $('#btnArchive').val() == 'Show Archived'
                    ? false
                    : true,
            assignTo: this.value,
            projectName: projectIndex.getProjectNameFilterText()
        };
        projectTable.getData(tableConfig);
    });

    $("#btnClearFilter").click(function() {
        location.reload();
    });

    projectGrid.onClick.subscribe(function(e) {
        var cell = projectGrid.getCellFromEvent(e);
        if (projectGrid.getColumns()[cell.cell].id == "Archived") {
            projectTable.toggleArchive(e, cell);
            projectGrid.updateRow(cell.row);

        } else if (projectGrid.getColumns()[cell.cell].id == "Delete") {
            projectTable.deleteRow(e, cell);
        } else if (projectGrid.getColumns()[cell.cell].id == "Name") {
            $("#hid_ProjectID").val($(e.target).context.id);
            $("#ProjectDetailsForm").submit();

        }

        e.stopPropagation();
    });

    projectGrid.onSort.subscribe(function(e, args) {
        var cols = args.sortCols;

        projectTable.data.sort(function(dataRow1, dataRow2) {
            for (var i = 0, l = cols.length; i < l; i++) {
                var field = cols[i].sortCol.field;
                var sign = cols[i].sortAsc ? 1 : -1;
                var value1 = dataRow1[field], value2 = dataRow2[field];
                var result = (value1 == value2 ? 0 : (value1 > value2 ? 1 : -1))
                        * sign;
                if (result !== 0) {
                    return result;
                }
            }
            return 0;
        });
        projectGrid.invalidate();
        projectGrid.render();
    });

});