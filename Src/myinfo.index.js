var userInfo = {
    Save: function(frm) {
        $.ajax({
            url: frm.action,
            type: frm.method,
            dataType: 'html',
            data: $(frm).serialize(),
            async: false,
            success: userInfo.UpdateUI
        });
        return false;
    },
    UpdateUI: function(result) {
        $('#userInfoDiv').html(result);
    },
    fileSelectedChanged: function(obj) {
        var filePath = obj.value;
        var fileTypes = ["bmp", "gif", "png", "jpg", "jpeg"];
        var ext = filePath.substring(filePath.lastIndexOf('.') + 1)
                .toLowerCase();
        var extOk = false;
        for (var i = 0; i < fileTypes.length; i++) {
            if (fileTypes[i] === ext) {
                extOk = true;
            }
        }
        if (extOk === true) {
            if ($.browser.msie) {
                $('#profileImg').attr('src', 'file:\/\/' + obj.value);
            } else {
                var reader = new FileReader();

                reader.onload = function(e) {
                    $('#profileImg').attr('src', e.target.result);
                };

                reader.readAsDataURL(obj.files[0]);
            }

        } else {

            alert('Only files with the file extension bmp/jpeg/gif/png are allowed');
            obj.value = '';
        }
    }
};

var myReportOption = {
    Save: function(frm) {
        $.ajax({
            url: frm.action,
            type: frm.method,
            dataType: 'html',
            data: $(frm).serialize(),
            async: false,
            cache: false,
            success: myReportOption.UpdateUI,
            error: function(jqXHR, textStatus, errorThrown) {
                alert('Error');
            }
        });
        return false;

    },
    UpdateUI: function(result) {
        $('#reportOptionDiv').empty().html(result);
    }
};

var growthandYieldService = {
    SaveAll: function() {
        var data = {
            GrowthModel: this.serializeJson($("#GrowthYieldForm")),
            RegenerationCutModel: this
                    .serializeJson($("#RegenerationCutForm")),
            PlantingModel: this.serializeJson($("#PlantingForm")),
            ThinningModel: thinningGridConf.data,
            ReportModel: this.serializeJson($("#GrowthReportForm"))
        };

        $.ajax({
            type: "POST",
            url: $("#saveAllGrowthUri").val(),
            data: JSON.stringify(data),
            cache: false,
            dataType: "html",
            contentType: "application/json; charset=utf-8",
            success: function(data) {
                planting.config.$tab.tabs('option', 'selected', 2);
            }
        });

    },
    serializeJson: function(serializeForm) {
        var o = {};
        var a = serializeForm.serializeArray();
        $.each(a, function() {
            if (o[this.name]) {
                if (!o[this.name].push) {
                    o[this.name] = [o[this.name]];
                }
                o[this.name].push(this.value || '');
            } else {
                o[this.name] = this.value || '';
            }
        });
        return o;
    }
};

$(function() {

    $("#settingTabs").tabs({
        cache: false,
        ajaxOptions: {
            cache: false
        }
    });

    $(document).ajaxStart($.blockUI).ajaxStop($.unblockUI);

});