<?php

/* add genre and/or return genre_id */
function add_genre($name)
{
    $row = array(
        "name" => $name,
    );

    if (count_rows("genre", $row) < 1)
        return insert_row("genre", $row);
    //else

    return true;
}

function get_genre_id($name)
{
    $id = -1;

    $db = connect_to_db();

    $query = "SELECT * from genre WHERE"
        . " name='"  . $db->escape_string($name) . "';";

    if (false == ($result = $db->query($query)))
        return $id;

    if (null == ($row = $result->fetch_assoc()))
        return $id;

    $id = $row['genre_id'];

    $result->free();
    $db->close();

    return $id;
}

/*
function get_genres()
{

}
*/

?>