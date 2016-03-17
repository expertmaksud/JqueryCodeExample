var thinningGrid;

thinningGridUtil = {
    deleteLinkFormater: function(row, cell, value, columnDef, dataContext) {
        return '<div class="ahref" ><img style="cursor:pointer;" id="'
                + dataContext["thinCount"]
                + '" src="Content/images/deletered24.png" alt="Delete"  /></img></div>';

    }
};

var thinningGridConf = {
    url: $("#getThinnins").val(),
    data: [],
    columns: [{
            id: "Thin",
            name: "Thin",
            field: "thin",
            width: 150
        }, {
            id: "ResidualVariable",
            name: "Residual Variable",
            field: "residualVariable",
            width: 150
        }, {
            id: "ThinTrigger",
            name: "Thin Trigger",
            field: "thinTrigger",
            width: 150
        }, {
            id: "ThinTriggerVal",
            name: "Thin Trigger Val",
            field: "thinTriggerVal",
            width: 150
        }, {
            id: "ThinResidualBA",
            name: "Thin Residual BA",
            field: "thinResidualBA",
            width: 150
        }, {
            id: "Delete",
            name: "",
            field: "thinCount",
            formatter: thinningGridUtil.deleteLinkFormater,
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
    getData: function() {
        $.ajax({
            url: this.url,
            dataType: 'json',
            type: 'GET',
            cache: false,
            success: this.setData
        });
    },
    refreshGrid: function() {
        thinningGrid.setData(thinningGridConf.data);

        for (var i = 0; i < thinningGridConf.data.length; i++) {
            // update index for delete/edit
            thinningGridConf.data[i].thinCount = i;
            thinningGrid.invalidateRow(i);
            // thinningGrid.updateRow(i);
        }

        //thinningGrid.updateRowCount();
        thinningGrid.invalidate();

        // thinningGrid.render();
    },
    setData: function(data) {

        thinningGridConf.data = data;

        thinningGridConf.refreshGrid();

    },
    addData: function() {

        var newData = growthandYieldService.serializeJson($("#ThinningForm"));
        //var newData = $("#ThinningForm").serialize();
        newData.thinCount = thinningGridConf.data.length;
        thinningGridConf.data.push(newData);
    },
    removeData: function(index) {
        thinningGridConf.data.splice(index, 1);
    }

};

var thinning = {
    init: function(settings) {
        thinning.config = {
            $tab: $("#settingTabs"),
            $saveUri: $("#saveThinningUri"),
            $slider: $("#thinningSlider"),
            $txtThinTrigger: $("#thinTriggerVal"),
            $thinSelect: $("#thin")
        };

        $.extend(thinning.config, settings);

        $(document).ajaxStart($.blockUI).ajaxStop($.unblockUI);

        this.populateGrid();

        this.populateUi();

    },
    save: function() {
        $.ajax({
            type: "POST",
            url: thinning.config.$saveUri.val(),
            data: $("#ThinningForm").serialize(),
            cache: false,
            dataType: "html",
            success: function(data) {
                thinning.config.$tab.tabs('option', 'selected', 2);
            }
        });
    },
    populateUi: function() {
        var thinningVal = this.config.$txtThinTrigger.val();

        this.config.$slider.slider({
            range: 'max',
            min: 0,
            max: 100,
            value: !thinningVal ? 0 : thinningVal,
            slide: function(event, ui) {
                thinning.config.$txtThinTrigger.val(ui.value);
            }

        });

        this.setSliderRange();

        this.config.$slider.slider("option", "value", !thinningVal
                ? 0
                : thinningVal);

        $("#thinTrigger").change(function() {
            thinning.setSliderRange();
        });

        this.showHideControl();

        this.config.$thinSelect.change(function() {
            thinning.showHideControl();
        });
    },
    populateGrid: function() {
        thinningGrid = new Slick.Grid("#thiningGridDiv", [],
                thinningGridConf.columns, thinningGridConf.options);

        thinningGridConf.getData();
    },
    setSliderRange: function() {

        var thinningTriggerVal = $("#thinTrigger").val();

        if (thinningTriggerVal === "Age" || thinningTriggerVal === "BBA") {
            thinning.config.$slider.slider("option", "min", 1);
            thinning.config.$slider.slider("option", "max", 999);

        } else if (thinningTriggerVal === "Year") {
            var today = new Date();
            var thisYear = today.getFullYear();
            thinning.config.$slider.slider("option", "min", thisYear);
            thinning.config.$slider.slider("option", "max", thisYear + 100);
        }

    },
    showHideControl: function() {
        if (thinning.config.$thinSelect.val() === "Row Thin") {
            $("#divResVriable").hide();
            $("#divResBA").hide();
            $("#divTakeOutRow").show();
        } else if (thinning.config.$thinSelect.val() === "Thin from Below and Row Thin") {
            $("#divResVriable").show();
            $("#divResBA").show();
            $("#divTakeOutRow").show();
        } else {

            $("#divResVriable").show();
            $("#divResBA").show();
            $("#divTakeOutRow").hide();
        }

    },
    addRowToGrid: function() {
        thinningGridConf.addData();
        thinningGridConf.refreshGrid();
    }
};

$(function() {
    thinning.init();

    /*
     * $("#btnThinning").click(function() { thinning.save(); });
     */

    $("#btnAddNewThin").click(function() {

        thinning.addRowToGrid();
    });

    thinningGrid.onClick.subscribe(function(e) {
        var cell = thinningGrid.getCellFromEvent(e);
        if (thinningGrid.getColumns()[cell.cell].id === "Delete") {
            var returnVal = confirm("Are you sure to remove this row from grid?");
            if (returnVal === true) {
                thinningGridConf.removeData(parseInt($(e.target).context.id));
                thinningGridConf.refreshGrid();
            }
        }
    });
});
