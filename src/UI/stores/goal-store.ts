import { writable } from "svelte/store";
import { GoalHistory } from "../../core/goal-history/history";
import { WritingGoalColors } from "../../core/settings/colors";
import { WritingGoals } from "../../core/goal-entities";

export const noteGoals = writable(new WritingGoals());
export const goalHistory = writable(new GoalHistory());
export const showGoalMessage = writable(true);
export const showProgressChart = writable(false);
export const wgcolors = writable(new WritingGoalColors());