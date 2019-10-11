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

    $db = connect_to_db();

    $query = "SELECT * from artist WHERE"
        . " name='"  . $db->escape_string($name) . "';";
    
    if (false == ($result = $db->query($query)))
        return $id;
    
    if (null == ($row = $result->fetch_assoc()))
        return $id;

    $id = $row['artist_id'];

    $result->free();
    $db->close();

    return $id;
}

?>