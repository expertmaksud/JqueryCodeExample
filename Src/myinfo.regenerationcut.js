var regenerationcut = {
    init: function(settings) {
        regenerationcut.config = {
            $tab: $("#settingTabs"),
            $saveUri: $("#saveRegenerationCutUri"),
            $slider: $("#regenCutSlider"),
            $txtCutTrigger: $("#cutTriggerVal"),
            $thinSelect: $("#thin")
        };

        $.extend(regenerationcut.config, settings);

        $(document).ajaxStart($.blockUI).ajaxStop($.unblockUI);

        this.populateUi();

    },
    save: function() {
        $.ajax({
            type: "POST",
            url: regenerationcut.config.$saveUri.val(),
            data: $("#RegenerationCutForm").serialize(),
            cache: false,
            dataType: "html",
            success: function(data) {
                regenerationcut.config.$tab.tabs('option', 'selected', 2);
            }
        });
    },
    populateUi: function() {

        var regenVal = this.config.$txtCutTrigger.val();

        this.config.$slider.slider({
            range: 'max',
            min: 0,
            max: 100,
            value: !regenVal ? 0 : regenVal,
            slide: function(event, ui) {
                regenerationcut.config.$txtCutTrigger.val(ui.value);
            }
        });

        this.setSliderRange();

        this.config.$slider.slider("option", "value", !regenVal ? 0 : regenVal);

        $("#cutTrigger").change(function() {
            regenerationcut.setSliderRange();
        });
    },
    setSliderRange: function() {

        var cutTriggerVal = $("#cutTrigger").val();

        if (cutTriggerVal === "Age") {
            regenerationcut.config.$slider.slider("option", "min", 1);
            regenerationcut.config.$slider.slider("option", "max", 999);

        } else if (cutTriggerVal === "Year") {
            var today = new Date();
            var thisYear = today.getFullYear();
            regenerationcut.config.$slider.slider("option", "min", thisYear);
            regenerationcut.config.$slider.slider("option", "max",
                    thisYear + 100);
        }

    }
};

$(function() {
    regenerationcut.init();
    $("#btnRegenerationCut").click(function() {
        regenerationcut.save();
    });
});
