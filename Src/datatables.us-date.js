jQuery
        .extend(
                jQuery.fn.dataTableExt.oSort,
                {
                    "datetime-us-pre": function(a) {
                        var b = a
                                .match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4}) (\d{1,2}):(\d{1,2}):(\d{1,2}) (am|pm|AM|PM|Am|Pm)/);
                        if (b === null)
                            return 0;

                        var month = b[1], day = b[2], year = b[3], hour = b[4], min = b[5], sec = b[6], ap = b[7];

                        if (hour === '12')
                            hour = '0';
                        if (ap === 'pm')
                            hour = parseInt(hour, 10) + 12;

                        if (year.length === 2) {
                            if (parseInt(year, 10) < 70)
                                year = '20' + year;
                            else
                                year = '19' + year;
                        }
                        if (month.length === 1)
                            month = '0' + month;
                        if (day.length === 1)
                            day = '0' + day;
                        if (hour.length === 1)
                            hour = '0' + hour;
                        if (min.length === 1)
                            min = '0' + min;
                        if (sec.lenght === 1)
                            sec = '0' + sec;

                        var tt = year + month + day + hour + min + sec;
                        return tt;
                    },
                    "datetime-us-asc": function(a, b) {
                        return a - b;
                    },
                    "datetime-us-desc": function(a, b) {
                        return b - a;
                    }
                });

jQuery.fn.dataTableExt.aTypes
        .unshift(function(sData) {
            if (sData !== null && sData.match(/\d{1,2}\/\d{1,2}\/\d{2,4} \d{1,2}:\d{1,2}:\d{1,2} (am|pm|AM|PM|Am|Pm)/)) {
                return 'datetime-us';
            }
            return null;
        });
