var planting = {
    init: function(settings) {
        planting.config = {
            $tab: $("#settingTabs"),
            $saveUri: $("#savePlantingUri"),
            $slider: $("#plantingSlider"),
            $txtPlantingTrigger: $("#plantingTriggerVal"),
            $survivalSlider: $("#plantingSurvivalSlider"),
            $txtSurvivalPercent: $("#plantingSurvivalPercent")
        };

        $.extend(planting.config, settings);

        $(document).ajaxStart($.blockUI).ajaxStop($.unblockUI);

        this.populateUi();

    },
    save: function() {
        $.ajax({
            type: "POST",
            url: planting.config.$saveUri.val(),
            data: $("#PlantingForm").serialize(),
            cache: false,
            dataType: "html",
            success: function(data) {
                planting.config.$tab.tabs('option', 'selected', 2);
            }
        });
    },
    populateUi: function() {
        var plantingVal = this.config.$txtPlantingTrigger.val();

        this.config.$slider.slider({
            range: 'max',
            min: 0,
            max: 100,
            value: !plantingVal ? 0 : plantingVal,
            slide: function(event, ui) {
                planting.config.$txtPlantingTrigger.val(ui.value);
            }
        });

        this.config.$slider.slider("option", "value", !plantingVal ? 0 : plantingVal);
        // this.config.$txtPlantingTrigger.val(this.config.$slider.slider("value"));

        $("#plantingTrigger").change(function() {
            planting.setSliderRange();
        });

        var survivalVal = this.config.$txtSurvivalPercent.val();

        this.config.$survivalSlider.slider({
            range: 'max',
            min: 0,
            max: 100,
            value: !survivalVal ? 0 : survivalVal,
            slide: function(event, ui) {
                planting.config.$txtSurvivalPercent.val(ui.value);
            }
        });

        this.config.$slider.slider("option", "value", !survivalVal ? 0 : survivalVal);
    },
    setSliderRange: function() {

        var plantingTriggerVal = $("#plantingTrigger").val();

        if (plantingTriggerVal === "Age" || plantingTriggerVal === "BBA") {
            planting.config.$slider.slider("option", "min", 1);
            planting.config.$slider.slider("option", "max", 999);

        } else if (plantingTriggerVal === "Year") {
            var today = new Date();
            var thisYear = today.getFullYear();
            planting.config.$slider.slider("option", "min", thisYear);
            planting.config.$slider.slider("option", "max", thisYear + 100);
        }

    }
};

$(function() {
    planting.init();
    $("#btnPlanting").click(function() {
        planting.save();
    });

    $("#btnAddNew").click(function() {
        $("#plantingDiv").clone().appendTo("#newPlanting").slideDown("slow");
    });
});
