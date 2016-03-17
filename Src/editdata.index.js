/*******************************************************************************
 * Table edit code. To add another table to edit,
 */

        var grid;
var selectedTable = $("#tableSelect").val();
var saveReportClassUrl = $("#saveReportClassUrl").val();
var getJsonUrl = $("#getReportClassUrl").val();
var getGroupsToClassesUrl = $("#getGroupsToClassesUrl").val();
var saveGroupsToClassesUrl = $("#saveGroupsToClassesUrl").val();
var getStumpageUrl = $("#getStumpageUrl").val();
var saveStumpageUrl = $("#saveStumpageUrl").val();
var exportCSVUrl = $("#exportCSVUrl").val();
var getSpeciesUrl = $("#getSpeciesUrl").val();
var getGrowthSpeciesUrl = $("#getGrowthSpeciesUrl").val();
var saveSpeciesUrl = $("#saveSpeciesUrl").val();
var getMyReportsUrl = $("#getMyReportsUrl").val();
var saveMyReportsUrl = $("#saveMyReportsUrl").val();
var getStrataAcresUrl = $("#getStrataAcresUrl").val();
var saveStrataAcresUrl = $("#saveStrataAcresUrl").val();
var getPlotStratumsUrl = $("#getPlotStratumsUrl").val();
var getStratumsByDbId = $("#getStratumsByDbId").val();
var savePlotStratumsUrl = $("#savePlotStratumsUrl").val();
var getCustomReportTypesUrl = $("#getCustomReportTypesUrl").val();
var activateInactiveReportUrl = $("#activateInactiveReportUrl").val();
var getSpeciesMappingNamesUrl = $("#getSpeciesMappingNamesUrl").val();
var getSiteLocationUrl = $("#getSiteLocationUrl").val();
var getDeafultForestUrl = $("#getDefaultForestUrl").val();
var getDeafultLocationUrl = $("#getDefaultLocationUrl").val();
var getAllSelectListData = $("#getAllSelectListData").val();

