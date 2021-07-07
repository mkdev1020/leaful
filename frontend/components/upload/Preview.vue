<template>
    <div class="preview-container">
        <span class="preview-title">Live Preview</span>
    </div>
</template>
<script>

export default {
    
}
</script>
<style scoped>
.preview-container {
    width : 154px;
    height : 198px;
    border : 2px solid var(--col-preview-container-border);
    box-shadow: -5px 5px var(--col-preview-container-boxshadow);
    display: flex;
    align-items: center;
    justify-content: center;
}
.preview-title {
    font-family : "Nunito", sans-serif;
    font-size : 16px;
    font-weight : 900;
    color : var(--col-preview-title);
}
</style>