// Implementation of Module Pattern
var sharedLayoutModule = (function() {

    // grab the initial top offset of the navigation
    var sticky_navigation_offset_top;

    var init = function() {

        sticky_navigation_offset_top = $('#sticky_navigation_wrapper').offset().top;
        $("#actionContainer").empty();

    };

    var _public = function() {
        init();
    };

    _public.prototype = {
        constructor: _public,
        sticky_navigation: function() {
            var scroll_top = $(window).scrollTop();
            var menuWidth = $("#menu").width();
            var mainWidth = $("#main").width() - 10;

            $('#sticky_navigation_wrapper').css({
                width: mainWidth //menuWidth
            });

            if (scroll_top > sticky_navigation_offset_top) {
                $('#sticky_navigation_wrapper').addClass('transparentMenu');
            } else {
                $('#sticky_navigation_wrapper').removeClass('transparentMenu');
            }
        },
        setCookiesonLogOn: function() {
            if ($('#logindisplay a').innerHTML === 'Log Off') {
                $.cookies.set('selectedMenuItem',
                        $('#menu li a:first-child').innerHtml);
            }

        }
    };

    return _public;
})();

$(function() {
    /*
     * var $menu = $("#menu") $('#menu li').mousedown(function(event) {
     * debugger $('#menu li').each(function() {
     * $(this).css("background-color", "#dccca4"); });
     * $(this).css("background-color", "#FFFFFF"); });
     */

    var sharedLayout = new sharedLayoutModule();

    sharedLayout.setCookiesonLogOn();

    $('#logindisplay a').click(function() {
        sharedLayout.setCookiesonLogOn();
    });
    $('#menu li a').click(function() {
        $.cookies.set('selectedMenuItem',
                String(this.innerHTML))

    });

    $('#menu li a').each(function() {

        if (String(this.innerHTML) == $.cookies.get('selectedMenuItem')) {
            $(this).css('background', '#e5ddc8');
            $(this).addClass('active');
        } else {
            $(this).css("background-color", "#ddd5c0");
            $(this).removeClass('active');
        }

        if (($.cookies.get('selectedMenuItem') == null)
                && (String(this.innerHTML) == 'Projects')) {
            $(this).css('background', '#e5ddc8');
            $(this).addClass('active');
        }
    });

    sharedLayout.sticky_navigation();

    $(window).scroll(function() {
        sharedLayout.sticky_navigation();

    });

});