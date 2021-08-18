<template>
    <div class="preview-container">
        <span v-if="!src" class="preview-title">Live Preview</span>
        <img v-else :src="src.base64"/>
    </div>
</template>
<script>

export default {
    props : ["src"]
}
</script>
<style scoped>
.preview-container {
    width : 154px;
    height : 198px;
    border : 2px solid var(--col-preview-container-border);
    box-shadow: -5px 5px var(--col-preview-container-boxshadow);
    display : flex;
    align-items : center;
    justify-content : center;
    cursor : pointer;
}
.preview-title {
    font-family : "Nunito", sans-serif;
    font-size : 16px;
    font-weight : 900;
    color : var(--col-preview-title);
}
.preview-container img {
    width : 100%;
    height : 100%;
}
</style>