'use strict';

function clearChildren(object)
{
    while (object.lastChild)
    {
        object.removeChild(object.lastChild);
    }
}

function formatTime(seconds)
{
    var hours, minutes;
    var ret = "";

    hours = parseInt(seconds/3600);
    seconds = seconds % 3600;

    minutes = parseInt(seconds/60);
    seconds = parseInt(seconds % 60);

    if (hours > 0)
        ret = ret + hours + ":";

    if (minutes > 9)
        ret = ret + minutes + ":";
    else
        ret = ret + 0 + minutes + ":";

    if (seconds > 9)
        ret = ret + seconds;
    else
        ret = ret + 0 + seconds;

    return ret;
}

function isMobile()
{
    var mobile = false;

    if (window.innerWidth < window.innerHeight)
        mobile = true;
    else if (window.innerWidth < 1024)
        mobile = true;

    return mobile;
}