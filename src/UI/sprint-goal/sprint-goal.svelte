<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { noteGoals, wgcolors } from '../stores/goal-store';
	import { WritingGoalColors } from '../../core/settings/colors';
	import { WritingGoal, WritingSprintGoal } from '../../core/goal-entities';
	import { getPercent, calculateProgress } from '../goal/progress-helper.js';
	import { sprintGoals } from '../stores/sprint-goal-store';

	export let path: string;
	export let goal: WritingSprintGoal;
	export let colors: WritingGoalColors;
	export let onGoalClick: (path: string) => void;
	export let onSprintReset: () => void;

	enum PlayState {
		Paused,
		Running,
		Reset
	}

	let sprintGoal: WritingSprintGoal;
	let percent: number = 0;
	let progress: number = 565.48;
	let sprintPercent: number = 0;
	let sprintProgress: number = 471.23;
	let goalColors: WritingGoalColors;
	let secondsRemaining: number;
	let minutesRemaining: number;
	let seconds: number = -15;
	let timerInterval: any;
	let timerRunningState = PlayState.Reset;

	$: getSecondsClass(timerRunningState);

	onMount(() => {
		goalColors = colors;
		sprintGoal = goal;
	});

	const unsubSprintGoals = sprintGoals.subscribe((val) => {
		if (!val[path]) {
			return;
		}
		sprintGoal = val[path];
	});

	const unsubGoalColor = wgcolors.subscribe((val) => {
		goalColors = val;
	});

	onDestroy(unsubSprintGoals);
	onDestroy(unsubGoalColor);

	function onClickStart() {
		if (timerRunningState == PlayState.Reset) {
			resetTimer();
		}
		timerRunningState = PlayState.Running;
	}

	function onClickPause() {
		timerRunningState = PlayState.Paused;
	}

	function onClickReset() {
		timerRunningState = PlayState.Reset;
		onSprintReset();
	}

	timerInterval = window.setInterval(() => {
		updateProgress();
	}, 1000);

	function onTimerEnd() {
		resetTimer();
	}

	function resetTimer() {
		timerRunningState = PlayState.Reset;
		secondsRemaining = sprintGoal.sprintMinutes * 60;
	}

	function updateProgress() {
		if (timerRunningState != PlayState.Running) {
			return;
		}
		secondsRemaining--;
		minutesRemaining = secondsRemaining / 60 - 1;
		const sprintGoalInSeconds = sprintGoal.sprintMinutes * 60;
		percent = getPercent(sprintGoalInSeconds - secondsRemaining, sprintGoalInSeconds);
		progress = calculateProgress(90, percent);
		sprintPercent = getPercent(getSprintDifference(sprintGoal), sprintGoal.sprintGoalCount);
		sprintProgress = calculateProgress(75, sprintPercent);
		if (percent == 100) {
			onTimerEnd();
		}
	}

	function getLineCap(per: number) {
		return per < 95 ? 'round' : 'butt';
	}

	function getSprintDifference(sprintGoal) {
		if (goal == null || sprintGoal == null) {
			return 0;
		}
		return sprintGoal.wordCount - sprintGoal.startCount;
	}

	function getCompletedClass(percent) {
		return percent == 100 ? 'note-goal-completed' : '';
	}

	function getDailyCompletedClass(dailyPercent) {
		return dailyPercent == 100 ? 'daily-note-goal-completed' : '';
	}

	function getSecondsClass(state: PlayState) {
		const classSuffix = ['paused', 'running', 'reset'][state];
		return `seconds-${classSuffix}`;
	}

	function getWordCount(sprintGoal: WritingSprintGoal) {
		const count = getSprintDifference(sprintGoal);
		return count.toLocaleString();
	}

	function getColorStyle(color: string) {
		return `color: ${color}`;
	}

	function getStartButtonText(state: PlayState) {
		return state == PlayState.Paused ? 'Resume' : 'Start';
	}

	function onClick() {
		onClickPause();
		onGoalClick(path);
	}
</script>

