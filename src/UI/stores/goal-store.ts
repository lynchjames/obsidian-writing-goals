import { writable } from 'svelte/store';
import { Notes } from '../../core/note-goal';
import { GoalHistory } from '../../core/goal-history/history';

export const noteGoals = writable(new Notes());
export const goalHistory = writable(new GoalHistory());
export const showGoalMessage = writable(true);
export const showProgressChart = writable(false);
export const goalColor = writable("");
export const dailyGoalColor = writable("");