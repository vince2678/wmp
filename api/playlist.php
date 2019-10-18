<?php

/*
Add playlist with $name, duplicate names allowed
*/
function add_playlist($name)
{
    $data = array("name" => $name);
    return insert_row("playlist", $data);
}

function update_playlist($id, $name)
{
    $constraint = array("playlist_id" => $id);
    $data = array("name" => $name);

    return update_row("playlist", $constraint, $data);
}

function add_playlist_media($playlist_id, $media_id, $rank = NULL)
{
    $data = array(
        "media_id" => $media_id,
        "playlist_id" => $playlist_id,
    );

    $count = count_rows("playlist_media", $data);

    if (isset($rank))
        $data['rank'] = $rank;

    if ($count == 0)
        return insert_row("playlist_media", $data);
    elseif ($count > 0)
    {
        $constraints = array(
            "media_id" => $media_id,
            "playlist_id" => $playlist_id,
        );

        return update_row("playlist_media", $constraints, $data);
    }
    /*else //($count < 0)*/

    return false;
}

function remove_playlist_media($playlist_id, $media_id)
{
    $constraints = array(
        "media_id" => $media_id,
        "playlist_id" => $playlist_id,
    );

    return delete_row("playlist_media", $constraints);
}

?>
