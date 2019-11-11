'use strict';

const PLAYER_SIZE_HIDDEN = "hidden"; //player not visible
const PLAYER_SIZE_SMALL = "small"; //small preview in bottom/left bar
const PLAYER_SIZE_NORMAL = "normal"; //all bars open
const PLAYER_SIZE_WIDE = "wide"; //no left bar
const PLAYER_SIZE_LARGE = "large"; //no top, left bar
const PLAYER_SIZE_FULL = "fullscreen";

const NAV_OPEN = "open";
const NAV_CLOSED = "closed";

const REPEAT_NONE = 0;
const REPEAT_ALL = 1;
const REPEAT_ONE = 2;

const REPEAT_MODES = ["none", "all", "one"];

var global_player_state = { };

/* css selectors */
const SELECTOR_TOP_NAV ='#top_nav';

const SELECTOR_LEFT_NAV = '#left_nav';
const SELECTOR_LIBRARY_LIST = '#left_nav #libraries #listing';
const SELECTOR_MEDIA_TYPE_LIST = '#left_nav #media_groups #listing';
const SELECTOR_PLAYLIST_LIST = '#left_nav #playlists #listing';
const SELECTOR_LEFT_NAV_TOGGLE ='.leftnavbtn';

const SELECTOR_CONTENT = '#content';
const SELECTOR_RESCAN_BTN = "button#library_rescan";

const SELECTOR_MEDIA_PLAYER = '#media_player';
const SELECTOR_MEDIA_PLAYER_FULLSCREEN ='#media_player #media_fullscreen';
const SELECTOR_MEDIA_PLAYER_RESIZE ='#media_player #media_resize';

const SELECTOR_SEEK_BAR = '#media_player #seek_bar';
const SELECTOR_CONTENT_PREVIEW = '#media_player #content_preview';
const SELECTOR_MEDIA_ELEMENT = '#content_preview .media_element';

const SELECTOR_MEDIA_DURATION = "#bottom_controls #media_time_duration";
const SELECTOR_MEDIA_TIME_ELAPSED = "#bottom_controls #media_time_elapsed";
const SELECTOR_MEDIA_PLAY_PAUSE = '#bottom_controls #media_play_pause';
const SELECTOR_MEDIA_SHUFFLE = "#bottom_controls #media_shuffle";
const SELECTOR_MEDIA_MUTE = "#bottom_controls #media_mute";
const SELECTOR_MEDIA_PREVIOUS = "#bottom_controls #media_previous";
const SELECTOR_MEDIA_NEXT = "#bottom_controls #media_next";
const SELECTOR_MEDIA_REPEAT = '#bottom_controls #media_repeat';

const SELECTOR_ACTIVE_LIST_ITEM = "#listing > span.active";
const SELECTOR_ACTIVE_CONTENT_ITEM = "#content_table_row.active";
