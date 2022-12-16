<template>
    <section class="edit_wrapper">
        <section class="button_wrapper">
            <button @click="download" class="btn_form_edit">Download file <font-awesome-icon icon="fa-solid fa-file-arrow-down" /></button>
            <b-button v-b-modal.plvalue @click="getLangPlkey('pl')" class="btn_form_edit">Download key <font-awesome-icon icon="fa-solid fa-file-arrow-down" /></b-button>
            <b-modal id="plvalue" scrollable size="xl"
                :title="('Your value from i18n file')">
                <b-form-file
                    v-model="file1"
                    accept=".txt"
                    id="file-small" size="sm"
                    class="formInput"
                    plain
                    @change="onFileChange"
                />
                <section class="information_generation">
                    <div class="buttonAndSpinner">
                        <button v-if="content" class="btn_form_edit" @click="addTranslateTofile">Generuj</button>
                        <b-spinner variant="primary" v-if="content && loaderGeneration"></b-spinner>
                    </div>
                    <p v-if="showSuccessAlert" class="showSuccessAlert">Save new lang</p>
                    <p v-if="showErrorAlert" class="showErrorAlert">Something went wrong, check server</p>
                    <p v-if="filename">From <b>pl</b> to lang: <b>{{ this.filename }}</b></p>
                </section>
                <ul class="list-unstyled">
                    <li class="element_in_list value" v-for="[key, value] of filteredList" :key="key">{{ value }}"</li>
                </ul>

                <template #modal-footer="{ cancel }">
                    <b-button size="sm" variant="success" @click="copy()">
                        Copy <font-awesome-icon icon="fa-solid fa-copy" />
                    </b-button>
                    <b-button size="sm" variant="primary" @click="downloadKey">
                        Download <font-awesome-icon icon="fa-solid fa-file-arrow-down" />
                    </b-button>
                    <b-button size="sm" variant="danger" @click="cancel()">
                        Wyjdź <font-awesome-icon icon="fa-solid fa-right-from-bracket" />
                    </b-button>
                </template>
            </b-modal>

            <b-button v-b-modal="('pl')" @click="getLangPl('pl')" class="btn_form_edit">Edit file <font-awesome-icon icon="fa-solid fa-pencil" /></b-button>
                <b-modal :id="('pl')" scrollable size="xl"
                    :title="('Editing the base translation object')">
                    <p class="my-4">
                    <ul class="list-unstyled">
                        <h6>Add new translation</h6>
                        <form @submit="onSubmitNew" class="addNewItem">
                            <section class="form_section">
                                <b-form-input v-model="new_key" @blur="valueTrim($event)" :class="{ wrongKey: isWrongKey }"></b-form-input>
                                <b-form-input v-model="new_value"></b-form-input>
                                <button class="sendButton" :disabled="this.new_key && this.new_value && !this.isWrongKey ? false  : true" >Send <font-awesome-icon icon="fa-solid fa-check" /></button>
                            </section>
                            <b-spinner variant="primary" v-if="loadingFormNew"></b-spinner>
                            <p v-if="showSuccessAlert" class="showSuccessAlert">Save new record</p>
                            <p v-if="showErrorAlert" class="showErrorAlert">Something went wrong, the given key exists or the server is not responding</p>
                        </form>

                        <h6>Translation list</h6>
                        <b-form-input class="margin" type="text" v-model="search" placeholder="Search key.."></b-form-input>
                        <section class="spinner">
                            <b-spinner variant="primary" v-if="loadingUpdateForm || loadingDeleteForm"></b-spinner>
                        </section>
                        <p v-if="showSuccessAlertUpdate" class="showSuccessAlert">Successfully updated</p>
                        <p v-if="showErrorAlertUpdate" class="showErrorAlert">Something went wrong, the record has not been updated</p>
                        <p v-if="showSuccessAlertDelete" class="showSuccessAlert">Successfully delete</p>
                        <p v-if="showErrorAlertDelete" class="showErrorAlert">Something went wrong, the record has not been deleted</p>

                        <li class="element_in_list" v-for="[key, value], index in filteredList" :key="index">     
                            <section class="element_in_list_detail">
                                "{{ key }}": "{{ value }}"
                                <section class="element_in_list__buttons">
                                    <button class="button button_edit" @click="handleShowEditForm(key, value, index)"><font-awesome-icon icon="fa-solid fa-pencil" /></button>
                                    <button class="button button_delete" @click="handleDeleteElement(key)"><font-awesome-icon icon="fa-solid fa-trash" /></button>
                                </section>
                            </section>             

                            <form @submit="onSubmit" class="element_in_list_edit" v-if="showEditForm == index">
                                <b-form-input v-model="old_key" v-show="false"></b-form-input>
                                <b-form-input v-model="key_text"></b-form-input>
                                <b-form-input v-model="value_text"></b-form-input>
                                <button class="sendButton">Confirm <font-awesome-icon icon="fa-solid fa-check" /></button>
                            </form>
                        </li>
                    </ul>
                    </p>

                    <template #modal-footer="{ cancel }">
                        <b-button size="sm" variant="danger" @click="cancel()">
                            Wyjdź <font-awesome-icon icon="fa-solid fa-right-from-bracket" />
                        </b-button>
                    </template>
                </b-modal>
        </section>

        <b-spinner variant="primary" v-if="loading"></b-spinner>
        <b-alert class="alert" :show="dismissCountDownSuccess" dismissible fade variant="success" @dismiss-count-down="countDownChanged">
            The file has been downloaded.
        </b-alert>
        <b-alert class="alert" :show="dismissCountDownError" dismissible fade variant="danger" @dismiss-count-down="countDownChanged">
            File download failed.
        </b-alert>
    </section>        
