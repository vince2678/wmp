DROP SCHEMA IF EXISTS media_player;
CREATE SCHEMA media_player;

USE media_player;

CREATE TABLE library(
    library_id int NOT NULL AUTO_INCREMENT,
    name varchar(100) NOT NULL,
    type enum("music", "video", "photo"),
    full_path varchar(1024) NOT NULL,
    update_interval int NOT NULL DEFAULT 3600,
    PRIMARY KEY (library_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

# add a bool to indicate if metadata on file vs in db differs
CREATE TABLE media(
    media_id int NOT NULL AUTO_INCREMENT,
    library_id int NOT NULL,
    CONSTRAINT FOREIGN KEY (library_id) REFERENCES library(library_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    title varchar(128) DEFAULT NULL,
    added_on timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_update timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    relative_path varchar(1024) NOT NULL,
    PRIMARY KEY (media_id),
    INDEX USING BTREE (library_id),
    INDEX USING BTREE (last_update),
    INDEX USING BTREE (relative_path)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE genre(
    genre_id int NOT NULL AUTO_INCREMENT,
    name varchar(128) NOT NULL,
    PRIMARY KEY (genre_id),
    INDEX USING BTREE (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

## audio track

CREATE TABLE artist(
    artist_id int NOT NULL AUTO_INCREMENT,
    name varchar(128) NOT NULL,
    PRIMARY KEY (artist_id),
    INDEX USING BTREE (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


CREATE TABLE music_album(
    album_id int NOT NULL AUTO_INCREMENT,
    artist_id int,
    name varchar(128) NOT NULL,
    genre_id int DEFAULT NULL,
    track_count int DEFAULT NULL,
    CONSTRAINT FOREIGN KEY (artist_id) REFERENCES artist (artist_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT FOREIGN KEY (genre_id) REFERENCES genre (genre_id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    PRIMARY KEY (album_id),
    INDEX USING BTREE (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE track(
    track_id int NOT NULL AUTO_INCREMENT,
    media_id int NOT NULL,
    album_id int NOT NULL,
    artist_id int DEFAULT NULL,
    track_number int DEFAULT NULL,
    play_count int NOT NULL DEFAULT 0,
    rating int NOT NULL DEFAULT 0, 
    duration int NOT NULL,
    CONSTRAINT FOREIGN KEY (media_id) REFERENCES media (media_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT FOREIGN KEY (artist_id) REFERENCES artist (artist_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT FOREIGN KEY (album_id) REFERENCES music_album (album_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    PRIMARY KEY (track_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

### photos

CREATE TABLE photo_album(
    album_id int NOT NULL AUTO_INCREMENT,
    name varchar(128) NOT NULL,
    PRIMARY KEY (album_id),
    INDEX USING BTREE (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

# other metadata?
CREATE TABLE photo(
    photo_id int NOT NULL AUTO_INCREMENT,
    media_id int NOT NULL,
    album_id int DEFAULT NULL,
    CONSTRAINT FOREIGN KEY (media_id) REFERENCES media (media_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT FOREIGN KEY (album_id) REFERENCES photo_album (album_id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    PRIMARY KEY (photo_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

### videos

CREATE TABLE video(
    video_id int NOT NULL AUTO_INCREMENT,
    media_id int NOT NULL,
    genre_id int DEFAULT NULL,
    play_count int NOT NULL DEFAULT 0,
    duration int NOT NULL,
    CONSTRAINT FOREIGN KEY (media_id) REFERENCES media (media_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT FOREIGN KEY (genre_id) REFERENCES genre (genre_id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    PRIMARY KEY (video_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

## playlists

CREATE TABLE playlist(
    playlist_id int NOT NULL AUTO_INCREMENT,
    name varchar(128) NOT NULL,
    PRIMARY KEY (playlist_id),
    INDEX USING BTREE (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE playlist_track(
    playlist_id int NOT NULL,
    media_id int NOT NULL,
    CONSTRAINT FOREIGN KEY (playlist_id) REFERENCES playlist (playlist_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT FOREIGN KEY (media_id) REFERENCES media (media_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT UNIQUE INDEX playlist_media_id (playlist_id, media_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;