import { HSL } from "obsidian";

export const GOAL_FRONTMATTER_KEY = "word-goal";
export const DAILY_GOAL_FRONTMATTER_KEY = "daily-word-goal";
export const WORD_COUNT_INCLUDE_FRONTMATTER_KEY = "wordcount";
export const VIEW_TYPE_GOAL = "writing-goal";
export const VIEW_TYPE_GOAL_SIMPLE = "writing-goal-simple";
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
export const GOAL_ICON_SVG = '<path d="M19.07 4.93A10 10 0 0 0 6.99 3.34"/><path d="M4 6h.01"/><path d="M2.29 9.62A10 10 0 1 0 21.31 8.35"/><path d="M16.24 7.76A6 6 0 1 0 8.23 16.67"/><path d="M12 18h.01"/><path d="M17.99 11.66A6 6 0 0 1 15.77 16.67"/><circle cx="12" cy="12" r="2"/><path d="m13.41 10.59 5.66-5.66"/>';