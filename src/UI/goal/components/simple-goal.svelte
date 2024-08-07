<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { wgcolors, noteGoals } from '../../stores/goal-store';
	import type { WritingGoalColors } from '../../../core/settings/colors';
	import { WritingGoals } from '../../../core/goal-entities';
	import type { WritingGoal } from '../../../core/goal-entity-types';

	export let path: string;
	export let colors: WritingGoalColors;

	let goals: WritingGoals;
	let keys: string[];
	let goal: WritingGoal;
	let percent: number = 0;
	let dailyPercent: number = 0;
	let progress: number = 0;
	let dailyProgress: number = 0;
	let simpleDailyProgress: number = 0;
	let goalColors: WritingGoalColors;

	onMount(() => {
		goalColors = colors;
	});

	const unsubNoteGoals = noteGoals.subscribe((val) => {
		if (!val[path]) {
			return;
		}
		goals = val;
		goal = goals[path];
		keys = Object.keys(goals);
		loadGoal();
	});

	const unsubColors = wgcolors.subscribe((val) => {
		goalColors = val;
	});

	onDestroy(unsubNoteGoals);
	onDestroy(unsubColors);

	function loadGoal() {
		percent = getPercent(goal.wordCount, goal.goalCount);
		dailyPercent = getPercent(getDailyDifference(goal), goal.dailyGoalCount);
		progress = calculateProgress(90, percent);
		dailyProgress = calculateProgress(75, dailyPercent);
		simpleDailyProgress = calculateProgress(50, dailyPercent);
	}

	function calculateProgress(rad, per) {
		let c = Math.PI * (rad * 2);

		if (per < 0) {
			per = 0;
		}
		if (per > 100) {
			per = 100;
		}

		return ((100 - per) / 100) * c;
	}

	function getPercent(words, goal) {
		if (goal == 0) {
			return 0;
		}
		let per = (words / goal) * 100;
		if (per < 0) {
			per = 0;
		}
		if (per > 100) {
			per = 100;
		}
		return per;
	}

	function getPercentText(percent: number, dailyPercent: number) {
		const isDaily = goal.dailyGoalCount > 0;
		const prefix = isDaily ? 'Daily goal' : 'Goal';
		const figure = isDaily ? dailyPercent : percent;
		return `${prefix} ${figure.toFixed(0)}% complete`;
	}

	function getLineCap(per: number) {
		return per < 95 ? 'round' : 'butt';
	}

	function getDailyDifference(goal) {
		return goal.wordCount - goal.startCount;
	}
</script>

<div
	class="writing-goals-simple-container"
	data-path={path}
	title={getPercentText(percent, dailyPercent)}
>
	<svg
		class="writing-goals-simple"
		viewBox="0 0 200 200"
		fill={goalColors.backgroundColor}
		version="1.1"
		xmlns="http://www.w3.org/2000/svg"
	>
		<circle
			class="wg-background"
			fill={percent == 100 ? goalColors.successColor : goalColors.backgroundColor}
			r="100"
			cx="100"
			cy="100"
		/>
		<circle
			class="wg-bar"
			r="90"
			cx="100"
			cy="100"
			transform="rotate(-90, 100, 100)"
			fill="transparent"
			stroke={goalColors.goalColor}
			stroke-dasharray="565.48"
			stroke-linecap={getLineCap(percent)}
			stroke-dashoffset={progress}
		/>
		{#if goal.dailyGoalCount > 0}
			<circle
				r="50"
				class="wg-daily-background"
				fill={dailyPercent == 100 ? goalColors.successColor : goalColors.backgroundColor}
				cx="100"
				cy="100"
			/>
			<circle
				class="wg-daily-bar"
				r="50"
				cx="100"
				cy="100"
				transform="rotate(-90, 100, 100)"
				fill="transparent"
				stroke-dasharray="314.15"
				stroke-linecap={getLineCap(dailyPercent)}
				stroke={goalColors.dailyGoalColor}
				stroke-dashoffset={simpleDailyProgress}
			/>
		{/if}
	</svg>
</div>

<style>
	.writing-goals-simple-container {
		align-self: center;
		flex: 1;
		margin: -10px 0 0 auto;
		max-width: 25px;
		min-width: 25px;
		max-height: 15px;
		min-height: 15px;
		order: 8;
		transition: max-width cubic-bezier(0.25, 0.46, 0.45, 0.94);
	}

	.writing-goals-simple .wg-bar {
		stroke-width: 22px;
	}

	.writing-goals-simple .wg-daily-bar {
		stroke-width: 22px;
	}

	.wg-simple .wg-bar {
		transition: stroke-dashoffset 0.5s linear;
	}

	.wg-goals-simple .wg-daily-bar {
		transition: stroke-dashoffset 0.5s linear;
	}
</style>
