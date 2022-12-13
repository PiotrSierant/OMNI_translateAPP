<template>
    <ul class="list_translation_ul">
            <li v-for="(lang, key) in isDoneListLang" :key="key" class="list_translation">
                <p class="title">{{ lang }}</p>
                <b-button v-b-modal="('myModal' + lang)" @click="addLang(lang)" class="btn_form">Show file <font-awesome-icon icon="fa-solid fa-eye" /></b-button>
                <b-modal :id="('myModal' + lang)" scrollable size="xl" v-if="(showed == lang)"
                    :title="(`Translate file: ${lang}`)">
                    <p class="my-4">
                    <ul class="list-unstyled">
                        <li v-for="[key, value] of Object.entries(showedData)" :key="key">                  
                            {{ key }}: "{{ value }}",
                        </li>
                    </ul>
                    </p>

                    <template #modal-footer="{ cancel }">
                        <b-button size="sm" variant="success" @click="copy(lang)">
                            Copy <font-awesome-icon icon="fa-solid fa-copy" />
                        </b-button>
                        <b-button size="sm" variant="danger" @click="cancel()">
                            Wyjdź <font-awesome-icon icon="fa-solid fa-right-from-bracket" />
                        </b-button>
                    </template>
                </b-modal>
            </li>
        </ul>
</template>

<script>
import axios from 'axios';
export default {
    name: 'ComponentList',
    data: () => {
      return {
        showedData: {},
        showed: null,
        axios,
      }
    },
    props: {
        isDoneListLang: {
            type: [String, Array],
            default() {
                return ''
            }
        },
        lang: {
            type: [String, Array],
            default() {
                return ''
            }
        },
    },
    methods: {
        async copy(lang) {
            const text = document.querySelector(".list-unstyled").innerHTML;
            const text2 = text.replace(/<[^>]*>?/gm, '');
            navigator.clipboard.writeText(`${lang} = {
                `+ text2 + `
            }`).then(function () {
                console.log('Async: Copying to clipboard was successful!');
            }, function (err) {
                console.error('Async: Could not copy text: ', err);
            });
        },
        async addLang(data) {
            this.showed = data
            await this.axios({
                method: 'get',
                url: `http://localhost:3000/getOne/${data}`,
            })
                .then((response) => { this.showedData = response.data; this.$forceUpdate; })
                .catch((error) => { console.log(error); });
        },
    },
};
</script>

<style lang="scss" scoped>
.list_translation_ul {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    width: 100%;
    gap: 1rem;
    li {
        height: 3rem;
        display: flex;
        align-items: center;
        .title {
            display: flex;
            font-size: 20px;
            background-color: #b8daff;
            width: 60px;
            justify-content: center;
            align-items: center;
            height: 100%;
            border-radius: 4px;
            text-transform: uppercase;
        }
    }
}
.btn_form {
    width: 156px;
    height: 100%;
    padding: .5rem;
    margin-left: 10px;
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
</style>