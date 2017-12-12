
import {defaultSettings} from './defaultSettings.js';

// TODO: make the whole thing less spaghetti-code like + DRY up

const settingsForm = document.querySelector('#settingsForm');

function pipe(input, ...funcs) { //TODO: remove this nonsense (from this module)
  let output = input;
  funcs.forEach(func => {
    output = func(output);
  });
  return output;
}

function qs(selector) {
  return document.querySelector(selector);
}

function val(selected) {
  return selected.value;
}

function radio(name) {
  return `input[name="${name}"]:checked`;
}

function setFields() {

  let vals;

  const stored = localStorage.settings
    ? JSON.parse(localStorage.settings)
    : undefined;

  if (!stored) {
    vals = {
      music: 1, italics: 1, bold: 1, maxLineNo: 2, maxLineLength: 45, minBetweenKeyframes: 1500, offset: 0, maxKeyframe: 5000, locale: 'en-us' //TODO: break out defaults into own module
    }
  } else {
    vals = {
      music: stored.conversions.music, italics: stored.conversions.italics, bold: stored.conversions.bold, maxLineNo: stored.warnings.maxLineNo, maxLineLength: stored.warnings.maxLineLength, minBetweenKeyframes: stored.warnings.minBetweenKeyframes, offset: stored.timing.offset, maxKeyframe: stored.timing.maxKeyframe, locale: stored.locale
    }
  }

  ['music', 'italics', 'bold'].forEach(el => {
    document.querySelector(`input[name="${el}"][value="${vals[el]}"]`).checked = true;
  });

  ['maxLineNo', 'maxLineLength', 'minBetweenKeyframes', 'offset', 'maxKeyframe', 'locale'].forEach(el => {
    pipe(`#${el}`, qs).value = vals[el];
  });

}

setFields();

settingsForm.addEventListener('submit', (e) => {
  e.preventDefault();
  localStorage.setItem('settings', JSON.stringify({
    conversions: { // 1 = convert; 0 = do nothing; -1 = remove
      music: +pipe('music', radio, qs, val),
      italics: +pipe('italics', radio, qs, val),
      bold: +pipe('bold', radio, qs, val),
    },
    warnings: { // >1 = number; 0 = turned off
      maxLineNo: +pipe('#maxLineNo', qs, val),
      maxLineLength: +pipe('#maxLineLength', qs, val),
      minBetweenKeyframes: +pipe('#minBetweenKeyframes', qs, val) //ms
    },
    timing: { // in ms
      offset: +pipe('#offset', qs, val),
      maxKeyframe: +pipe('#maxKeyframe', qs, val)
    },
    locale: pipe('#locale', qs, val)
  }));
});

settingsForm.addEventListener('reset', (e) => {
  e.preventDefault();
  localStorage.removeItem('settings');
  setFields();
});
