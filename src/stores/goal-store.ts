import { writable } from 'svelte/store';
import { Notes } from '../note-goal';

export const noteGoals = writable(new Notes());
export const showGoalMessage = writable(true);
export const goalColor = writable("");
export const dailyGoalColor = writable("");