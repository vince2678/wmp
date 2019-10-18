DROP SCHEMA IF EXISTS media_player;
CREATE SCHEMA media_player;

USE media_player;

CREATE TABLE library(
    library_id int NOT NULL AUTO_INCREMENT,
    name varchar(100) NOT NULL,
    type enum("music", "video", "photo"),
    path varchar(1024) NOT NULL,
    update_interval int NOT NULL DEFAULT 3600,
    PRIMARY KEY (library_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

# add a bool to indicate if metadata on file vs in db differs
CREATE TABLE r_media(
    media_id int NOT NULL AUTO_INCREMENT,
    library_id int NOT NULL,
    CONSTRAINT FOREIGN KEY (library_id) REFERENCES library(library_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    added_on timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_update timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    relative_path varchar(1024) NOT NULL,
    PRIMARY KEY (media_id),
    INDEX USING BTREE (library_id),
    INDEX USING BTREE (last_update),
    INDEX USING BTREE (relative_path)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE VIEW media AS
    SELECT
        library.library_id,
        library.name as library_name,
        library.type as library_type,
        library.path as library_path,
        library.update_interval,
        r_media.media_id,
        r_media.added_on,
        r_media.last_update,
        r_media.relative_path,
        CONCAT(library.path, "/", relative_path) as full_path
    FROM library JOIN r_media
        ON r_media.library_id=library.library_id;

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


CREATE TABLE r_music_album(
    album_id int NOT NULL AUTO_INCREMENT,
    artist_id int,
    name varchar(128) NOT NULL,
    track_count int DEFAULT NULL,
    CONSTRAINT FOREIGN KEY (artist_id) REFERENCES artist (artist_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    PRIMARY KEY (album_id),
    INDEX USING BTREE (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE VIEW music_album AS
    SELECT
        r_music_album.album_id,
        r_music_album.artist_id,
        r_music_album.name as album,
        r_music_album.track_count as track_count,
        artist.name as artist
    FROM r_music_album
        JOIN artist ON r_music_album.artist_id=artist.artist_id;

CREATE TABLE r_track(
    track_id int NOT NULL AUTO_INCREMENT,
    media_id int NOT NULL,
    album_id int NOT NULL,
    artist_id int DEFAULT NULL,
    genre_id int DEFAULT NULL,
    title varchar(128) DEFAULT NULL,
    track_number int DEFAULT NULL,
    play_count int NOT NULL DEFAULT 0,
    rating int NOT NULL DEFAULT 0, 
    duration int NOT NULL,
    CONSTRAINT FOREIGN KEY (media_id) REFERENCES r_media (media_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT FOREIGN KEY (artist_id) REFERENCES artist (artist_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT FOREIGN KEY (genre_id) REFERENCES genre (genre_id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT FOREIGN KEY (album_id) REFERENCES r_music_album (album_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    PRIMARY KEY (track_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE VIEW track AS
    SELECT
        r_track.*,
        music_album.artist_id AS album_artist_id,
        artist.name AS artist,
        music_album.artist AS album_artist,
        music_album.album,
        genre.name AS genre
    FROM r_track
    JOIN artist ON artist.artist_id=r_track.artist_id
    JOIN music_album on music_album.album_id=r_track.album_id
    JOIN genre ON genre.genre_id=r_track.genre_id;

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
    title varchar(128) DEFAULT NULL,
    CONSTRAINT FOREIGN KEY (media_id) REFERENCES r_media (media_id)
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
    title varchar(128) DEFAULT NULL,
    play_count int NOT NULL DEFAULT 0,
    duration int NOT NULL,
    CONSTRAINT FOREIGN KEY (media_id) REFERENCES r_media (media_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT FOREIGN KEY (genre_id) REFERENCES genre (genre_id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    PRIMARY KEY (video_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

## playlists

CREATE TABLE playlist(
    playlist_id int NOT NULL AUTO_INCREMENT,
    name varchar(128) NOT NULL,
    type enum("music", "video", "photo", "none") NOT NULL DEFAULT 'music',
    PRIMARY KEY (playlist_id),
    INDEX USING BTREE (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE playlist_media(
    playlist_id int NOT NULL,
    media_id int NOT NULL,
    rank int NOT NULL DEFAULT 1,
    CONSTRAINT FOREIGN KEY (playlist_id) REFERENCES playlist (playlist_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT FOREIGN KEY (media_id) REFERENCES r_media (media_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT UNIQUE INDEX playlist_media_id (playlist_id, media_id),
    INDEX USING BTREE (rank)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
