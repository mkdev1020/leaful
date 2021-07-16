<template>
    <label class="checkbox">
        <span class="checkbox-input">
            <span :class="{'checkbox-control' : 1, 'checked' : checked}">
                <svg xmlns='http://www.w3.org/2000/svg'
                     viewBox='0 0 24 24'
                     aria-hidden="true"
                     focusable="false">
                        <path fill='none' 
                              stroke='currentColor'
                              stroke-width='3' d='M1.73 12.91l6.37 6.37L22.79 4.59' />
                </svg>
            </span>
        </span>
    </label>
</template>
<script>

export default{
    props : ["checked"]
}
</script>

<style>

:root {
    --color: #10D2FF;
    --disabled: #959495;
}
.checkbox {
    display: grid;
    grid-template-columns: min-content auto;
    grid-gap: 0.5em;
    font-size: 1.5rem;
    color: var(--color);
}
.checkbox:disabled {
    color: var(--disabled);
}
.checkbox-control {
    display: inline-grid;
    width: 1em;
    height: 1em;
    border-radius: 0.25em;
    border: 0.1em solid #E9EFF4;
}
.checkbox-control svg {
    transition: transform 0.1s ease-in 25ms;
    transform: scale(0);
    transform-origin: bottom left;
  }

.checkbox-input {
    display: grid;
    grid-template-areas: "checkbox";
}
.checkbox-input > * {
    grid-area: checkbox;
}
input[type='checkbox'] {
    position : absolute;
    opacity: 0;
    width: 2em;
    height: 2em;
}
.checkbox-control.checked {
    border-color: currentColor;
}
.checkbox-control.checked svg {
    transform: scale(1);
}

.checkbox-control.disabled {
    color: var(--disabled);
}

</style>