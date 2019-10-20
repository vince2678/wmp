'use strict';

const SIDE_NAV_WIDTH = '300px';
const TOP_NAV_WIDTH = '100%';
const MEDIA_PLAYER_WIDTH = '100%';

const TOP_NAV_HEIGHT = '50px';
const MEDIA_PLAYER_HEIGHT = '72px';

function isMobile()
{
    var mobile = false;

    if (window.innerWidth < window.innerHeight)
        mobile = true;
    else if (window.innerWidth < 1024)
        mobile = true;

    return mobile;
}

function openLeftNav()
{
    var nav = document.querySelector('#left_nav');
    var btn = document.querySelector('.leftnavbtn');
    
    if (isMobile())
        nav.style.width = window.innerWidth + 'px';
    else
        nav.style.width = SIDE_NAV_WIDTH;

    btn.innerHTML = "&times;";
    btn.onclick = closeLeftNav;

    resizeElems();
}

function closeLeftNav()
{
    var nav = document.querySelector('#left_nav');
    var btn = document.querySelector('.leftnavbtn');
    
    //nav.style.transition = '0.2s';
    nav.style.width = '0px';

    btn.innerHTML = "&plus;";
    btn.onclick = openLeftNav;

    resizeElems();
}

function resizeElems()
{
    var left_nav = document.querySelector('#left_nav');
    var top_nav = document.querySelector('#top_nav');
    var media_player = document.querySelector('#media_player');
    var media_content = document.querySelector('#content');

    top_nav.style.height = TOP_NAV_HEIGHT;
    media_player.style.height = MEDIA_PLAYER_HEIGHT;

    left_nav.style.top = top_nav.style.height;

    media_content.style.top = top_nav.style.height;
    media_content.style.left = left_nav.style.width;

    top_nav.style.width = TOP_NAV_WIDTH;
    media_player.style.width = MEDIA_PLAYER_WIDTH;

    left_nav.style.height = window.innerHeight 
        - parseInt(top_nav.style.height)
        - parseInt(media_player.style.height) + 'px';

    media_content.style.width = (window.innerWidth
        - parseInt(left_nav.style.width)) + 'px';

    media_content.style.height = left_nav.style.height;

}

/* populate the media and library sections */
function populateMediaLibraries(libraryJSON)
{
    var libraryListing = document.querySelector('#left_nav #libraries #listing');
    var mediaListing = document.querySelector('#left_nav #media_groups #listing');

    var types = new Set();

    var libraries = JSON.parse(libraryJSON);

    for (let library of libraries)
    {
        let entry = document.createElement('span');

        entry.setAttribute('class', 'library');
        entry.innerHTML = library['name'];

        libraryListing.appendChild(entry);

        types.add(library['type']);
    }

    for (let type of types)
    {
        let entry = document.createElement('span');

        entry.setAttribute('class', 'media');
        entry.innerHTML = type;

        mediaListing.appendChild(entry);
    }
}

/* populate the playlist sections */
function populatePlaylists(playlistJSON)
{
    var playlistListing = document.querySelector('#left_nav #playlists #listing');

    var playlists = JSON.parse(playlistJSON);

    for(let playlist of playlists)
    {
        let entry = document.createElement('span');

        entry.setAttribute('class', 'playlist');
        entry.innerHTML = playlist['name'];

        playlistListing.appendChild(entry);
    }
}

(function()
{
    if (isMobile())
        closeLeftNav();
    else
        openLeftNav();

    window.onresize = resizeElems;

    asyncGetUrlResponse("api/get/row/library", populateMediaLibraries);
    asyncGetUrlResponse("api/get/row/playlist", populatePlaylists);

})();
