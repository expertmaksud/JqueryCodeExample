var growthAndYear = {
    init: function(settings) {
        growthAndYear.config = {
            $slider: $("#growthslider"),
            $hdnGrowthInp: $('#hdngrowthYear'),
            $growthText: $("#GrowthYear"),
            $tab: $("#settingTabs"),
            $saveUri: $("#saveGrowthUri")
        };

        $.extend(growthAndYear.config, settings);

        $(document).ajaxStart($.blockUI).ajaxStop($.unblockUI);

        growthAndYear.populateUi();
    },
    populateUi: function() {
        var today = new Date();
        var thisYear = today.getFullYear();
        growthAndYear.config.$slider.slider({
            range: 'max',
            min: thisYear,
            max: thisYear + 100,
            value: !growthAndYear.config.$hdnGrowthInp.val()
                    ? thisYear
                    : growthAndYear.config.$hdnGrowthInp.val(),
            slide: function(event, ui) {
                growthAndYear.config.$growthText.val(ui.value);
            }
        });
        growthAndYear.config.$growthText.val(growthAndYear.config.$slider
                .slider("value"));

        $("input[type=button]").button();

    },
    save: function() {
        $.ajax({
            type: "POST",
            url: growthAndYear.config.$saveUri.val(),
            data: $("#GrowthYieldForm").serialize(),
            cache: false,
            dataType: "html",
            success: function(data) {
                growthAndYear.config.$tab.tabs('option', 'selected', 2);
            }
        });
    },
    saveAndEditSpeciesMapping: function() {
        $.ajax({
            type: "POST",
            url: growthAndYear.config.$saveUri.val(),
            data: $("#GrowthYieldForm").serialize(),
            cache: false,
            dataType: "html",
            success: function(data) {
                growthAndYear.config.$tab.tabs('option', 'selected', 1);
                $("#tableSelect").val('speciesMapping');
                $('#tableSelect').trigger('change');
            }
        });
    },
    saveAndEditGrowthCalib: function() {
        $.ajax({
            type: "POST",
            url: growthAndYear.config.$saveUri.val(),
            data: $("#GrowthYieldForm").serialize(),
            cache: false,
            dataType: "html",
            success: function(data) {
                growthAndYear.config.$tab.tabs('option', 'selected', 1);
                $("#tableSelect").val('strataAcres');
                $('#tableSelect').trigger('change');
            }
        });
    }

};

$(function() {
    growthAndYear.init();

    $("#btnGrowthYield").click(function() {
        growthandYieldService.SaveAll();
    });

    $("#btnGrowth").click(function() {
        growthAndYear.save();
    });
    $("#btnSpeciesMapping").click(function() {
        growthAndYear.saveAndEditSpeciesMapping();
    });
    $("#btnGrowthCalib").click(function() {
        growthAndYear.saveAndEditGrowthCalib();
    });
    $("#VariantCode").change(function() {
        $.ajax({
            url: $("#getForest").val(),
            dataType: 'json',
            data: {
                VariantCode: $("#VariantCode").val()
            },
            type: 'GET',
            cache: false,
            success: function(result) {
                var options = $("#DefaultForestId");
                options.empty();
                $.each(result, function() {
                    options.append($("<option />")
                            .val(this.PK_ID)
                            .text(this.NationalForest));
                });
                options.trigger('change');
            }
        });

    });
    $("#DefaultForestId").change(function() {
        $.ajax({
            url: $("#getLocation").val(),
            dataType: 'json',
            data: {
                DefaultForestId: $("#DefaultForestId").val()
            },
            type: 'GET',
            cache: false,
            success: function(result) {
                var options = $("#DefaultLocationCode");
                options.empty();

                $.each(result, function() {
                    options.append($("<option />")
                            .val(this.LocationCode)
                            .text(this.District));
                });
            }
        });
    });
});
