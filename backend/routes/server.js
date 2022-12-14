import fs from 'fs';
import util from 'util';
import cors from 'cors';
import express from 'express';
import bodyParser from 'body-parser';
import { getPl, getAll, getOne } from '../data/i18n.js';
import { getValue, getKeys } from '../helpers/helpers.js';
import { translate } from '@vitalets/google-translate-api';
// import translate from 'google-translate-api';

// console.log(getKeys()) /* klucze obiektu pl */
// console.log(getValue()) /* wartości obiektu pl */

/* przykład łączenia dwóch tablic w obiekt klucz wartość

const arr1 = ['name', 'age', 'country'];
const arr2 = ['Tom', 30, 'Chile'];

const obj = {};

arr1.forEach((element, index) => {
  obj[element] = arr2[index];
});

*/

async function translateText(key, string, lang) {
    const { text } = await translate(string, { from: 'pl', to: lang})        /* zwróc przetłumaczony tekst z google api                             */ 
    console.log(`${key}: '${text}'`)
    // const text = Promise.resolve('translated text');                 /* zamokowanie funkcji tłumaczącej                                      */
    return text                                                         /* zwrócenie przetłumaczonego tekstu                                    */
}

export const router = express.Router(); 
router.use(cors())                                                      /* użycie corsów do komunikacji                                         */
router.get('/getAll', (_, res) => {                                     /* pobranie listy gotowych języków                                      */
    try {
        const messages = getAll();                                      /* pobranie obiektu messages */
        res.status(200).send((Object.keys(messages)))                   /* zwrócenie tablicy ze skrótami języków np. ['en', 'pl', 'de']         */
    } catch(err) {
        res.status(400).send('Something wrong', err.messages);          /* zwrócenie błędu                                                      */
    }
})

router.get('/getOne/:lang', (req, res) => {                             /* pobranie konkretnego języka przetłumaczonego                         */
    try {
        const lang = req.params.lang;                                   /* pobranie wartości języka którego oczekujemy                          */
        const oneLangData = getOne(lang);                               /* wywołanie funkcji która zwróci nam odpowiedni obiekt z tłumaczeniami */
        res.status(200).send(oneLangData)                               /* zwrócenie obiektu na front */
    } catch(err) {
        res.status(400).send('Something wrong', err.messages);          /* zwrócenie błędu                                                      */
    }
})

router.use(bodyParser.json());
router.get('/sendform/:lang', (req, res) => {                           /* dodanie tłumaczenia do pliku z formularza z frontendu                */
    const pl = getPl();                                                 /* pobranie obiektu angielskiego                                        */
    const messages = getAll();                                          /* pobranie wszystkich obiektów przetłumaczonych                        */
    const newLanguages = {};                                            /* stworzenie pustego obiektu w celu dodania tłumaczeń                  */
    const lang = req.params.lang;                                       /* pobranie parametru lang, który wskazuje na jaki języch tłumaczymy    */
    const data = async function getTranslateObject(lang) { 
        for (const [key, value] of Object.entries(pl)) {                /* przejście po kluczach i wartościach obiektu angielskiego             */
            const data = await translateText(key, value, lang);              /* wywołanie funkcji tłumaczącej                                        */
            newLanguages[key] = data;                                   /* zapisanie do obiektu klucza i przetłumaczonej wartości               */
        }
        return newLanguages                                             /* zwrócenie gotowego obiektu z tłumaczeniami                           */
    }
    data(lang)                                                              /* wywołanie funkcji asynchronicznej                                    */
    .then(response => {
        messages[lang] = response;                                      /* dopisanie do obiektu nowego tłumaczenia                              */
        fs.writeFileSync('./data/i18n.js',                              /* Zapis do pliku */ 
`export function getPl() {
    return messages.pl;
}      
export function getAll() {
    return messages
}       
export function getOne(lang) {
    return messages[lang]
}
` + 'const messages = ' + util.inspect(messages), 'utf-8')
    res.status(200).send(`${lang}`);                                    /* zwrócenie lang                                 */
    })
    .catch(err => {                                                     /* obsługa błędów                                 */
        res.status(400).send('Something wrong', err.messages);          /* zwrócenie błędu                                */
    })
})

router.get('/download', (_, res) => {                                           /* pobranie pliku na frontendzie          */
    try {
        const messages = getAll();                                              /* pobranie obiektu messages              */
        res.status(200).send(('const messages = ' + util.inspect(messages)));   /* wysłanie obiektu na front              */
    }
    catch(err) {                                                                /* obsługa błędów                         */
        res.status(400).send('Something wrong', err.messages);                  /* zwrócenie błędu                        */
    }
})

router.delete('/delete/:key', (req, res) => { // usunięcie danego rekordu z każdego obiektu przetłumaczonego 
    try {
        const messages = getAll();                                              /* pobranie obiektu messages                  */
        const key = req.params.key;                                             /* klucz do usunięcia                         */ 
        for (const lang in messages) {                                          /* przejscie przez języki w obiekcie messages */
            delete messages[lang][`${key}`];                                    /* usunięcie w każdym języku danego rekordu   */
        }   
        fs.writeFileSync('./data/i18n.js',                                      /* zapis do pliku                             */ 
`export function getPl() {
    return messages.pl;
}                
export function getAll() {
    return messages
}               
export function getOne(lang) {
    return messages[lang]
}
` + 'const messages = ' + util.inspect(messages), 'utf-8')
        res.status(200).send(messages);                                                 /* zwrócenie obiektu na front                     */
    }
    catch(err) {                                                                        /* obsługa błędów                                 */
        res.status(400).send('Something wrong', err.messages);                          /* zwrócenie błędu                                */
    }
})

