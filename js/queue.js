'use strict';

function getShuffle(array)
{
    var shuffle = new Array();
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
    var queue = [];
    var type = null;

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

            //TODO: Incorporate rank into table ordering
            if (playlist['media'])
                queue = playlist['media'];

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

            if (library['media'])
                queue = library['media'];

            break;
        }
        case 'type':
        {
            type = value;

            let libraries = global_player_state['library'].filter(
                function(e, i, a)
                { return (e['type'] == value); }
            );

            for (let library of libraries)
            {
                if (library['media'])
                    queue = queue.concat(library['media']);
            }

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
