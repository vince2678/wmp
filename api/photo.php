<?php

function add_photo($media_id)
{
    $constraint = array(
        "media_id" => $media_id,
    );

    $m_row = get_row("media", $constraint);

    $data = array(
        "media_id" => $media_id,
        "title" => basename($m_row['relative_path'])
    );

    if (count_rows("photo", $constraint) < 1)
        return insert_row("photo", $data);
    else
        return update_row("photo", "media_id", $media_id, $data);
    
    return true;
}

?>