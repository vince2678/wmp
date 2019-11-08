'use strict';

function toggleLeftNav()
{
    var open;

    var left_nav = document.querySelector('#left_nav');
    var media_content = document.querySelector('#content');

    var btn = document.querySelector('.leftnavbtn');

    if(left_nav.className == NAV_CLOSED)
    {
        open = true;

        left_nav.className = NAV_OPEN;
        media_content.className = PLAYER_SIZE_NORMAL;
        btn.innerHTML = "&times;";
    }
    else
    {
        open = false;

        left_nav.className = NAV_CLOSED;

        if (top_nav.clientHeight == 0)
            media_content.className = PLAYER_SIZE_LARGE;
        else
            media_content.className = PLAYER_SIZE_WIDE;

        btn.innerHTML = "&plus;";
    }

    return open;
}

function toggleTopNav()
{
    var open;

    var top_nav = document.querySelector('#top_nav');
    var left_nav = document.querySelector('#left_nav');
    var media_content = document.querySelector('#content');

    if (top_nav.className == NAV_CLOSED)
    {
        open = true;

        top_nav.className = NAV_OPEN;

        if (left_nav.clientWidth == 0)
            media_content.className = PLAYER_SIZE_WIDE;
        else
            media_content.className = PLAYER_SIZE_NORMAL;
    }
    else
    {
        open = false;
        top_nav.className = NAV_CLOSED;
        media_content.className = PLAYER_SIZE_LARGE;
    }

    return open;
}