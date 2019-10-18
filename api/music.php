<?php

function add_music($media_id)
{
    $meta = get_media_metadata($media_id)[$media_id];
    
    /*
    if (isset($meta['tags']['id3v2']))
        $tags = $meta['tags']['id3v2'];
    elseif (isset($meta['tags']['id3v1']))
        $tags = $meta['tags']['id3v1'];
    elseif (isset($meta['tags']['vorbiscomment']))
        $tags = $meta['tags']['vorbiscomment'];
    else
        $tags = $meta['comments'];
    */
    $tags = $meta['comments'];

    $track_data = array();
    $album_data = array();

    $track_data["media_id"] = $media_id;

    if (isset($meta['playtime_seconds']))
        $track_data['duration'] = (int) $meta['playtime_seconds'];

    if (isset($tags['title'][0]))
        $track_data['title'] = $tags['title'][0];

    if (isset($tags['track_number'][0]))
        $track_data['track_number'] = $tags['track_number'][0];
    elseif (isset($tags['tracknumber'][0]))
        $track_data['track_number'] = $tags['tracknumber'][0];
    elseif (isset($tags['track'][0]))
        $track_data['track_number'] = $tags['track'][0];

    /* get album artist */
    if (isset($tags['text']['Album Artist Credit']))
        $album_artist = $tags['text']['Album Artist Credit'];
    elseif (isset($tags['band'][0]))
        $album_artist = $tags['band'][0];
    else
        $album_artist = $tags['artist'][0];
    
    /* get track artist */
    if (isset($tags['text']['Artist Credit']))
        $track_artist = $tags['text']['Artist Credit'];
    elseif (isset($tags['artist'][0]))
        $track_artist = $tags['artist'][0];
    else
        $track_artist = $album_artist;

    if (isset($tags['album'][0]))
        $album_data['name'] = $tags['album'][0];

    if (isset($tags['totaltracks'][0]))
        $album_data['track_count'] = $tags['totaltracks'][0];

    // add artist if not exists
    if (isset($album_artist))
    {
        if (add_artist($album_artist))
            $album_data['artist_id'] = get_artist_id($album_artist);
    }

    if (isset($track_artist))
    {
        if (add_artist($track_artist))
            $track_data['artist_id'] = get_artist_id($track_artist);
    }

    // add album if not exists
    if(add_album($album_data))
        $track_data['album_id'] = get_album_id($album_data);

    // add genre if not exists
    if (isset($tags['genre'][0]))
    {
        $genre = $tags['genre'][0];

        if (add_genre($genre))
            $track_data['genre_id'] = get_genre_id($genre);
    }

    $constraint = array("media_id" => $media_id);

    if (count_rows("r_track", $constraint) < 1)
        return insert_row("r_track", $track_data);
    else
        return update_row("r_track", $constraint, $track_data);

    return true;
}

?>