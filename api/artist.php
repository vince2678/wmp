<?php

/* add artist and/or return artist_id */
function add_artist($name)
{
    $row = array(
        "name" => $name,
    );

    if (count_rows("artist", $row) < 1)
        return insert_row("artist", $row);
    //else

    return true;
}

function get_artist_id($name)
{
    $id = -1;

    if (null == ($row = get_row("artist", array("name" => $name))))
        return $id;

    $id = $row['artist_id'];

    return $id;
}

?>