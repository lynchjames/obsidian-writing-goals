<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { wgcolors } from '../../stores/goal-store';
	import type { WritingGoalColors } from '../../../core/settings/colors';
	import type { WritingGoal } from '../../../core/goal-entity-types';

	export let path: string;
	export let goal: WritingGoal;
	export let goalData: {
		percent: number;
		dailyPercent: number;
		progress: number;
		dailyProgress: number;
	};
	export let colors: WritingGoalColors;
	export let onGoalClick: (path: string) => void;

	let goalColors: WritingGoalColors;

	onMount(() => {
		goalColors = colors;
	});

	const unsubColors = wgcolors.subscribe((val) => {
		goalColors = val;
	});

	onDestroy(unsubColors);

	function getLineCap(per: number) {
		return per < 95 ? 'round' : 'butt';
	}

	function getWordCount(goal: WritingGoal) {
		const count = goal.dailyGoalCount > 0 ? goal.wordCount - goal.startCount : goal.wordCount;
		return count.toLocaleString();
	}

	function getWordsText(goal: WritingGoal) {
		return goal.dailyGoalCount > 0 ? 'words today' : 'words';
	}

	function onClick() {
		onGoalClick(path);
	}
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<svg
	on:click={onClick}
	class="writing-goals"
	viewBox="0 0 200 200"
	version="1.1"
	xmlns="http://www.w3.org/2000/svg"
>
	<circle
		class="wg-background"
		fill={goalData.percent == 100 ? goalColors.successColor : goalColors.backgroundColor}
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
		stroke-linecap={getLineCap(goalData.percent)}
		stroke-dashoffset={goalData.progress}
	/>
	{#if goal.dailyGoalCount > 0}
		<circle
			class="wg-daily-background"
			fill={goalData.dailyPercent == 100 ? goalColors.successColor : goalColors.backgroundColor}
			r="75"
			cx="100"
			cy="100"
		/>
		<circle
			class="wg-daily-bar"
			r="75"
			cx="100"
			cy="100"
			transform="rotate(-90, 100, 100)"
			fill="transparent"
			stroke-dasharray="471.23"
			stroke-linecap={getLineCap(goalData.dailyPercent)}
			stroke={goalColors.dailyGoalColor}
			stroke-dashoffset={goalData.dailyProgress}
		/>
	{/if}
	<text
		class="note-goal-figure"
		fill={goalColors.textColor}
		stroke-width="0"
		x="100"
		y="100"
		id="svg_4"
		font-size="40"
		text-anchor="middle"
		xml:space="preserve"
		font-weight="bold">{getWordCount(goal)}</text
	>
	<text
		class="note-goal-text"
		fill={goalColors.textColor}
		stroke-width="0"
		x="100"
		y="140"
		id="svg_8"
		font-size="18"
		text-anchor="middle"
		xml:space="preserve">{getWordsText(goal)}</text
	>
</svg>

<style>
	.writing-goals-container {
		margin: auto;
		max-width: 400px;
		cursor: pointer;
	}

	.writing-goals {
		padding: 0 40px;
	}

	.writing-goals .wg-bar {
		stroke-width: 14px;
	}

	.writing-goals .wg-daily-bar {
		stroke-width: 10px;
	}

	.wg-daily-goal .writing-goals .wg-bar {
		stroke-width: 10px;
	}

	.wg-bar,
	.wg-simple .wg-bar {
		transition: stroke-dashoffset 0.5s linear;
	}

	.wg-daily-bar,
	.wg-daily-bar {
		transition: stroke-dashoffset 0.5s linear;
	}
</style>
