import { writable } from 'svelte/store';

export const currentPath = writable('');

export const noteTitle = writable('');

export const wordCount = writable(0);

export const goalCount = writable(0);