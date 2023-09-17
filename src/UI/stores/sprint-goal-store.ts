import { writable } from "svelte/store";
import { WritingSprintGoals } from "../../core/goal-entities";

export const sprintGoals = writable(new WritingSprintGoals());