<?php
/* add album and/or return album_id */
function add_album($row)
{
    if (count_rows("r_music_album", $row) < 1)
        return insert_row("r_music_album", $row);
    //else

    return true;
}

function get_album_id($row)
{
    $id = -1;

    if (null == ($row = get_row("r_music_album", $row)))
        return $id;

    $id = $row['album_id'];

    return $id;
}

?>