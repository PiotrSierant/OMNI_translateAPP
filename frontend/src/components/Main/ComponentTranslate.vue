<template>
    <div>
        <section class="container_form">
            <b-form @submit="onSubmit" class="form">
                <ComponentForm @selectValue="getValue" 
                :languages="languages" 
                :lang="lang" 
                :loader="loader"            
                />
            <b-alert :show="dismissCountDownSuccess" dismissible fade variant="success" @dismiss-count-down="countDownChanged">
                A new language has been added
            </b-alert>
            <b-alert :show="dismissCountDownError" dismissible fade variant="danger" @dismiss-count-down="countDownChanged">
                Failed to generate file.
            </b-alert>
            </b-form>
            <ComponentEdit />
        </section>
        <hr />
        <ComponentList 
            :isDoneListLang="isDoneListLang"
            :lang="lang" 
        />
    </div>
</template>
<script>
import languagesData from '../../../data/languagesList.json';
import axios from 'axios';
import ComponentForm from './Form/ComponentForm';
import ComponentEdit from './Edit/ComponentEdit';
import ComponentList from './List/ComponentList';

export default {
    name: 'ComponentTranslate',
    data: () => {
        return {
            languages: languagesData, // objekty z językami do tłumaczeń
            isDoneListLang: null, // lista ze skrótami przetłumaczonymi językami
            lang: 'Choose language', // wybrany język w select
            shorLang: null,
            loader: false,
            dismissSecs: 5,
            dismissCountDownSuccess: 0,
            dismissCountDownError: 0,
            showDismissibleAlert: false,
        }
    },
    components: {
        ComponentForm,
        ComponentEdit,
        ComponentList,
    },
    created() {
        this.blockChoice();
    },
    methods: {
        getValue(value) {
            this.lang = value
        },
        countDownChanged(dismissCountDown) {
            this.dismissCountDown = dismissCountDown
        },
        showAlertSuccess() {
            this.dismissCountDownSuccess = this.dismissSecs
        },
      
        showAlertError() {
            this.dismissCountDownError = this.dismissSecs
        },
        onSubmit(event) {
            event.preventDefault()
            this.loader = true;
            this.dismissCountDownSuccess = 0
            this.dismissCountDownError = 0
            axios({
                method: 'get',
                url: `http://localhost:3000/sendform/${this.shorLang}`,
            })
                .then(() => {
                    this.loader = false;
                    this.showAlertSuccess();
                    this.blockChoice();
                })
                .catch(() => {
                    this.loader = false;
                    this.showAlertError();
                });
        },
        async getAllDoneLang() {
            await axios({
                method: 'get',
                url: 'http://localhost:3000/getAll',
            })
                .then((response) => { this.isDoneListLang = response.data; })
                .catch((error) => { console.log(error); });
        },
        async blockChoice() {
            await this.getAllDoneLang();
            return this.isDoneListLang.forEach(shorLangToDisable => {
                this.languages.forEach(element => {
                    if (element.short === shorLangToDisable) {
                        element.isDone = true
                    }
                })
                this.$forceUpdate;
            })
        },
        
    },
    watch: {
        lang(newVal) {
            for (let element of this.languages) {
                if (element.name === newVal) {
                    this.shorLang = element.short
                }
            }
        },
    },
}
</script>

<style lang="scss" scoped>
.container_form {
    max-width: 1000px;
    width: 100%;
    display: flex;
    justify-content: space-between;
}
.form {
    display: flex;
    flex-direction: column;
}
</style>