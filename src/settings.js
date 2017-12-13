import {defaultSettings} from './defaultSettings.js';

// TODO: make the whole thing less spaghetti-code like + DRY up

const settingsFormEl = document.querySelector('#settingsForm');

const settings = {};

function setFields() {

  Object.keys(localStorage).forEach(key => {
    settings[key] = typeof defaultSettings[key] === 'number' ? +localStorage[key] : localStorage[key];
  });

  Object.keys(defaultSettings).forEach(key => {
    if (!localStorage[key]) {
      settings[key] = defaultSettings[key];
    }
  });

  //radios
  ['convertMusic', 'convertItalics', 'convertBold'].forEach(el => {
    document.querySelector(`input[name="${el}"][value="${settings[el]}"]`).checked = true;
  });

  //inputs
  ['warnMaxLineNo', 'warnMaxLineLength', 'warnMinBetweenKeyframes', 'offset', 'maxKeyframe', 'locale'].forEach(el => {
    document.querySelector(`#${el}`).value = settings[el];
  });

}

setFields();

settingsFormEl.addEventListener('submit', (e) => {
  e.preventDefault();

  //radios
  ['convertMusic', 'convertItalics', 'convertBold'].forEach(el => {
    localStorage.setItem(el, settingsForm[el].value);
  });

  //inputs
  ['warnMaxLineNo', 'warnMaxLineLength', 'warnMinBetweenKeyframes', 'offset', 'maxKeyframe', 'locale'].forEach(el => {
    localStorage.setItem(el, document.querySelector(`#${el}`).value);
  });

});

settingsFormEl.addEventListener('reset', (e) => {
  e.preventDefault();
  localStorage.clear();
  setFields();
});
