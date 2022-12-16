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
        <p class="info">If your file is less than 10000 characters</p>
        <section class="btn_spinner_section">
            <b-spinner variant="primary" v-if="loader" class="spinner"></b-spinner>
            <button :disabled="lang === 'Choose language'" class="btn_form margin" v-else>Generate <font-awesome-icon icon="fa-solid fa-file-circle-plus" /></button>
            <p class="howMany">Your file have: <span :class="[counterValue > 10000 ? 'wrong' : 'correct',]">{{ counterValue }}</span> characters</p>
        </section>
    </section>
</template>

<script>
import axios from 'axios';
export default {
    name: 'ComponentForm',
    data: () => {
        return {
            childLang: 'Choose language' || this.lang,
            axios,
            count: [],
            isEnabled: false,
        }
    },
    created() {
        this.howMany();
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
        async howMany() {
            await this.axios({
                method: 'get',
                url: `http://localhost:3000/howmany`,
            })
                .then((response) => { 
                    this.count = response.data;
                })
                .catch((error) => { console.log(error); });
        },
    },
    computed: {
        counterValue() {
            let counter = 0;
            this.count.forEach(element => {
                counter += element.length;
            });
            return counter
        },
    }
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
.info {
        margin: auto;
        padding: 5px;
        color: #721c24;
        background-color: #f8d7da;
        border: 1px solid #721c24;
        border-radius: 5px;
        margin-top: 1rem;
        text-align: center;
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
.howMany {
    padding: 5px;
    margin: auto 0;
}
.wrong {
    color: #721c24;
    background-color: #f8d7da;
    border: 1px solid #721c24;
    border-radius: 5px;
    padding: 0 5px;
}
.correct {
    background-color: #6aef89;
    color: #277b3b;
    border: 1px solid #277b3b;
    border-radius: 5px;
    padding: 0 5px;
}
</style>