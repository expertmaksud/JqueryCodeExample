$(function() {

    $.validator.addMethod("phoneUS", function(phone_number, element) {
        phone_number = phone_number.replace(/\s+/g, "");
        return this.optional(element)
                || phone_number.length > 9
                && phone_number
                .match(/^(1-?)?(\([2-9]\d{2}\)|[2-9]\d{2})-?[2-9]\d{2}-?\d{4}$/);
    }, "Please specify a valid phone number");

    $("#MyInfoForm").validate({
        rules: {
            FirstName: {
                required: true
            },
            LastName: {
                required: true
            },
            Email: {
                required: true,
                email: true
            },
            PhoneNumber: {
                required: false,
                phoneUS: true
            }
        }
    });

    $('#btnSave').click(function() {
        if ($(this).valid()) {
            $('#MyInfoForm').submit();
            // $('')

        }
    });

    var cache = {}, lastXhr;
    $("#CompanyName").autocomplete({
        minLength: 2,
        source: function(request, response) {
            var term = request.term;
            if (term in cache) {
                response(cache[term]);
                return;
            }

            lastXhr = $.getJSON($('#compineList').val(), request, function(
                    data, status, xhr) {
                cache[term] = data;
                if (xhr === lastXhr) {
                    response(data);
                }
            });
        }
    });

    function submit_myinfo() {
        $("#MyInfoForm").submit();
    }
    $('#btnSaveMyInfo').click(function() {
        var $reportingForm = $("#ReportingForm");
        var action = $reportingForm.attr("action");
        var serialized_form = $reportingForm.serialize();

        if ($('#MyInfoForm').valid()) {
            $.post(action, serialized_form, submit_myinfo);
            // $('#ReportingForm').submit();

        }
    });

});