var editDataUtil = {
    // Speed up calls to hasOwnProperty
    hasOwnProperty: Object.prototype.hasOwnProperty,
    is_empty: function(obj) {

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
            if (editDataUtil.hasOwnProperty.call(obj, key))
                return false;
        }

        return true;
    },
    unique: function(origArr) {
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
    requiredFieldValidator: function(value) {
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
    numericValidator: function(value) {
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
    numericRangeValidator: function(value) {
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
    },
    confirmExit: function() {
        if (tables[selectedTable].changed) {
            return "You have attempted to leave this page. If you have made any changes to the fields without clicking the Save button, your changes will be lost. Are you sure you want to exit this page?";
        }
    },
    activeButtonFormatter: function(row, cell, value, columnDef, dataContext) {
        try {
            /*
             * if (value == null || value == undefined || !value.length) {
             * return ; }
             */
            if (value === true)
                return '<button style="width:75px;" type="button" > <span>Active</span> </button>';
            else
                return '<button style="width:75px;" type="button" > <span>Inactive</span> </button>';

            // return '<input type="button" name="Active"
            // style="height:100%;width:100%;">';
        } catch (e) {
            return '';
        }
    },
    deleteLinkFormater: function(row, cell, value, columnDef, dataContext) {

        return '<div class="ahref" ><img style="cursor:pointer;" src="Content/images/deletered24.png" alt="Delete"  /></img></div>';

    }
};

var tables = {
    reportClasses: {
        columns: [{
                id: "ClassName",
                name: "Class Name",
                field: "ClassName",
                editor: Slick.Editors.Text,
                width: 95,
                sortable: true
            }, {
                id: "Delete",
                name: "",
                field: "ClassIndex",
                formatter: editDataUtil.deleteLinkFormater,
                width: 40
            }],
        contextMenu: function(e) {
            e.preventDefault();
            var cell = grid.getCellFromEvent(e);
            $("#contextMenu").data("row", cell.row).css("top", e.pageY).css(
                    "left", e.pageX).show();
            $("body").one("click", function() {
                $("#contextMenu").hide();
            });
        },
        options: {
            enableCellNavigation: true,
            editable: true,
            enableAddRow: true,
            asyncEditorLoading: false,
            autoEdit: false,
            multiColumnSort: true
        },
        saveData: function() {
            tables.reportClasses.saving = true;
            json = {
                reportClasses: JSON.stringify(editDataUtil
                        .unique(tables.reportClasses.modifiedData))
            };
            $.ajax({
                url: saveReportClassUrl,
                data: json,
                type: 'POST',
                success: tables.reportClasses.savedData
            });
        },
        savedData: function(e, args) {
            tables.reportClasses.saving = false;
            tables.reportClasses.changed = false;
            tables.reportClasses.modifiedData = [];
            $('#tableSelect').trigger('change');
        },
        url: getJsonUrl,
        param: '',
        data: [],
        modifiedData: [],
        newTableSetup: function() {
        },
        changed: false,
        setDataView: function(dataView, data) {
            dataView.beginUpdate();
            dataView.setItems(data);
            dataView.endUpdate();
            dataView.refresh();
        },
        setUtil: function() {

        }
    },
    groupsToClasses: {
        columns: [{
                id: "GroupName",
                name: "Group Name",
                field: "GroupName",
                cssClass: "groupnametip",
                width: 100,
                sortable: true
            }, {
                id: "ClassName",
                name: "Class Name",
                field: "ClassName",
                width: 100,
                editor: Slick.Editors.SelectCell,
                options: "a,b,c",
                sortable: true
            }],
        url: getGroupsToClassesUrl,
        param: '',
        data: [],
        changed: false,
        modifiedData: [],
        newTableSetup: function() {
            if (tables.reportClasses.changed) {
                $.ajax({
                    url: tables.reportClasses.url,
                    dataType: 'json',
                    data: '',
                    type: 'GET',
                    cache: false,
                    async: false,
                    success: tables.groupsToClasses.setSelectList
                });
            } else {
                tables.groupsToClasses.setSelectList(tables.reportClasses.data);
            }

        },
        options: {
            enableCellNavigation: true,
            editable: true,
            enableAddRow: false,
            asyncEditorLoading: false,
            autoEdit: false,
            multiColumnSort: true
        },
        setSelectList: function(data) {
            var rcData = tables.reportClasses.data;
            rcData = data;
            tables.reportClasses.changed = false;
            var classNames = [];
            var temp = {};
            for (var i = 0; i < rcData.length; i++) {
                temp[rcData[i].ClassName] = 0;
            }
            for (i in temp) {
                classNames.push(i);
            }
            tables.groupsToClasses.columns[1].options = classNames.join(",");
        },
        saveData: function() {
            tables.groupsToClasses.saving = true;
            json = {
                groupToClasses: JSON.stringify(editDataUtil
                        .unique(tables.groupsToClasses.modifiedData))
            };
            $.ajax({
                url: saveGroupsToClassesUrl,
                data: json,
                type: 'POST',
                success: tables.groupsToClasses.savedData
            });
        },
        savedData: function(e, args) {
            tables.groupsToClasses.changed = false;
            tables.groupsToClasses.modifiedData = [];
        },
        setDataView: function(dataView, data) {
            dataView.beginUpdate();
            dataView.setItems(data);
            dataView.endUpdate();
            dataView.refresh();
        },
        setUtil: function() {
            $('.groupnametip').qtip({
                content: 'Species groups from data',
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
        }
    },
    stumpageValues: {
        columns: [{
                id: "GroupName",
                name: "Group Name",
                field: "GroupName",
                sortable: true,
                width: 100
            }, {
                id: "ProductName",
                name: "Product Name",
                field: "ProductName",
                sortable: true,
                width: 100
            }, {
                id: "ProdNumb",
                name: "Product Number",
                field: "ProdNumb",
                width: 120,
                sortable: true
            }, {
                id: "PricePerUnit",
                name: "Price/Unit",
                field: "PricePerUnit",
                // formatter : Slick.Formatters.YesNo,
                editor: Slick.Editors.Text,
                sortable: true,
                validator: function(value) {
                    var RE = /^\d*\.?\d*$/;
                    if (!RE.test(value)) {
                        return {
                            valid: false,
                            msg: "Value is not valid"
                        };
                    } else {
                        return {
                            valid: true,
                            msg: null
                        };
                    }
                }
            }, {
                id: "Unit",
                name: "Unit",
                field: "Unit",
                dependency: "ProdNumb",
                width: 125,
                editor: Slick.Editors.SelectCell,
                options: "tons,cords,cfib,cfob,cunits",
                sortable: true
            }],
        url: getStumpageUrl,
        param: '',
        changed: false,
        saving: false,
        data: [],
        modifiedData: [],
        options: {
            enableCellNavigation: true,
            editable: true,
            enableAddRow: false,
            asyncEditorLoading: false,
            autoEdit: false,
            multiColumnSort: true
                    /*
                     * , enableAsyncPostRender : true, asyncPostRenderDelay : 50
                     */
        },
        numericFieldValidator: function(value) {
            if (!$.isNumeric(value)) {
                return {
                    valid: false,
                    msg: "Value is not valid"
                };
            } else {
                return {
                    valid: true,
                    msg: null
                };
            }
        },
        numberFormatter: function(row, cell, value, columnDef, dataContext) {
            var replacedVal = parseFloat(value.replace(',', '.'));
            try {
                if (replacedVal < 0)
                    return '<font color="red">' + value + '</font>';
                else if (replacedVal > 0)
                    return '<font color="green">' + value + '</font>';
                else
                    return '<font color="blue">' + value + '</font>';
            } catch (e) {
                return '';
            }
        },
        newTableSetup: function() {
            tables.stumpageValues.setSelectList(tables.stumpageValues.data);
        },
        setSelectList: function(data) {

        },
        saveData: function() {
            tables.stumpageValues.saving = true;
            json = {
                stumpageValues: JSON.stringify(editDataUtil
                        .unique(tables.stumpageValues.modifiedData))
            };
            $.ajax({
                url: saveStumpageUrl,
                data: json,
                type: 'POST',
                success: tables.stumpageValues.savedData
            });
        },
        savedData: function(e, args) {
            tables.stumpageValues.saving = false;
            tables.stumpageValues.changed = false;
            tables.stumpageValues.modifiedData = [];
        },
        setDataView: function(dataView, data) {

            dataView.beginUpdate();
            dataView.setItems(data);
            dataView.endUpdate();
            dataView.refresh();

            dataView.getItemMetadata = function(row) {

                if (data[row] !== undefined) {
                    if (data[row].Unit !== null) {

                        var prodNum = data[row].ProdNumb;
                        if (prodNum <= 1) {
                            return {
                                'cssClasses': 'parentClassName'
                            };
                        }
                    }
                }
            };

        },
        renderUnit: function(cellNode, row, dataContext, colDef) {

            var context = dataContext;
        },
        setUtil: function() {

        }

    },
    speciesMapping: {
        url: getSpeciesUrl,
        param: {'variantCode': $("#variantSelect").val()},
        data: [],
        changed: false,
        saving: false,
        modifiedData: [],
        columns: [{
                id: "SpeciesName",
                name: "Species Name",
                field: "SpeciesName",
                width: 120,
                editor: Slick.Editors.Text,
                cssClass: "speciestip",
                sortable: true

            }, {
                id: "GrowthSpeciesName",
                name: "Growth Species",
                field: "GrowthSpeciesName",
                width: 160,
                editor: Slick.Editors.SelectCell,
                options: "a,b,c",
                sortable: true
            }],
        options: {
            enableCellNavigation: true,
            editable: true,
            enableAddRow: true,
            asyncEditorLoading: false,
            autoEdit: false,
            multiColumnSort: true
        },
        newTableSetup: function() {

            $.ajax({
                url: getGrowthSpeciesUrl,
                dataType: 'json',
                data: '',
                type: 'GET',
                cache: false,
                async: false,
                success: tables.speciesMapping.setSelectList
            });
        },
        setSelectList: function(data) {
            var rcData = data;
            var growthSpeciesName = [];
            var temp = {};
            for (var i = 0; i < rcData.length; i++) {
                temp[rcData[i].GrowthSpeciesName] = 0;
            }
            for (i in temp) {
                growthSpeciesName.push(i);
            }
            tables.speciesMapping.columns[1].options = growthSpeciesName
                    .join(",");
        },
        saveData: function() {
            tables.speciesMapping.saving = true;
            json = {
                speciesMappings: JSON.stringify(editDataUtil
                        .unique(tables.speciesMapping.modifiedData))
            };
            $.ajax({
                url: saveSpeciesUrl,
                data: json,
                type: 'POST',
                success: tables.speciesMapping.savedData
            });
        },
        savedData: function(e, args) {
            tables.speciesMapping.saving = false;
            tables.speciesMapping.changed = false;
            tables.speciesMapping.modifiedData = [];
        },
        setUtil: function() {

            $('.speciestip').qtip({
                content: 'Species name from data',
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
        }
    },
    myReports: {
        url: getMyReportsUrl,
        param: '',
        data: [],
        changed: false,
        saving: false,
        valid: true,
        modifiedData: [],
        columns: [{
                id: "ReportType",
                name: "Report Type",
                field: "ReportType",
                width: 115,
                editor: Slick.Editors.SelectCell,
                options: "Summary",
                validator: editDataUtil.requiredFieldValidator,
                sortable: true

            }, {
                id: "ReportName",
                name: "Report Name",
                field: "ReportName",
                width: 95,
                editor: Slick.Editors.Text,
                cssClass: "required",
                validator: editDataUtil.requiredFieldValidator,
                sortable: true
            }, {
                id: "Title",
                name: "Title",
                field: "Title",
                width: 80,
                editor: Slick.Editors.Text,
                cssClass: "required",
                validator: editDataUtil.requiredFieldValidator,
                sortable: true
            }, {
                id: "ReportLevel",
                name: "Report Level",
                field: "ReportLevel",
                width: 80,
                editor: Slick.Editors.SelectCell,
                options: "Tract,Strata",
                validator: editDataUtil.requiredFieldValidator,
                sortable: true
            }, {
                id: "Orientation",
                name: "Orientation",
                field: "Orientation",
                width: 80,
                editor: Slick.Editors.SelectCell,
                options: "Portrait,Landscape",
                validator: editDataUtil.requiredFieldValidator,
                sortable: true
            }, {
                id: "GroupingLevels",
                name: "Grouping Levels",
                field: "GroupingLevels",
                width: 220,
                editor: Slick.Editors.MultiSelectCell,
                options: "Tree Category1,Tree Category 2,Species Class,Species Group,Species Name,Product",
                sortable: true
            }, {
                id: "DBHClass",
                name: "DBH Class",
                field: "DBHClass",
                width: 65,
                editor: Slick.Editors.SelectCell,
                options: "1 inch,2 inch,none",
                sortable: true
            }, {
                id: "VolumeUnit1",
                name: "Volume Unit1",
                field: "VolumeUnit1",
                width: 85,
                editor: Slick.Editors.SelectCell,
                options: "Tons,Cords,CFIB,CFOB,Cunits,Doyle,International,Scribner",
                sortable: true
            }, {
                id: "VolumeUnit2",
                name: "Volume Unit2",
                field: "VolumeUnit2",
                width: 85,
                editor: Slick.Editors.SelectCell,
                options: "Tons,Cords,CFIB,CFOB,Cunits,Doyle,International,Scribner,None",
                sortable: true
            }, {
                id: "VolumeUnit3",
                name: "Volume Unit3",
                field: "VolumeUnit3",
                width: 85,
                editor: Slick.Editors.SelectCell,
                options: "Tons,Cords,CFIB,CFOB,Cunits,Doyle,International,Scribner,None",
                cssClass: "volumeunit3tip",
                sortable: true
            }, {
                id: "AvailableTo",
                name: "Available To",
                field: "AvailableTo",
                width: 80,
                editor: Slick.Editors.SelectCell,
                options: "Personal, Company",
                sortable: true
            }, {
                id: "Active",
                name: "Active",
                field: "IsActive",
                width: 80,
                formatter: editDataUtil.activeButtonFormatter
            }, {
                id: "Delete",
                name: "",
                field: "Id",
                formatter: editDataUtil.deleteLinkFormater,
                width: 40
            }],
        options: {
            enableCellNavigation: true,
            editable: true,
            enableAddRow: true,
            asyncEditorLoading: false,
            autoEdit: false,
            multiColumnSort: true
        },
        requireFields: ['ReportType', 'ReportName', 'ReportLevel',
            'Orientation', 'GroupingLevels', 'DBHClass', 'VolumeUnit1',
            'VolumeUnit2', 'AvailableTo'],
        newTableSetup: function() {
            $.ajax({
                url: getCustomReportTypesUrl,
                dataType: 'json',
                data: '',
                type: 'GET',
                cache: false,
                async: false,
                success: tables.myReports.setSelectList
            });
        },
        setSelectList: function(data) {

            var reportNames = [];
            for (var i = 0; i < data.length; i++) {
                reportNames.push(data[i].Name);

            }
            tables.myReports.columns[0].options = reportNames.join(",");
        },
        saveData: function() {

            if (!tables.myReports.valid) {
                tables.myReports.valid = true;
                return false;
            }

            var data = editDataUtil.unique(tables.myReports.modifiedData);

            if (editDataUtil.is_empty(data)) {
                alert("Please add a new row or update some values to save");
                return false;
            }

            var canSave = true;
            tables.myReports.saving = true;

            $.each(data, function(idx, obj) {
                // Fix For IE <9
                if (!Object.keys) {
                    Object.keys = function(obj) {
                        var keys = [];

                        for (var i in obj) {
                            if (obj.hasOwnProperty(i)) {
                                keys.push(i);
                            }
                        }

                        return keys;
                    };
                }
                var returnField = Object.keys(obj);
                if (obj.Orientation) {
                    if (obj.Orientation === 'Landscape') {
                        if ($.inArray('VolumeUnit3',
                                tables.myReports.requireFields) === -1) {
                            tables.myReports.requireFields
                                    .push('VolumeUnit3');
                        }
                    }
                    if (obj.Orientation === 'Portrait') {
                        if ($.inArray('VolumeUnit3',
                                tables.myReports.requireFields) !== -1) {
                            tables.myReports.requireFields
                                    .pop('VolumeUnit3');
                        }
                    }
                }
                var fieldLength = tables.myReports.requireFields.length;

                for (var i = 0; i < fieldLength; i++) {
                    var atpos = $.inArray(
                            tables.myReports.requireFields[i],
                            returnField);
                    if (atpos < 0
                            || obj[tables.myReports.requireFields[i]] === null) {
                        alert("Report cannot be saved. Missing input "
                                + tables.myReports.requireFields[i]);
                        canSave = false;
                        return false;
                    }
                }

            });

            if (!canSave)
                return false;

            var json = {
                myReports: JSON.stringify(data)
            };
            $.ajax({
                url: saveMyReportsUrl,
                data: json,
                type: 'POST',
                success: tables.myReports.savedData
            });
        },
        savedData: function(e, args) {
            tables.myReports.saving = false;
            tables.myReports.changed = false;
            tables.myReports.modifiedData = [];
            $('#tableSelect').trigger('change');
        },
        setUtil: function() {
            $('.volumeunit3tip').qtip({
                content: 'Only applies to landscape orientation',
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

        }

    },
    strataAcres: {
        url: getStrataAcresUrl,
        param: '',
        data: [],
        changed: false,
        saving: false,
        valid: true,
        modifiedData: [],
        columns: [{
                id: "DBName",
                name: "DB Name",
                field: "DBName",
                width: 200,
                sortable: true
            }, {
                id: "Stratum",
                name: "Stratum",
                field: "Stratum",
                width: 95,
                sortable: true
            }, {
                id: "Acres",
                name: "Acres",
                field: "Acres",
                width: 75,
                editor: Slick.Editors.Text,
                cssClass: "required",
                validator: editDataUtil.numericValidator,
                sortable: true
            }, {
                id: "SiSiteIndex",
                name: "Site Index",
                field: "SiSiteIndex",
                width: 95,
                sortable: true,
                editor: Slick.Editors.Text,
                validator: editDataUtil.numericRangeValidator
            }, {
                id: "SpeciesName",
                name: "Site Species",
                field: "SpeciesName",
                width: 140,
                editor: Slick.Editors.SelectCell,
                options: "a,b,c",
                sortable: true
            }, {
                id: "Location",
                name: "Site Location",
                field: "Location",
                width: 100,
                editor: Slick.Editors.SelectCell,
                // options: "a,b,c",
                sortable: true
            }, {
                id: "Management",
                name: "Site Management",
                field: "Management",
                width: 100,
                editor: Slick.Editors.SelectCell,
                options: "Plant, Natural",
                sortable: true
            }, {
                id: "Variant",
                name: " Default Forest",
                field: "Variant",
                width: 155,
                editor: Slick.Editors.SelectCell,
                options: "a,b,c",
                sortable: true
                        // asyncPostRender : this.renderVariant
            }, {
                id: "VariantLocation",
                name: "Default Location",
                field: "VariantLocation",
                width: 155,
                editor: Slick.Editors.SelectCell,
                options: "a,b,c",
                sortable: true
            }],
        options: {
            enableCellNavigation: true,
            editable: true,
            enableAddRow: false,
            asyncEditorLoading: false,
            autoEdit: false,
            multiColumnSort: true,
            enableAsyncPostRender: true
        },
        newTableSetup: function() {

            $.ajax({
                url: getAllSelectListData,
                dataType: 'json',
                data: '',
                type: 'GET',
                cache: false,
                async: true,
                success: tables.strataAcres.setDropDownData,
                error: tables.strataAcres.onAjaxerror
            });

        },
        saveData: function() {

            if (!tables.strataAcres.valid) {
                tables.strataAcres.valid = true;
                return false;
            }

            var data = editDataUtil.unique(tables.strataAcres.modifiedData);

            if (editDataUtil.is_empty(data)) {
                alert("Please update some values to save");
                return false;
            }

            var canSave = true;
            tables.strataAcres.saving = true;

            if (!canSave)
                return false;

            json = {
                strataAcres: JSON.stringify(data)
            };
            $.ajax({
                url: saveStrataAcresUrl,
                data: json,
                type: 'POST',
                success: tables.strataAcres.savedData
            });
        },
        savedData: function(e, args) {
            tables.strataAcres.saving = false;
            tables.strataAcres.changed = false;
            tables.strataAcres.modifiedData = [];
            // $('#tableSelect').trigger('change');
        },
        setDropDownData: function(data) {
            tables.strataAcres.setSiteSpecies(data.SiteSpecies);
            tables.strataAcres.setSiteLocation(data.SiteLocations);
            tables.strataAcres.setDeafultForest(data.DefaultForests);
            tables.strataAcres.setDeafultLocation(data.DefaultLocations);
            // $.unblockUI();
        },
        setSiteSpecies: function(data) {
            var speciesNames = [];
            speciesNames.push('');
            for (var i = 0; i < data.length; i++) {
                if (data[i].GrowthSpeciesName !== null) {
                    speciesNames.push(data[i].GrowthSpeciesName);
                }
            }
            tables.strataAcres.columns[4].options = speciesNames.join(",");

        },
        setSiteLocation: function(data) {
            var Locations = [];
            Locations.push('');
            for (var i = 0; i < data.length; i++) {
                if (data[i].SiteLocationName !== null) {
                    if ($.inArray(data[i].SiteLocationName, Locations) === -1) {
                        Locations.push(data[i].SiteLocationName);
                    }
                }
            }
            tables.strataAcres.columns[5].options = Locations.join(",");
        },
        setDeafultForest: function(data) {
            var forests = [];
            forests.push('');
            for (var i = 0; i < data.length; i++) {
                if (data[i].NationalForest !== null) {
                    if ($.inArray(data[i].NationalForest, forests) === -1) {
                        forests.push(data[i].NationalForest);
                    }
                }
            }
            tables.strataAcres.columns[7].options = forests.join(",");
        },
        setDeafultLocation: function(data) {
            var locations = [];
            locations.push('');
            for (var i = 0; i < data.length; i++) {
                if (data[i].District !== null) {
                    if ($.inArray(data[i].District, locations) === -1) {
                        locations.push(data[i].District);
                    }
                }
            }
            tables.strataAcres.columns[8].options = locations.join(",");
            // $.unblockUI();

        },
        onAjaxerror: function(request, status, error) {
            alert(request.responseText);
        },
        setUtil: function() {
            return;
        },
        renderVariant: function(cellNode, row, dataContext, colDef) {
            alert(row);
        }

    },
    plotStratum: {
        url: getPlotStratumsUrl,
        param: '',
        data: [],
        changed: false,
        saving: false,
        valid: true,
        modifiedData: [],
        columns: [{
                id: "DBName",
                name: "DataBase Name",
                field: "DBName",
                width: 200,
                sortable: true
            }, {
                id: "PlotIndex",
                name: "Plot Index",
                field: "PlotIndex",
                width: 95,
                sortable: true
            }, {
                id: "PlotID",
                name: "Plot ID",
                field: "PlotID",
                width: 95,
                sortable: true
            }, {
                id: "Stratum",
                name: "Stratum",
                field: "Stratum",
                width: 95,
                editor: Slick.Editors.SelectCell,
                options: "",
                cssClass: "required",
                validator: editDataUtil.requiredFieldValidator,
                sortable: true
            }],
        options: {
            enableCellNavigation: true,
            editable: true,
            enableAddRow: false,
            asyncEditorLoading: false,
            autoEdit: false,
            multiColumnSort: true
        },
        newTableSetup: function() {
            return;
        },
        saveData: function() {

            if (!tables.plotStratum.valid) {
                tables.plotStratum.valid = true;
                return false;
            }

            var data = editDataUtil.unique(tables.plotStratum.modifiedData);

            if (editDataUtil.is_empty(data)) {
                alert("Please update some values to save");
                return false;
            }

            var canSave = true;
            tables.plotStratum.saving = true;

            if (!canSave)
                return false;

            json = {
                plotStratum: JSON.stringify(data)
            };
            $.ajax({
                url: savePlotStratumsUrl,
                data: json,
                type: 'POST',
                success: tables.plotStratum.savedData
            });
        },
        savedData: function(e, args) {
            tables.plotStratum.saving = false;
            tables.plotStratum.changed = false;
            tables.plotStratum.modifiedData = [];
            // $('#tableSelect').trigger('change');
        },
        setUtil: function() {
            return;
        }
    }
};

var slickGrid = {
    $selectedTable: $("#tableSelect"),
    onAddNewRow: function(e, args) {
        tables[this.$selectedTable.val()].changed = true;
        var item = args.item;
        item.CompanyID = parseInt($("#companyId").val());

        grid.invalidateRow(tables[this.$selectedTable.val()].data.length);

        tables[this.$selectedTable.val()].data.push(item);
        tables[this.$selectedTable.val()].modifiedData.push(item);
        // validateRow(args.grid, args.grid.getActiveCell().row);
        grid.updateRowCount();

        grid.render();

    },
    onClick: function(e) {

        var cell = grid.getCellFromEvent(e);
        if (this.$selectedTable.val() === 'myReports') {

            if (grid.getColumns()[cell.cell].id === "Active") {
                if (tables.myReports.changed) {
                    alert("Please save unsaved data before perform this operation.");
                    return fales;
                }
                var json = {
                    myReport: JSON.stringify(tables.myReports.data[cell.row])
                };
                $.ajax({
                    url: activateInactiveReportUrl,
                    dataType: 'json',
                    data: json,
                    type: 'POST',
                    async: false,
                    success: function(data, textStatus, jqXHR) {

                        tables.myReports.data[cell.row]
                                ? tables.myReports.data[cell.row] = false
                                : tables.myReports.data[cell.row] = true;
                        // $('#tableSelect').trigger('change');
                        // $("#settingTabs").tabs('load', 0);
                        grid.updateRow(cell.row);

                    }
                });

                $('#tableSelect').trigger('change');
                e.stopPropagation();
            } else if (grid.getColumns()[cell.cell].id === "Delete") {
                DeleteReport.MyReport(cell.row);

            } else {
                return false;
            }
        } else if (this.$selectedTable.val() === "reportClasses") {
            if (grid.getColumns()[cell.cell].id === "Delete") {
                DeleteReport.SpeciesClass(cell.row);
            }
        } else {
            return false;
        }
        // return false;
    },
    onDblClick: function(e) {

        tables[this.$selectedTable.val()].changed = true;
        var cell = grid.getCellFromEvent(e);

        if (this.$selectedTable.val() === 'plotStratum') {
            if (grid.getColumns()[cell.cell].id === "Stratum") {
                $.ajax({
                    url: getStratumsByDbId,
                    dataType: 'json',
                    data: {
                        'dbName': tables.plotStratum.data[cell.row].DBName
                    },
                    type: 'GET',
                    cache: false,
                    async: false,
                    success: function(data) {
                        var stratumOption = [];

                        for (var i = 0; i < data.length; i++) {
                            stratumOption.push(data[i].Stratum);
                        }

                        tables.plotStratum.columns[3].options = stratumOption
                                .join(",");
                    }
                });

                grid.updateRow(cell.row);
                e.stopPropagation();

            }
        } else if (this.$selectedTable.val() === 'stumpageValues') {

            if (grid.getColumns()[cell.cell].id === "Unit") {
                if (tables[this.$selectedTable.val()].data[cell.row].ProdNumb > 1) {
                    grid.getColumns()[cell.cell].options = "doyle MBF,scribner MBF,international MBF,tons,cords,cfib,cfob,cunits";

                } else {
                    grid.getColumns()[cell.cell].options = "tons,cords,cfib,cfob,cunits";

                }
                grid.updateRow(cell.row);
                e.stopPropagation();

            }
        }

    },
    onContextMenu: function(e) {

        if (this.$selectedTable.val() === 'reportClasses'
                || this.$selectedTable.val() === 'myReports') {
            e.preventDefault();
            var cell = grid.getCellFromEvent(e);
            $("#contextMenu").data("row", cell.row).css("top", e.clientY - 150)
                    .css("left", e.clientX - 25).show();
            $("body").one("click", function() {
                $("#contextMenu").hide();
            });
        }
    },
    onCellChange: function(e, args) {
        tables[this.$selectedTable.val()].changed = true;
        var item = args.item;
        tables[this.$selectedTable.val()].modifiedData.push(item);
    },
    onBeforeEditCell: function(e, args) {

        if (this.$selectedTable.val() === "myReports") {

            if (args.column.id === "VolumeUnit3") {
                if (args.item) {
                    if (args.item.Orientation === "Portrait"
                            || args.item.Orientation === null) {
                        // tables.myReports.columns[8].options =
                        // 'Tons,Cords,CFIB,CFOB,Cunits,Doyle,International,Scribner,None';
                        // grid.updateRow(cell.row);
                        /*
                         * e.stopPropagation(); e.stopImmediatePropagation();
                         */
                        if (e.stopPropagation) {
                            e.stopImmediatePropagation();
                        }
                        // IE8 and Lower
                        else {
                            e.cancelBubble = true;
                        }
                        e.preventDefault();
                        return false;
                    }
                } else {
                    // tables.myReports.columns[8].options = '';
                    if (e.stopPropagation) {
                        e.stopImmediatePropagation();
                    }
                    // IE8 and Lower
                    else {
                        e.cancelBubble = true;
                    }
                    /*
                     * e.stopPropagation(); e.stopImmediatePropagation();
                     */
                    // grid.updateRow(cell.row);
                    e.preventDefault();
                    return false;
                }
            }
        }

    },
    onSort: function(e, args) {
        var cols = args.sortCols;

        tables[this.$selectedTable.val()].data.sort(
                function(dataRow1, dataRow2) {
                    for (var i = 0, l = cols.length; i < l; i++) {
                        var field = cols[i].sortCol.field;
                        var sign = cols[i].sortAsc ? 1 : -1;
                        var value1 = dataRow1[field], value2 = dataRow2[field];
                        var result = (value1 === value2 ? 0 : (value1 > value2
                                ? 1
                                : -1))
                                * sign;
                        if (result !== 0) {
                            return result;
                        }
                    }
                    return 0;
                });
        grid.invalidate();
        grid.render();
    },
    onValidationError: function(e, args) {
        alert(args.validationResults.msg);
        tables[this.$selectedTable.val()].valid = false;
    }
};
var table = $("#tableSelect").val();
var dataView = new Slick.Data.DataView();

function saveData() {
    var $selectedTable = $("#tableSelect").val();

    grid.saveActiveCell();
    tables[$selectedTable].saveData();
}

function saveAndAssign() {
    saveData();
    $("#tableSelect").val('groupsToClasses');
    $('#tableSelect').trigger('change');
}

function loadNewGrid() {
    grid.saveActiveCell();
    // var val = $("#tableSelect").val();
    // tables[val].newTableSetup();
    grid.setOptions(tables[selectedTable].options);
    grid.setColumns(tables[selectedTable].columns);

    grid.setData([]);
    grid.render();

    getData(tables[selectedTable].url, setupGridData, tables[selectedTable].param);

}

function getData(url, callback, param) {
    $.ajax({
        url: url,
        dataType: 'json',
        data: param,
        type: 'GET',
        cache: false,
        success: callback
    });
}

function setupGridData(data) {

    var $selectedTable = $("#tableSelect").val();
    tables[$selectedTable].data = data;

    // tables[val].setDataView(dataView, data);
    grid.setData(tables[$selectedTable].data);
    grid.updateRowCount();
    grid.render();

    tables[$selectedTable].newTableSetup();
    // grid.invalidate();
    tables[$selectedTable].setUtil();
}

var fileDownloadCheckTimer;
function BlockUIonDownload() {
    var token = new Date().getTime(); // use the current
    // timestamp as the
    // Set token value
    $('#csvdownload_token_value').val(token);
    $.blockUI({
        message: $('#tableMessage'),
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
        debugger
        var cookieValue = $.cookies.get('fileDownloadToken');
        if (cookieValue === token)
            finishDownload();
    }, 1000);
}

function finishDownload() {
    window.clearInterval(fileDownloadCheckTimer);
    $.cookies.set('fileDownloadToken', null); // clears this cookie
    // value
    $.unblockUI();
}

function expoertCSV(e) {
    $("#selectedtable_value").val(selectedTable);
    BlockUIonDownload();
    $("#TableForm").submit();
}

function validateRow(grid, rowIdx) {
    $.each(grid.getColumns(), function(colIdx, column) {
        // iterate through editable cells
        var item = grid.getDataItem(rowIdx);

        if (column.editor && column.validator) {
            var validationResults = column
                    .validator(item[column.field]);
            if (!validationResults.valid) {
                // show editor
                grid.gotoCell(rowIdx, colIdx, true);

                // validate (it will fail)
                grid.getEditorLock().commitCurrentEdit();

                // stop iteration
                return false;
            }
        }
    });
}

var DeleteReport = {
    SpeciesClass: function(row) {
        var $confirmDelete = $('<div></div>')
                .html('Are you sure you want to delete the class "'
                        + tables[selectedTable].data[row]["ClassName"] + '"?')
                .dialog({
                    autoOpen: false,
                    modal: true,
                    resizable: false,
                    title: 'Notice!',
                    buttons: {
                        "Confirm": function() {
                            var me = $(this);
                            $.ajax({
                                url: $("#deleteReportClassUrl").val(),
                                data: {
                                    'className': tables[selectedTable].data[row]["ClassName"]
                                },
                                type: 'POST',
                                success: function(data) {
                                    me.dialog("close");
                                    tables[selectedTable].data.splice(row, 1);
                                    grid.invalidate();
                                    grid.render();
                                },
                                error: function(xhr, textStatus, errorThrown) {
                                    alert('request failed');
                                    me.dialog("close");
                                }
                            });

                        },
                        "Cancel": function() {
                            $(this).dialog("close");
                        }
                    }
                });
        $confirmDelete.dialog("open");
    },
    MyReport: function(row) {
        var rowId = tables[selectedTable].data[row].Id;
        if (!rowId) {

            // var index =
            // tables[val].modifiedData.indexOf(tables[val].data[row]);
            // tables[val].modifiedData.pop();

            tables[selectedTable].data.splice(row, 1);
            tables[selectedTable].modifiedData = [];
            grid.invalidateRow(row);
            grid.render();
            return;
        }
        var $confirmDelete = $('<div></div>')
                .html('Are you sure you want to delete report configuration "'
                        + tables[selectedTable].data[row]["ReportName"] + '"?')
                .dialog({
                    autoOpen: false,
                    modal: true,
                    resizable: false,
                    title: 'Notice!',
                    buttons: {
                        "Confirm": function() {
                            var me = $(this);
                            $.ajax({
                                url: $("#deleteMyReportsUrl").val(),
                                data: {
                                    'Id': rowId
                                },
                                type: 'POST',
                                success: function(data) {
                                    tables[selectedTable].data.splice(
                                            row, 1);
                                    grid.invalidate();
                                    grid.render();
                                    me.dialog("close");
                                },
                                error: function(xhr, textStatus,
                                        errorThrown) {
                                    alert('request failed');
                                    me.dialog("close");
                                }
                            });

                        },
                        "Cancel": function() {
                            $(this).dialog("close");
                        }
                    }
                });
        $confirmDelete.dialog("open");

    }
};

$(function() {
    $(document).ajaxStart($.blockUI).ajaxStop($.unblockUI);
    // loadNewGrid();
    // $(".editAction").button();
    grid = new Slick.Grid("#myGrid", [], tables[table].columns,
            tables[table].options);
    grid.setSelectionModel(new Slick.CellSelectionModel());

    grid.onAddNewRow.subscribe(function(e, args) {
        slickGrid.onAddNewRow(e, args);
    });

    grid.onClick.subscribe(function(e) {
        slickGrid.onClick(e);
    });
    grid.onDblClick.subscribe(function(e) {
        slickGrid.onDblClick(e);
    });
    grid.onCellChange.subscribe(function(e, args) {
        slickGrid.onCellChange(e, args);
    });

    grid.onBeforeEditCell.subscribe(function(e, args) {
        slickGrid.onBeforeEditCell(e, args);
    });

    grid.onSort.subscribe(function(e, args) {
        slickGrid.onSort(e, args);
    });
    grid.onValidationError.subscribe(function(e, args) {
        slickGrid.onValidationError(e, args);
    });

    getData(tables[table].url, setupGridData);

    $("#saveButton").bind("click", saveData);
    $("#btnAssign").bind("click", saveAndAssign);
    $("#btnExport").bind("click", expoertCSV);

    $("#spnVariant").hide();

    $("#tableSelect").change(function(e) {

        selectedTable = this.value;

        loadNewGrid();
        $("#myGrid").validate();
        $("#selectedtable_value").val(this.value);
        if (this.value === "reportClasses") {
            // $("#btnAssign").button('enable');
            $("#btnAssign").show();

        } else {
            // $("#btnAssign").button('disable');
            $("#btnAssign").hide();
        }

        if (this.value === "speciesMapping")
        {
            $("#spnVariant").show();
        }
        else {
            $("#spnVariant").hide();
        }
    });

    $("#variantSelect").change(function(e) {
        var param = {'variantCode': $("#variantSelect").val()};
        getData(tables[selectedTable].url, setupGridData, param);
    });
    $(window).bind('beforeunload', editDataUtil.confirmExit);
    window.onbeforeunload = editDataUtil.confirmExit;

    $("#contextMenu").click(function(e) {
        if (!$(e.target).is("li")) {
            return;
        }

        var row = $(this).data("row");
        if (selectedTable === 'reportClasses') {
            DeleteReport.SpeciesClass(row);
        } else if (selectedTable === 'myReports') {
            DeleteReport.MyReport(row);
        }
    });
});