<?php

/*
function add_library($name, $path, $type, $interval = 3600)
{

}
*/

/*
function update_library($id, $path, $type, $interval)
{

}
*/

/* take in a library $row */
function scan_library($library_id = -1)
{
    $mimes['music'] =
        array(
            "audio/mpeg",
            "audio/wav",
            "audio/ogg"
        );

    $mimes['video'] =
        array(
            "video/mp4",
            "video/webm",
            "video/ogg"
        );

    $mimes['photo'] =
        array(
            "image/jpeg",
            "image/pjpeg",
            "image/png",
            "image/svg+xml",
            "image/gif"
        );

    if ($library_id < 0)
        $constraint = array();
    else
        $constraint = array("library_id" => $library_id);

    $libraries = get_rows("library", $constraint);

    $finfo = new \finfo(FILEINFO_MIME_TYPE, "/usr/lib/file/magic.mgc");

    $db = connect_to_db();

    foreach ($libraries as $library)
    {
        $query = "SELECT MAX(last_update) as last FROM media WHERE"
            . " library_id='" . $library['library_id'] . "';";

        $result = $db->query($query);

        if (isset($result) && $result->num_rows > 0)
            $mru_row = $result->fetch_assoc();

        if (isset($mru_row['last']))
        {
            $current_time = new \DateTime();
            $update_time = new \DateTime($mru_row['last']);
            $diff = $current_time->getTimestamp() - $update_time->getTimestamp();

            // don't rescan if the update interval hasn't passed yet
            if ($diff < $library['update_interval'])
            {
                $result->free();
                continue;
            }
        }
        $result->free();

        $d_stack = array();
        $f_stack = array();

        $d_stack[] = $library['full_path'];

        //  add files to file stack
        while (null !== ($dir = array_pop($d_stack)))
        {
            if (false == ($dh = opendir($dir)))
            {
                continue;
            }

            while (false !== ($file = readdir($dh)))
            {
                $path = $dir . "/" . $file;

                $ft = filetype($path);

                // dont add hidden files or . and .. entries
                if (("dir" == $ft) && (0 !== strncmp('.', $file, 1)))
                {
                    $d_stack[] = $path;
                }
                elseif ("file" == $ft)
                {
                    if (false !== array_search($finfo->file($path), $mimes[$library['type']]))
                    {
                        $rpath = substr($path, strlen($library['full_path']));

                        while ($rpath[0] == "/")
                            $rpath = substr($rpath, 1);

                        $f_stack[] = $rpath;
                    }
                }
            }
            closedir($dh);
        }
        add_media($library['library_id'], $f_stack);
        clean_media_records($library['library_id']);
    }

    $db->close();

    return true;
}

function library_url_handler($data)
{

    $library_id = -1;

    switch($data['column'])
    {
        case 'id':
        {
            if (isset($data['value']) && ("" !== $data['value']))
                $library_id = $data['value'];

            break;
        }
        case 'name':
        {
            if (isset($data['value']) && ("" !== $data['value']))
            {
                $constraint = array(
                    $data['column'] => htmlspecialchars_decode($data['value']),
                );

                if (null !== $row = get_row("library", $constraint))
                    $library_id = $row['library_id'];
                else
                {
                    echo "No library with name " . $data['value'] . " found\n";
                    die();
                }
            }
            break;
        }
        case null:
            break;
        default:
        {
            echo "Invalid column specified\n";
            die();
        }
    }

    switch($data['action'])
    {
        case 'scan':
        {
            header("Content-Type: application/json");

            if(scan_library($library_id))
                echo '{"status" : "success"}' . PHP_EOL;
            else
                echo '{"status" : "failure",'
                    .' "message": "Invalid id/name"}' . PHP_EOL;

            die();
        }
        case null:
        default:
        {
            echo "Invalid request specified\n";
            die();
        }
    }
}

$register_handlers = function ()
{
    // make sure to order regexp conditions with precedence
    // to avoid greedy matching, e.g photo_album|photo instead of photo|photo_album

    $regexp =
    "^[/]*api[/]+"
    . "(?<action>(scan))[/]*"
    . "(?<table>library)[/]+"
    . "((?<column>(id|name))[/]*){0,1}"
    //. "((?<like>like)[/]+){0,1}"
    . "(?<value>[^/]*)"
    . "$";

    $func = "library_url_handler";

    register_api_url_handler($regexp, $func);

};

$register_handlers();

?>
