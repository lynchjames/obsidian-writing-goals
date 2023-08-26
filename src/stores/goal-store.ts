import { writable } from 'svelte/store';
import { Notes } from './note-goal';

export const noteGoals = writable(new Notes());