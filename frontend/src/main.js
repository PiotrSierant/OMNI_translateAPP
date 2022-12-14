import Vue from 'vue';
import App from './App.vue';
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faPencil, faTrash, faFileDownload, faFileCirclePlus, faEye, faCopy, faSignOutAlt, faUpload, faPlus, faCheck } from '@fortawesome/free-solid-svg-icons';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';
import './app.scss';
Vue.use(BootstrapVue);
Vue.use(IconsPlugin);
library.add(faPencil, faTrash, faFileDownload, faFileCirclePlus, faEye, faCopy, faSignOutAlt, faUpload, faPlus, faCheck);

Vue.component('font-awesome-icon', FontAwesomeIcon);
new Vue({
  render: h => h(App),
}).$mount('#app');
