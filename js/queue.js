'use strict';

function getShuffle(array)
{
    var shuffle = Array;
    var visited = new Set();

    while (shuffle.length < array.length)
    {
        let index = Math.floor(Math.random() * array.length);

        if (visited.has(index))
            continue;

        visited.add(index);
        shuffle.push(array[index]);
    }

    return shuffle;
}

function getMediaQueue(group, value)
{
    var media = global_player_state['media'];

    var queue = [];
    var type = null;

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
                queue.push(medium['media_id']);
        }
    }

    switch(group)
    {
        case 'playlist':
        {
            let playlist = global_player_state['playlist'].filter(
                function(e, i, a)
                { return (e['playlist_id'] == value); }
            )[0];

            if (playlist['playlist_id'] !== undefined)
                type = playlist['type'];

            let playlist_media = global_player_state['playlist_media'].filter(
                function(e, i, a)
                { return (e['playlist_id'] == value); }
            );

            //TODO: Incorporate rank into table ordering
            for (let playlist_item of playlist_media)
            {
                queue.push(playlist_item['media_id']);
            }

            break;
        }
        case 'library':
        {
            let library = global_player_state['library'].filter(
                function(e, i, a)
                { return (e['library_id'] == value); }
            )[0];


            if (library['library_id'] !== undefined)
                type = library['type'];

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

    return {'queue': queue, 'type': type};
}
