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
