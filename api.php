<?php

include __DIR__ . "/api/" . "artist.php";
include __DIR__ . "/api/" . "genre.php";
include __DIR__ . "/api/" . "library.php";
include __DIR__ . "/api/" . "playlist.php";
include __DIR__ . "/api/" . "media.php";

include __DIR__ . "/api/" . "music.php";
include __DIR__ . "/api/" . "photo.php";
include __DIR__ . "/api/" . "video.php";

function api_request_handler()
{
    if (isset($_SERVER["PATH_INFO"]))
        $request_path = $_SERVER['PATH_INFO'];
    else
    {
        $s = strlen(dirname($_SERVER['SCRIPT_NAME']));
        $request_path = substr($_SERVER['REQUEST_URI'], $s);
    }

    $split = explode("/", $request_path);

    if ($split[1] != "api")
        return;

    switch($split[2])
    {
        case "get":
        {
            $tables = array("genre", "library", "playlist", "media");

            if(false !== ($key = array_search($split[3], $tables)))
            {
                $rows = get_rows($tables[$key], $_GET);

                if (false == ($json = json_encode($rows)))
                {
                    echo "<pre>\n";
                    var_dump($rows);
                    echo "</pre>\n";
                }
                else
                {
                    header('Content-Type: application/json');
                    echo $json;
                }
            }
            else
            {
                header('Content-Type: application/json');
                echo "[ \"Invalid query\" ]\n";
            }
            die();
        }
        case "download":
        {
            get_raw_media($_GET);
            die();
        }
        case "scan":
        {
            header('Content-Type: application/json');

            if (scan_libraries($_GET))
            {
                echo "{\"status\": \"success\"}\n";
            }
            else
            {
                echo "{\"status\": \"failed\"}\n";
            }
            die();
            break;
        }
        case "create":
        {
            $tables = array("library", "playlist");

            if(null !== ($key = array_search($split[3], $tables)))
            {
                header('Content-Type: application/json');

                if (insert_row($key, $_GET))
                {
                    echo "{\"status\": \"success\"}\n";
                }
                else
                {
                    echo "{\"status\": \"failed\"}\n";
                }
                die();
            };
            break;
        }
        case "metadata":
        {
            if(isset($split[3]))
            {
                $meta = get_media_metadata($_GET);

                if (isset($meta))
                {
                    $m_new = array();
                    foreach (array_keys($meta) as $key)
                    {
                        if (array_key_exists($split[3], $meta[$key]))
                        {
                            $m_new[$key] = $meta[$key][$split[3]];
                        }
                    }
                    if (false == ($json = json_encode($m_new)))
                    {
                        echo "<pre>\n";
                        var_dump($m_new);
                        echo "</pre>\n";
                    }
                    else
                    {
                        header('Content-Type: application/json');
                        echo $json;
                    }

                    die();
                }
            }
            echo "<pre>\n";
            var_dump(get_media_metadata($_GET));
            echo "</pre>\n";
            die();
        }
        default:
            break;
    }
    // use a tree to store api commands and actions (functions)
    // as leaves
}

api_request_handler();

?>
