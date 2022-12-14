import { getPl } from '../data/i18n.js';

export function getValue() {
    const pl = getPl();
    return Object.values(pl)         
}

export function getKeys() {
    return Object.keys(getPl())
}