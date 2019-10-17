<?php

function add_video($media_id)
{

    $constraint = array(
        "media_id" => $media_id,
    );

    $m_row = get_row("media", $constraint);

    /* fetch metadata */
    $meta = get_media_metadata($media_id)[$media_id];
    $tags = $meta['comments'];

    $data["media_id"] = $media_id;

    if (isset($tags['title'][0]))
        $data['title'] = $tags['title'][0];
    elseif (isset($m_row['relative_path']))
        $data['title'] = $m_row['relative_path'];

    if (isset($meta['playtime_seconds']))
        $data['duration'] = (int) $meta['playtime_seconds'];
    else
        $data['duration'] = 0;

    // add genre if not exists
    if (isset($tags['genre'][0]))
    {
        $genre = $tags['genre'][0];

        if (add_genre($genre))
            $data['genre_id'] = get_genre_id($genre);
    }

    if (count_rows("video", $constraint) < 1)
        return insert_row("video", $data);
    else
        return update_row("video", "media_id", $media_id, $data);
    
    return true;
}

?>