import { writable } from 'svelte/store';
import { Notes } from '../note-goal';
import { GoalHistory } from '../goal-history/history';

export const noteGoals = writable(new Notes());
export const goalHistory = writable(new GoalHistory());
export const showGoalMessage = writable(true);
export const showProgressChart = writable(false);
export const goalColor = writable("");
export const dailyGoalColor = writable("");