</template>

<script>
import axios from 'axios';

export default {
    name: 'ComponentEdit',
    data: () => {
        return {
            axios,
            // DO SCIĄGANIA PLIKU 
            loading: false,
            dismissSecs: 5,
            dismissCountDownSuccess: 0,
            dismissCountDownError: 0,
            showDismissibleAlert: false,
            // DO POKAZANIA ELEMENTÓW W EDIT 
            showedData: [],
            showed: null,
            // POKAZANIE FORMULARZY PO KLIKNIĘCIU W OŁÓWEK
            showEditForm: null,
            // WYSYŁKA UPDATED
            key_text: null,
            value_text: null,
            // WYSYŁKA POST NOWE DANE
            new_key: null,
            new_value: null,
            old_key: null,

            // ALERTY
            loadingFormNew: false,
            showSuccessAlert: false,
            showErrorAlert: false,

            loadingUpdateForm: false,
            showSuccessAlertUpdate: false,
            showErrorAlertUpdate: false,

            showSuccessAlertDelete: false,
            showErrorAlertDelete: false,
            loadingDeleteForm: false,

            isWrongKey: false,

            search: '',
            file1: null,
            content: null,
            filename: null,
            onlyKey: [],
            loaderGeneration: false,
        }
    },
    methods: {
        valueTrim(event) {
            this.new_key = event.target.value.trim()
            const checkNewKey = this.new_key.split(' ');
            checkNewKey.length > 1 ? this.isWrongKey = true : this.isWrongKey = false
        },
        /* WYSYŁKA NOWEGO KLUCZA I WARTOŚCI */
        async onSubmitNew(event) {
            event.preventDefault();
            for(const key of this.showedData) {
                if(key[0] === this.new_key) {
                    return this.showAlertNewForm('error');
                }
            } 
            this.loadingFormNew = true;
            await this.axios({
                method: 'post',
                url: `http://localhost:3000/post`,
                data: {
                    key: `${this.new_key}`,
                    value: `${this.new_value}`,
                },
            }).then((response) => {
                this.showedData = Object.entries(response.data.pl);
                this.showAlertNewForm('success');
            }).catch(() => {
                this.showAlertNewForm('error');
            })
            this.$forceUpdate();
        },
        /* ALERTY DO FORMULARZA Z NOWYM KLUCZEM I WARTOŚCIAMI */
        showAlertNewForm(e) {
            e === 'success' 
            ? this.showSuccessAlert = true
            : this.showErrorAlert = true
            this.loadingFormNew = false;
            this.new_key = null,
            this.new_value = null,
            this.loaderGeneration = false;
            this.filename = null;
            this.content = null;
            setTimeout(() => {
                this.showSuccessAlert = false
                this.showErrorAlert = false
            }, 3000)
        },  
        /* UPDATE KLUCZA I WARTOŚCI */
        async onSubmit(event) {
            event.preventDefault();
            this.loadingUpdateForm = true;
            await this.axios({
                method: 'put',
                url: `http://localhost:3000/put/${this.key_text}&${this.value_text}&${this.old_key}`,
            }).then((response) => { 
                this.showedData = Object.entries(response.data.pl); 
                this.showEditForm = -1;
                this.showAlertUpdateForm('success');
            }).catch(() => { 
                this.showAlertUpdateForm('error');
                })
            this.$forceUpdate();
        },
        /* ALERTY DO FORMULARZA Z UPDATE NOWYM KLUCZEM I WARTOŚCIĄ */
        showAlertUpdateForm(e) {
            e === 'success' 
            ? this.showSuccessAlertUpdate = true
            : this.showErrorAlertUpdate = true
            this.loadingUpdateForm = false;
            setTimeout(() => {
                this.showSuccessAlertUpdate = false
                this.showErrorAlertUpdate = false
            }, 3000)
        },  
        /* USNIĘCIE DANEGO POLA */
        async handleDeleteElement(key) {
            this.loadingDeleteForm = true;
            await this.axios({
                method: 'delete',
                url: `http://localhost:3000/delete/${key}`,
            }).then((response) => { 
                this.showedData = Object.entries(response.data.pl); 
                this.showAlertDeleteForm('success')
            }).catch(() => { 
                    this.showAlertDeleteForm('false')
                })
                this.$forceUpdate();
        },
        /* ALERTY DO USNIĘCIA DANEGO POLA */
        showAlertDeleteForm(e) {
            e === 'success' 
            ? this.showSuccessAlertDelete = true
            : this.showErrorAlertDelete = true
            this.loadingDeleteForm = false;
            setTimeout(() => {
                this.showSuccessAlertDelete = false
                this.showErrorAlertDelete = false
            }, 3000)
        },
        async getLangPl(data) {
            this.showed = data
            await this.axios({
                method: 'get',
                url: `http://localhost:3000/getOne/${data}`,
            })
                .then((response) => { this.showedData = (Object.entries(response.data)); this.$forceUpdate; })
                .catch((error) => { console.log(error); });
        },
        /* FUNKCJA DO POBRANIA OBIEKTU POLSKIEGO */
        async getLangPlkey(data) {
            this.showed = data
            await this.axios({
                method: 'get',
                url: `http://localhost:3000/getOne/${data}`,
            })
                .then((response) => { this.showedData = (Object.entries(response.data)); this.$forceUpdate; })
                .catch((error) => { console.log(error); });

           this.downloadKey()
        },
        /* FUNKCJA DO POKAZANIA FORMULARZA PO KLIKNIĘCIU W OŁÓWEK */
        handleShowEditForm(key, value, index) {
            this.showEditForm = index;
            this.key_text = key;
            this.value_text = value;
            this.old_key = key;
        },
        /* FUNKCJA SCIĄGAJĄCA PLIK */
        async download() {
            this.loading = true;
            this.dismissCountDownSuccess = 0
            this.dismissCountDownError = 0
            await this.axios({
                method: 'get',
                url: 'http://localhost:3000/download',
            })
            .then((response) => { 
                let text = response.data;
                let filename = 'i18n.js';
                let element = document.createElement('a');
                element.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(text));
                element.setAttribute('download', filename);
                element.style.display = 'none';
                document.body.appendChild(element);
                element.click();
                document.body.removeChild(element);
                this.loading = false,
                this.showAlertSuccess()
                })
            .catch(() => { 
                this.loading = false,
                this.showAlertError();
            })
            this.$forceUpdate();
        },
        async downloadKey() {
            const text = document.querySelector(".list-unstyled").innerHTML;
            const text2 = text.replace(/<[^>]*>?/gm, '');
            const text3 = text2.replaceAll('"', '\n');
            let filename = 'value.txt';
            let element = document.createElement('a');
            element.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(text3));
            element.setAttribute('download', filename);
            element.style.display = 'none';
            document.body.appendChild(element);
            element.click();
            document.body.removeChild(element);
            window.open('https://www.onlinedoctranslator.com/en/translationform','_blank');
        },
        /* ALERTY DO POBRANIA PLIKU */
        countDownChanged(dismissCountDown) {
            this.dismissCountDown = dismissCountDown
        },
        showAlertSuccess() {
            this.dismissCountDownSuccess = this.dismissSecs
        },
        showAlertError() {
            this.dismissCountDownError = this.dismissSecs
        },
        async copy() {
            const text = document.querySelector(".list-unstyled").innerHTML;
            const text2 = text.replace(/<[^>]*>?/gm, '');
            const text3 = text2.replaceAll('"', '\n');
            navigator.clipboard.writeText(`${text3}`).then(function () {
                console.log('Async: Copying to clipboard was successful!');
            }, function (err) {
                console.error('Async: Could not copy text: ', err);
            });
        },
        onFileChange(event) {
            const file = event.target.files[0];
            if (!file) {
                return;
            } 
            const name = event.target.files[0].name.split('.')
            this.filename = name[2]

            const reader = new FileReader();
            reader.onload = (e) => {
                this.content = e.target.result.split('\n');
            };
            reader.readAsText(file);
            // eslint-disable-next-line no-unused-vars
            for(const [key, _] of this.filteredList) {
                this.onlyKey.push(key);
            }
        },
        async addTranslateTofile() {
            const newObj = {};
            this.onlyKey.forEach((element, index) => {
                newObj[element] = this.content[index];
            });
            this.loaderGeneration = true;
            await this.axios({
                method: 'post',
                url: `http://localhost:3000/postNewLang`,
                data: {
                    lang: this.filename,
                    dataLang: newObj,
                },
            }).then(() => {
                console.log('success');
                this.showAlertNewForm('success');
            }).catch(() => {
                this.showAlertNewForm('error');
                this.loaderGeneration = false;
            }).finally(() => {
                document.getElementById("file-small").value = "";
            })
        }
    },
    computed: {
        filteredList() {
            return this.showedData.filter(element => {
                return element[0].toLowerCase().includes(this.search.toLowerCase())
            })
        },
        textTrimed() {
            return this.new_key.trim()
        },
    }
}
</script>
<style lang="scss" scoped>
.spinner {
    display: flex;
    justify-content: center;
    align-items: center;
}
.form_section {
    display: flex;
    gap: 1rem;
    justify-content: space-between;
    width: 100%;
}
.edit_wrapper { 
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
}
.btn_form_edit {
    width: 156px;
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
.button_wrapper {
    width: 100%;
    display: flex;
    gap: 1rem;
}
.sendButton {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-right: 8px;
    padding: .2rem .5rem;
    gap: .2rem;
    transition: all .2s ease-in;
    border-radius: 5px;
    &:hover {
        background-color: #277b3b;
        color: whitesmoke;
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
.alert {
    align-self: flex-start;
    width: 100%;
}
.element_in_list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: center;
    justify-content: space-between;
    padding: .2rem 0;
    border-bottom: 1px dashed #333;

    &:first-child {
        border-top: 1px dashed #333;
    }
}
.value {
    align-items: unset;
}
.element_in_list_detail {
    width: 100%;
    display: flex;
    justify-content: space-between;
    padding: .2rem 0;

}
.element_in_list_edit {
    width: 100%;
    display: flex;
    gap: 1rem;
}
.element_in_list__buttons {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: .2rem;
    padding: .2rem .5rem;
}

.button {
    padding: .2rem .4rem;
    border-radius: 5px;
    transition: all .2s ease-in;
}
.button_delete {
    background-color:  #DC3545;
    color: whitesmoke;
    &:hover {
        background-color: #bb2d3b;
    }
}
.button_edit {
    background-color: #28a745;
    color: whitesmoke;
    &:hover {
        background-color: #277b3b;
    }
}
.addNewItem {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    gap: 1rem;
    justify-content: space-between;
    margin-bottom: 1rem;
}
.showSuccessAlert, .showErrorAlert {
    text-align: center;
    padding: 1rem;
    width: 100%;
    border-radius: 5px;
}
.showSuccessAlert {
    background-color: #28a745;
    color: whitesmoke;
}
.showErrorAlert {
    background-color: #DC3545;
    color: whitesmoke;
}
.margin {
    margin-bottom: 1rem;
}
.wrongKey {
    border: 2px solid #bb2d3b;
    background-color: #DC3545;
    color: whitesmoke;
}
.formInput {
    width: 100%;
    border: 1px solid #333;
    padding: 1rem;
    margin: 1rem 0;
    border-radius: 5px;
    background-color: rgb(182, 182, 182);
    transition: .5s all ease-in-out;
    &:active, &:hover {
        background-color: #cce5ff;
    }
}
.information_generation {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 1rem;
}
.buttonAndSpinner {
    display: flex;
    align-items: center;
    gap: 1rem;
}
</style>