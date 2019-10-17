<?php

function add_video($media_id)
{

    $constraint = array(
        "media_id" => $media_id,
    );

    $m_row = get_row("media", $constraint);

    $data = array(
        "media_id" => $media_id,
        "title" => basename($m_row['relative_path']),
        "duration" => 0,
    );

    if (count_rows("video", $constraint) < 1)
        return insert_row("video", $data);
    else
        return update_row("video", "media_id", $media_id, $data);
    
    return true;
}

?>