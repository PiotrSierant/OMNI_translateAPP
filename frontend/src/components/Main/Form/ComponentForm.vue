<template>
        <section>
            <section class="section_choice">
                <label for="select" class="left_section">
                    <select v-model="childLang" @change="updateSelect()">
                        <option selected disabled>Choose language</option>
                        <option v-for="langObject in languages" :key="langObject.short"
                            :value="langObject.name" :disabled="langObject.isDone">
                            {{
                                    langObject.name
                            }}
                        </option>
                    </select>
                </label>
                <section class="right_section">
                    <p v-show="lang !== 'Choose language'">Your choice: <span>{{ lang }}</span></p>
                </section>
            </section>
            <section class="btn_spinner_section">
                <b-spinner variant="primary" v-if="loader" class="spinner"></b-spinner>
                <button :disabled="lang === 'Choose language'" class="btn_form margin" v-else>Generate <font-awesome-icon icon="fa-solid fa-file-circle-plus" /></button>
            </section>
        </section>
</template>

<script>
export default {
    name: 'ComponentForm',
    data: () => {
        return {
            childLang: 'Choose language' || this.lang,

        }
    },

    props: {
        getValue: {
            type: Function,
            default() {
                return ''
            }
        }, 
        languages: {
            type: [String, Array],
            default() {
                return []
            }
        },
        lang: {
            type: String,
            default() {
                return 'Choose language'
            }
        },
        loader: {
            type: Boolean,
            default() {
                return false;
            }
        }
    },

    methods: {
        updateSelect() {
            this.$emit('selectValue', this.childLang);
        },
    },
};
</script>

<style lang="scss" scoped>
.btn_spinner_section {
    display: flex;
    .spinner {
        margin-top: 1rem;
        margin-left: 3.5rem;
        padding: 1rem;
    }
}

.section_choice {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 1rem;

}

.left_section {
    display: flex;
    justify-content: center;
    align-self: center;
}

.right_section {
    display: flex;
    justify-content: center;
    align-items: center;

    p {
        margin: auto;

        span {
            font-size: 1.1rem;
            font-weight: 700;
        }
    }
}
.btn_form {
    width: 156px;
    height: 100%;
    padding: .5rem;
    align-self: flex-start;
    border-radius: 5px;
    outline: none;
    border: none;
    border: 2px solid #333;
    transition: all .3s ease-in-out;
    color: #383d41;
    background-color: #e2e3e5;
    border-color: #d6d8db;

    &:hover {
        color: #004085;
        background-color: #cce5ff;
        border-color: #b8daff;
    }

    &:disabled {
        cursor: not-allowed;

        &:hover {
            color: #721c24;
            background-color: #f8d7da;
            border-color: #f5c6cb;
        }
    }
}
.margin {
    margin: 1rem 0;
}
select {
    padding: 5px;
    border-radius: 4px;
}
</style>