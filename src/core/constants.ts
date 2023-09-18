import { HSL } from "obsidian";

export const GOAL_FRONTMATTER_KEY = "word-goal";
export const DAILY_GOAL_FRONTMATTER_KEY = "daily-word-goal";
export const WORD_COUNT_INCLUDE_FRONTMATTER_KEY = "wordcount";
export const VIEW_TYPE_GOAL = "writing-goal";
export const VIEW_TYPE_GOAL_SIMPLE = "writing-goal-simple";
export const VIEW_TYPE_GOAL_SPRINT = "writing-goal-sprint";
export const VIEW_TYPE_STATS = "writing-goal-stats";
export const VIEW_TYPE_STATS_DETAIL = "writing-goal-stats-detail";
export const VIEW_TYPE_FILE_EXPLORER = "file-explorer"

export const REMOVE_GOAL_ICON = "lucide-x";
export const LABEL_PATH_DATA_ATTR = "data-path";

export const GOAL_BAR_COLOR_HSL: HSL = {h:254, s:80, l:64.2};
export const GOAL_BAR_COLOR = "var(--interactive-accent)";
export const DAILY_GOAL_BAR_COLOR = "var(--text-warning)";
export const GOAL_TEXT_COLOR = "var(--text-normal)";
export const GOAL_BACKGROUND_COLOR = "var(--background-primary)";
export const GOAL_SUCCESS_COLOR = "var(--background-modifier-success)";

export const DEFAULT_GOAL_HISTORY_PATH =
  "goal-history.json";

export const GOAL_ICON = "writing-goals-radar";
export const GOAL_ICON_SVG = 
'<path style="stroke-width:2;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;" d="M 19.069688 4.930312 C 15.868125 1.725 10.911562 1.0725 6.99 3.340313 " transform="matrix(4.166667,0,0,4.166667,0,0)"/>\
<path style="stroke-width:2;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;" d="M 4.000312 6 L 4.009688 6 " transform="matrix(4.166667,0,0,4.166667,0,0)"/>\
<path style="stroke-width:2;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;" d="M 2.290312 9.619687 C 1.260938 13.81125 3.036563 18.189375 6.694687 20.479688 C 10.352812 22.77 15.0675 22.455937 18.388125 19.699687 C 21.70875 16.943437 22.887187 12.3675 21.310312 8.350312 " transform="matrix(4.166667,0,0,4.166667,0,0)"/>\
<path style="stroke-width:2;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;" d="M 16.240312 7.759688 C 14.671875 6.182812 12.36 5.6025 10.23375 6.25125 C 8.106562 6.900937 6.512812 8.67375 6.092812 10.857188 C 5.672813 13.041562 6.495938 15.278437 8.230313 16.669687 " transform="matrix(4.166667,0,0,4.166667,0,0)"/>\
<path style="stroke-width:2;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;" d="M 12 18 L 12.010312 18 " transform="matrix(4.166667,0,0,4.166667,0,0)"/>\
<path style="stroke-width:2;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;" d="M 17.989687 11.659688 C 18.100312 13.59 17.274375 15.455625 15.769687 16.669687 " transform="matrix(4.166667,0,0,4.166667,0,0)"/>\
<path style="stroke-width:2;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;" d="M 13.999688 12 C 13.999688 13.104375 13.104375 13.999688 12 13.999688 C 10.895625 13.999688 10.000312 13.104375 10.000312 12 C 10.000312 10.895625 10.895625 10.000312 12 10.000312 C 13.104375 10.000312 13.999688 10.895625 13.999688 12 Z M 13.999688 12 " transform="matrix(4.166667,0,0,4.166667,0,0)"/>\
<path style="stroke-width:2;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;" d="M 13.41 10.59 L 19.069688 4.930312 " transform="matrix(4.166667,0,0,4.166667,0,0)"/>';