router.put('/put/:key&:value&:old_key', (req, res) => {                           /* edycja istniejącego rekordu + automatyczne zastąpienie w dotępnych obiektach z tłumaczeniami */
    try {
        const messages = getAll();                                                      /* pobranie obiektu messages                      */ 
        const key = req.params.key;                                                     /* pobranie nowego klucza                         */ 
        const value = req.params.value;                                                 /* pobranie nowej wartości                        */ 
        const old_key = req.params.old_key;                                             /* pobranie starego klucza                        */   
        if(old_key === key) {                                                           /* jeśli klucz się nie zmienił                    */
            for (const lang in messages) {                                              /* przejdź po obiektach i tłumacz                 */
                if(lang === 'pl') {                                                     /* jeśli język to angielski                       */
                    messages[lang][`${old_key}`] = value                                /* zaaktualizuj tylko wartość value               */
                } else {                                                                /* w innym przypadku                              */
                    const translatedValue = async function getTranslateValue(lang) {    /* tłumaczenie value do każdego języka            */
                        return await translateText(key, value, lang);                        /* zwróć przetłumaczoną wartość                   */
                    } 
                    translatedValue(lang)                                                   /* wywołanie funkcji                              */
                    .then(response => {
                        messages[lang][`${old_key}`] = response;                        /* Dodanie nowego rekordu do obiektu message      */
                        fs.writeFileSync('./data/i18n.js',                              /* Zapis do pliku                                 */ 
`export function getPl() {
    return messages.pl;
}     
export function getAll() {
    return messages
}       
export function getOne(lang) {
    return messages[lang]
}
` + 'const messages = ' + util.inspect(messages), 'utf-8')
                        }) 
                    .catch((err) => console.log('Something wrong', err.messages))       /* obsługa błędów                                 */
                }}}  
        else {                                                                          /* w innym przypadku                              */
            for (const lang in messages) {                                              /* przejdź po obiektach i tłumacz                 */
                delete messages[lang][`${old_key}`];                                    /* Usuń stary wpis po kluczu z każdego języka     */
                if(lang === 'pl') {                                                     /* jeśli język to angielski                       */
                    messages[lang][`${key}`] = value;                                   /* dodaj nowy rekord klucz : wartość              */
                } else {                                                                /* w innym przypadku                              */
                    const translatedValue = async function getTranslateValue(lang) {    /* tłumaczenie value do każdego języka            */
                        return await translateText(key, value, lang);                        /* zwróć przetłumaczoną wartość                   */
                    } 
                    translatedValue(lang)                                                   /* wywołanie funkcji                              */
                    .then(response => { 
                        messages[lang][`${key}`] = response;                            /* przypisanie przetłumaczonej wartości do klucza */
                        fs.writeFileSync('./data/i18n.js',                              /* Zapis do pliku                                 */         
`export function getPl() {
    return messages.pl;
}       
export function getAll() {
    return messages
}      
export function getOne(lang) {
    return messages[lang]
}
` + 'const messages = ' + util.inspect(messages), 'utf-8');
                    })
                    .catch((err) => console.log('Something wrong', err.messages));      /* obsługa błędów                                 */
                }}}
        res.status(200).send(messages);                                                 /* zwrócenie obiektu messages na front            */
    }
    catch(err) {                                                                        /* obsługa błędów                                 */
        res.status(400).send('Something wrong', err.messages);                          /* zwrócenie błędu                                */
    }
});

router.post('/post', (req, res) => { 
    try {
        const messages = getAll();                                                      /* pobranie obiektu messages                      */ 
        const key = req.body.key;                                                       /* pobranie klucza                                */ 
        const value = req.body.value;                                                   /* pobranie wartości                              */ 
        for(const lang in messages) {
            if(lang === 'pl') { 
                if(messages[lang][`${key}`] === key) return res.status(400).send('The given key exists').end() /* sprawdz czy istnieje taki klucz */
                messages[lang][`${key}`] = value;
            } else {
                const translatedValue = async function getTranslateValue(lang) {        /* tłumaczenie value do każdego języka            */
                    return await translateText(key, value, lang);                            /* zwróć przetłumaczoną wartość                   */
                } 
                translatedValue(lang)                                                       /* wywołanie funkcji                              */
                    .then(response => { 
                        messages[lang][`${key}`] = response;                            /* przypisanie przetłumaczonej wartości do klucza */
                        fs.writeFileSync('./data/i18n.js',                              /* Zapis do pliku                                 */         
`export function getPl() {
    return messages.pl;
}
export function getAll() {
    return messages
}
export function getOne(lang) {
    return messages[lang]
}
` + 'const messages = ' + util.inspect(messages), 'utf-8');
                })
                .catch((err) => console.log('Something wrong', err.messages));          /* obsługa błędów                                 */
            }
        }
        res.status(200).send(messages);                                                 /* zwrócenie obiektu messages na front            */
    }
    catch(err) {
        res.status(400).send(err.messages)
    }
});