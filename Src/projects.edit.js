var editModule = (function() {

    var editModule = function() {

    };

    editModule.prototype = {
        constructor: editModule,
        save: function() {
            var formData = $("#EditProjectForm").serialize();
            var token = $(
                    'input[name="__RequestVerificationToken"], EditProjectForm')
                    .val();
            $.ajax({
                url: $("#EditProjectForm").attr('action'),
                dataType: 'html',
                data: formData + "&__RequestVerificationToken=" + encodeURIComponent(token),
                type: 'POST',
                cache: false,
                success: function(result) {
                    $("#frmProjectDetails").submit();
                }
            });
        }
    };

    return editModule;
})();

$(function() {

    $(document).ajaxStart($.blockUI).ajaxStop($.unblockUI);
    var module = new editModule();

    $("#btnUpdateProject").click(function() {
        module.save();
    });

});