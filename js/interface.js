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

        entry.onclick = function() {
            populateContentArea('library', library['library_id']);
        };

        libraryListing.appendChild(entry);

        types.add(library['type']);
    }

    let entry = document.createElement('span');

    entry.setAttribute('id', 'add_library');
    entry.innerHTML = "&plus; Add Library";

    libraryListing.appendChild(entry);

    for (let type of types)
    {
        let entry = document.createElement('span');

        entry.setAttribute('class', 'media');
        entry.innerHTML = type;

        entry.onclick = function() {
            populateContentArea('type', type);
        };

        mediaListing.appendChild(entry);
    }

    /* hide media section in left nav */
    if (mediaListing.childElementCount == 0)
        mediaListing.parentElement.hidden = true;

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

        entry.onclick = function() {
            populateContentArea('playlist', playlist['playlist_id']);
        };

        playlistListing.appendChild(entry);
    }

    let entry = document.createElement('span');

    entry.setAttribute('id', 'add_playlist');
    entry.innerHTML = "&plus; Add playlist";

    playlistListing.appendChild(entry);
}

function populateContentArea(group, value)
{

    var media_json = syncGetUrlResponse("api/get/rows/media");
    var media = JSON.parse(media_json);
    var ids = new Set();

    var type;

    function filterMedia(constraint) {
        for (let medium of media)
        {
            let match = true;

            for (let key in constraint)
            {
                if (medium[key] != constraint[key])
                {
                    match = false;
                    break;
                }
            }

            if (match)
                ids.add(medium['media_id']);
        }
    }

    switch(group)
    {
        case 'playlist':
        {
            var playlist_json = syncGetUrlResponse("api/get/rows/playlist/id/" + value);
            var playlist = JSON.parse(playlist_json);

            if (playlist[0]['playlist_id'] !== undefined)
                type = playlist[0]['type'];

            var playlist_media_json = syncGetUrlResponse("api/get/rows/playlist_media/id/" + value);
            var playlist_media = JSON.parse(playlist_media_json);

            //TODO: Incorporate rank into table ordering
            for (let playlist_item of playlist_media)
            {
                ids.add(playlist_item['media_id']);
            }

            break;
        }
        case 'library':
        {
            var library_json = syncGetUrlResponse("api/get/rows/library/id/" + value);
            var library = JSON.parse(library_json);

            if (library[0]['library_id'] !== undefined)
                type = library[0]['type'];

            filterMedia({'library_id':value});
            break;
        }
        case 'type':
        {
            filterMedia({'library_type':value});
            type = value;
            break;
        }
        default:
        {
            console.log("Unknown group selected");
            break;
        }
    }

    var content_area = document.querySelector('#content');

    clearChildren(content_area);

    var content;

    if (ids.size == 0)
    {
        //no matching media, no media in playlist/media group/library
        content = document.createElement('p');
        content.setAttribute('id', 'no_content_msg');

        if (group == "playlist")
        {
            content.innerHTML = "This playlist is currently empty";
        }
        else
        {
            content.innerHTML = "It's lonely here. Add some files"
                + " to the library to get started."
        }
    }
    else
    {
        switch(type)
        {
            case 'music':
            {
                content = getMusicContent(ids);
                break;
            }
            case 'video':
            {
                content = getVideoContent(ids);
                break;
            }
            case 'photo':
            {
                content = getPhotoContent(ids);
                break;
            }
            default:
            {
                console.log("Invalid type");
                break;
            }
        }
    }

    if (content)
        content_area.appendChild(content);

}

function getMusicContent(media_ids)
{
    return getMusicList(media_ids);
}

function getVideoContent(ids)
{
    console.log("getVideoContent: Unimplemented");
}

function getPhotoContent(ids)
{
    console.log("getPhotoContent: Unimplemented");
}

function getMusicList(media_ids)
{
    var music_json = syncGetUrlResponse("api/get/row/track");
    var music = JSON.parse(music_json);

    var column_map = {
                   'title': 'Title',
                   'artist': 'Artist',
                   'album_artist': 'Album&nbsp;Artist',
                   'album': 'Album',
                   'genre': 'Genre',
                   'play_count': 'Play Count',
                   'duration': 'Length'
                };

    var columns = ['title', 'artist', 'album_artist', 'album', 'genre', 'duration'];

    var media_table = document.createElement('table');
    var header = document.createElement('tr');

    media_table.setAttribute('class', 'content_table');
    header.setAttribute('class', 'content_table_header');

    media_table.appendChild(header);

    /* play button */
    let heading = document.createElement('th');
    header.appendChild(heading);

    for (let column of columns)
    {
        let heading = document.createElement('th');
        heading.innerHTML = column_map[column];
        header.appendChild(heading);
    }

    for (let track of music)
    {
        if (!media_ids.has(track["media_id"]))
            continue;

        let row = document.createElement('tr');
        row.setAttribute('class', 'content_table_row');

        /* play button */
        let link = document.createElement('a');
        link.innerHTML = 'Play';
        link.setAttribute('href', 'javascript:void(0)');

        link.onclick = function(){
            playMedia(track['media_id']);
        };

        row.appendChild(link);

        for (let column of columns)
        {
            let data = document.createElement('td');

            if (track[column] != null)
            {
                if (column == "duration")
                    data.innerHTML = formatTime(track[column]);
                else
                    data.innerHTML = track[column];
            }
            row.appendChild(data);
        }
        media_table.appendChild(row);
    }

    /* return table only if there are tracks to list */
    if (media_table.childElementCount > 1)
        return media_table;

    media_table.remove();
    return null;
}

function playMedia(media_id)
{
    var media_json = syncGetUrlResponse("api/get/row/media/id/" + media_id);
    var media = JSON.parse(media_json);

    var element;

    switch (media[0]['library_type'])
    {
        case "music":
        {
            element = 'audio';
            break;
        }
        case "video":
        {
            element = 'video';
        }
        case "photo":
        {
            //TODO: Implement this
        }
        default:
        {
            console.log("Unimplemented support for type");
            return;
        }
    }

    var media_controls = document.querySelector('#media_controls');

    clearChildren(media_controls);

    var media_element = document.createElement(element);
    var media_src = document.createElement('source');

    media_element.setAttribute('id', element + '_controls');
    media_element.controls = true;
    media_element.autoplay = true;

    media_element.onratechange = function() {
        console.log('The playback rate changed.');
    };

    media_element.appendChild(media_src);
    media_controls.appendChild(media_element);

    media_src.setAttribute('src', 'api/get/raw/media/id/' + media_id);
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
