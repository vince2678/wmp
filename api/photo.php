<?php

function add_photo($m_row)
{
    $data = array(
        "media_id" => $m_row['media_id'],
        "title" => basename($m_row['relative_path'])
    );

    if (count_rows("photo", array("media_id" => $m_row['media_id'])) < 1)
        return insert_row("photo", $data);
    else
        return update_row("photo", "media_id", $m_row['media_id'], $data);
    
    return true;
}

?>