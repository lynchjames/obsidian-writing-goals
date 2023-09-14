import { writable } from 'svelte/store';
import { Notes } from '../../core/note-goal';
import { GoalHistory } from '../../core/goal-history/history';
import { WritingGoalColors } from '../../core/settings/colors';

export const noteGoals = writable(new Notes());
export const goalHistory = writable(new GoalHistory());
export const showGoalMessage = writable(true);
export const showProgressChart = writable(false);
export const wgcolors = writable(new WritingGoalColors());