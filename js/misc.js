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

/* Convert size from percent to pixels,
   using max as reference for 100% */
function percentToPixel(size, max)
{
    let percentRegexp = /^[0-9]{1,3}%$/;
    let pixelRegexp = /^[0-9]*px$/;

    if (pixelRegexp.exec(size))
    {
        return parseInt(size);
    }
    else if (percentRegexp.exec(size))
    {
        return (parseInt(size) / 100.0) * max;
    }
    else
        return parseInt(size);
}

function isFullScreen()
{
    if (document.fullscreenElement == document.querySelector('body'))
        return true;

    return false;
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