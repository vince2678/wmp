<?php

function add_video($m_row)
{
    $data = array(
        "media_id" => $m_row['media_id'],
        "title" => basename($m_row['relative_path']),
        "duration" => 0,
    );

    if (count_rows("video", array("media_id" => $m_row['media_id'])) < 1)
        return insert_row("video", $data);
    else
        return update_row("video", "media_id", $m_row['media_id'], $data);
    
    return true;
}

?>