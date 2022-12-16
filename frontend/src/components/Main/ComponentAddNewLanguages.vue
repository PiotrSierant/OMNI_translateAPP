<template>
    <section class="container_main">
        <h2 class="title">OMNI Translation Helper</h2>
        <ComponentTranslate />
    </section>
</template>
<script>
import ComponentTranslate from '@/components/Main/ComponentTranslate.vue';

export default {
    name: 'ComponentAddNewLanguages',
    components: {
        ComponentTranslate,
    },
};
</script>
<style lang="scss" scoped>
.title {
    margin: 1rem 0;
    padding: 8px;
    color: #0044ff;
}
.container_main {
    width: 100%;
    display: flex;
    flex-direction: column;
}
</style>