{#if goal && sprintGoal.sprintGoalCount > 0}
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<div class="writing-goals-container {sprintGoal.sprintGoalCount > 0 ? 'wg-daily-goal' : ''}">
		<svg
			on:click={onClick}
			class="writing-goals {getCompletedClass(percent)}"
			viewBox="0 0 200 200"
			version="1.1"
			xmlns="http://www.w3.org/2000/svg"
		>
			<circle
				class="wg-background {getCompletedClass(percent)}"
				fill={goalColors.backgroundColor}
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
				stroke-linecap="butt"
				stroke-dashoffset={progress}
			/>
			<line
				x1="0"
				y1="85"
				x2="0"
				y2="100"
				class="time-marker"
				style="transform: translate(100px, 100px) rotate(calc(({percent} * 3.6deg) - 180deg));"
			/>
			<circle
				class="wg-daily-background {getDailyCompletedClass(sprintPercent)}"
				fill={goalColors.backgroundColor}
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
				stroke-linecap={getLineCap(sprintPercent)}
				stroke={goalColors.dailyGoalColor}
				stroke-dashoffset={sprintProgress}
			/>
			<line
				x1="3"
				y1="0"
				x2="90"
				y2="0"
				class={getSecondsClass(timerRunningState)}
				style="--start-seconds: {seconds}"
			/>
			<circle cx="100" cy="100" r="3" class="pin" />
			<text
				class="note-goal-text"
				stroke-width="0"
				fill={goalColors.textColor}
				x="100"
				y="90"
				id="svg_4"
				font-size="40"
				text-anchor="middle"
				xml:space="preserve"
				font-weight="bold">{getWordCount(sprintGoal)}</text
			>
			<text
				class="note-goal-text"
				stroke-width="0"
				fill={goalColors.textColor}
				x="100"
				y="140"
				id="svg_8"
				font-size="16"
				text-anchor="middle"
				xml:space="preserve">words in sprint</text
			>
		</svg>
		<div class="spring-goal-controls">
			<button class="lucide-play mod-cta" on:click={onClickStart}>{getStartButtonText(timerRunningState)}</button>
			<button on:click={onClickPause}>Pause</button>
			<button class="mod-warning" on:click={onClickReset}>Reset</button>
		</div>
		{#if timerRunningState == PlayState.Reset}
			<h3>
				<span style={getColorStyle(colors.dailyGoalColor)}>
					{sprintGoal.sprintGoalCount.toLocaleString()} word goal
				</span>
			</h3>
			<h3>
				<span style={getColorStyle(colors.goalColor)}>
					{sprintGoal.sprintMinutes} minute sprint
				</span>
			</h3>
		{/if}
		{#if goal && minutesRemaining && (timerRunningState == PlayState.Running || timerRunningState == PlayState.Paused)}
			<h3>
				{getWordCount(sprintGoal)} of
				<span style={getColorStyle(colors.dailyGoalColor)}>
					{sprintGoal.sprintGoalCount.toLocaleString()} word goal
				</span>
			</h3>
			<h3>
				{minutesRemaining > 0 ? minutesRemaining.toFixed(0) : 0}:{(secondsRemaining % 60)
					.toString()
					.padStart(2, '0')}
				left in
				<span style={getColorStyle(colors.goalColor)}>
					{sprintGoal.sprintMinutes} minute sprint
				</span>
			</h3>
		{/if}
	</div>
{/if}

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
		stroke-width: 18px;
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

	.seconds-paused,
	.seconds-running,
	.seconds-reset {
		stroke-width: 1;
		stroke: var(--text-error);
		transform: translate(100px, 100px) rotate(calc((var(--start-seconds) * 6deg)));
		transition: transform 0.1s linear;
		animation: rotateSecondsHand 60s steps(60) infinite;
	}

	.seconds-paused {
		animation-play-state: paused;
	}

	.seconds-running {
		animation-play-state: running;
	}

	.seconds-reset {
		animation: unset;
	}

	.pin {
		fill: transparent;
		stroke: var(--text-error);
		stroke-width: 0.8;
	}

	.time-marker {
		stroke: var(--text-error);
		stroke-width: 3;
		transform: translate(100px, 100px);
		transition: transform 0.5s linear;
	}

	@keyframes rotateSecondsHand {
		from {
			transform: translate(100px, 100px) rotate(calc(var(--start-seconds) * 6deg));
		}
		to {
			transform: translate(100px, 100px) rotate(calc((var(--start-seconds) * 6deg) + 360deg));
		}
	}

	.spring-goal-controls {
		background-color: var(--background-primary);
		border-radius: 8px;
		display: flex;
		height: auto;
		justify-content: space-around;
		margin: 16px auto;
		padding: 8px;
		text-align: center;
		width: 90%;
	}

	h3 {
		color: var(--color-text-title);
		text-align: center;
		font-size: 1em;
		margin: 4px 0;
	}
</style>
