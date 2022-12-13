<template>
    <section class="container_main">
        <h2 class="title">Add a new translation object</h2>
        <ComponentTranslate />
    </section>
</template>
<script>
import ComponentTranslate from '@/components/Main/ComponentTranslate.vue';
export default {
    name: 'ComponentAddNewLanguages',
    components: {
        ComponentTranslate,
    }
};
</script>
<style lang="scss" scoped>
.title {
    margin: 1rem 0;
    padding: 8px;
}
.container_main {
    width: 100%;
    display: flex;
    flex-direction: column;
}
</style>