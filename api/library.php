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
function scan_library($library_id = -1, $force_scan = false)
{
    $mimes['music'] =
        array(
            "mp3" => "audio/mpeg",
            "wav" => "audio/wav",
            "ogg" => "audio/ogg"
        );

    $mimes['video'] =
        array(
            "mp4" => "video/mp4",
            "webm" => "video/webm",
            "ogv" => "video/ogg"
        );

    $mimes['photo'] =
        array(
            "jpeg" => "image/jpeg",
            "jpg" => "image/pjpeg",
            "png" => "image/png",
            "svg" => "image/svg+xml",
            "gif" => "image/gif"
        );

    if ($library_id < 0)
        $constraint = array();
    else
        $constraint = array("library_id" => $library_id);

    $libraries = get_rows("library", $constraint);

    $db = connect_to_db();

    foreach ($libraries as $library)
    {
        if (!$force_scan)
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
        }

        $d_stack = array();
        $f_stack = array();

        $d_stack[] = $library['path'];

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
                    if (false !== array_search(mime_content_type($path), $mimes[$library['type']]))
                    {
                        $rpath = substr($path, strlen($library['path']));

                        while ($rpath[0] == "/")
                            $rpath = substr($rpath, 1);

                        $f_stack[] = $rpath;
                    }
                    else // if mime check fails, try extension check
                    {
                        $file_components = explode(".", $file);
                        $extension = strtolower($file_components[count($file_components) - 1]);

                        if (array_key_exists($extension, $mimes[$library['type']]))
                        {
                            $rpath = substr($path, strlen($library['path']));

                            while ($rpath[0] == "/")
                                $rpath = substr($rpath, 1);

                            $f_stack[] = $rpath;
                        }
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

    header("Content-Type: application/json");

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
                    echo '{"status" : "failure",'
                        .' "message": "Invalid id/name"}' . PHP_EOL;

                    die();
                }
            }
            break;
        }
        case null:
            break;
        default:
        {
            echo '{"status" : "failure",'
                .' "message": "Invalid column"}' . PHP_EOL;
            die();
        }
    }

    switch($data['action'])
    {
        case 'force-scan':
        case 'scan':
        {
            if ($data['action'] == "force-scan")
                $force = true;
            else
                $force = false;

            if(scan_library($library_id, $force))
                echo '{"status" : "success"}' . PHP_EOL;
            else
                echo '{"status" : "failure",'
                    .' "message": "Invalid id/name"}' . PHP_EOL;

            die();
        }
        case 'get':
        {
            if ($library_id == -1)
                $constraint = array();
            else
                $constraint = array('library_id' => $library_id);

            $rows = get_rows($data['table'], $constraint);

            for ($i = 0; $i < count($rows); $i++)
            {
                $constraint['library_id'] = $rows[$i]['library_id'];
                $media_rows = get_rows('r_media', $constraint);

                for ($j = 0; $j < count($media_rows); $j++)
                {
                    $id = $media_rows[$j]['media_id'];
                    $rows[$i]['media'][] = $id;
                }
            }

            if (isset($rows))
            {
                $encoded = json_encode($rows, JSON_INVALID_UTF8_SUBSTITUTE);

                if (false != $encoded)
                {
                    echo $encoded;
                }
                else
                {
                    echo '{"status" : "failure",'
                        .' "message": "Could not display data"}' . PHP_EOL;
                }
                die();
            }
        }
        case null:
        default:
        {
            echo '{"status" : "failure",'
                .' "message": "Invalid request"}' . PHP_EOL;
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
    . "(?<action>(get|force-scan|scan))[/]+"
    . "((?<type>row([s]{0,1}))[/]*){0,1}"
    . "(?<table>library)[/]*"
    . "((?<column>(id|name))[/]*){0,1}"
    //. "((?<like>like)[/]+){0,1}"
    . "(?<value>[^/]*)"
    . "$";

    $func = "library_url_handler";

    register_api_url_handler($regexp, $func);

};

$register_handlers();

?>
