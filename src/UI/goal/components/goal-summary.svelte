<script lang="ts">
	import { onDestroy } from 'svelte';
	import { showGoalMessage } from '../../stores/goal-store';
	import type { WritingGoalColors } from '../../../core/settings/colors';
	import { WritingGoal } from '../../../core/goal-entities';

	export let goal: WritingGoal;
	export let goalData: {
		percent: number;
		dailyPercent: number;
		progress: number;
		dailyProgress: number;
	};
	export let colors: WritingGoalColors;

	let showMessage: boolean = true;

	function getOverallGoalCountText(goal: WritingGoal) {
		return goal.wordCount.toLocaleString() + ' of';
	}

	const unsubNShowGoalMessage = showGoalMessage.subscribe((val) => {
		showMessage = val;
	});

	onDestroy(unsubNShowGoalMessage);

	function getColorStyle(color: string) {
		return `color: ${color}`;
	}
</script>

{#if showMessage}
	{#if goal.goalCount > 0}
		<h3>
			{#if goalData.percent >= 100}
				{goal.goalCount.toLocaleString()}
				<span class="note-goal" style="{getColorStyle(colors.successColor)}">word goal completed!</span>
			{:else}
				{getOverallGoalCountText(goal)}
				{goal.goalCount.toLocaleString()}&nbsp;<span
					class="note-goal"
					style={getColorStyle(colors.goalColor)}>word goal</span
				>
			{/if}
		</h3>
	{/if}
	{#if goal.dailyGoalCount > 0}
		<h3>
			{#if goalData.dailyPercent >= 100}
				{goal.dailyGoalCount.toLocaleString()}
				<span class="note-daily-goal" style="{getColorStyle(colors.successColor)}">daily word goal completed!</span>
			{:else}
				{goal.dailyGoalCount.toLocaleString()}
				<span class="note-daily-goal" style={getColorStyle(colors.dailyGoalColor)}
					>daily word goal</span
				>
			{/if}
		</h3>
	{/if}
{/if}

<style>
	h3 {
		color: var(--color-text-title);
		text-align: center;
		font-size: 1em;
		margin: 4px 0;
	}
</style>
