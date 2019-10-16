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

    if (null == ($row = get_row("genre", array("name" => $name))))
        return $id;

    $id = $row['genre_id'];

    return $id;
}

/*
function get_genres()
{

}
*/

?>