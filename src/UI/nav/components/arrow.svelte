<script lang="ts">
	export let direction: string;
	export let onClick: () => void;
	export let isMobile: boolean;
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
	class="arrow"
	class:is-mobile={isMobile}
	class:right={direction === 'right'}
	on:click={onClick}
>
	<svg focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"
		><path
			fill="currentColor"
			d="M34.52 239.03L228.87 44.69c9.37-9.37 24.57-9.37 33.94 0l22.67 22.67c9.36 9.36 9.37 24.52.04 33.9L131.49 256l154.02 154.75c9.34 9.38 9.32 24.54-.04 33.9l-22.67 22.67c-9.37 9.37-24.57 9.37-33.94 0L34.52 272.97c-9.37-9.37-9.37-24.57 0-33.94z"
		/></svg
	>
</div>

<style>
	.arrow {
		align-items: center;
		cursor: pointer;
		display: flex;
		justify-content: center;
		width: 24px;
	}

	.arrow.is-mobile {
		width: 32px;
	}

	.right {
		transform: rotate(180deg);
	}

	.arrow svg {
		color: var(--color-arrow);
		height: 16px;
		width: 16px;
	}
</style>
