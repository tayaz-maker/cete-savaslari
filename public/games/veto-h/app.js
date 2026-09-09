import {startApp} from '../duel-core/app.js';
import {designs} from './designs.js';
await startApp('veto-h',designs);
document.querySelector('#app').removeAttribute('aria-busy');
