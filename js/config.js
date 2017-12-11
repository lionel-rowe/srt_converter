
// TODO: make the whole thing less spaghetti-code like + DRY up

const configForm = document.querySelector('#configForm');

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

  const stored = localStorage.config
    ? JSON.parse(localStorage.config)
    : undefined;

  if (!stored) {
    vals = {
      music: 1, italic: 1, bold: 1, maxLineNo: 2, maxLineLength: 45, minBetweenKeyframes: 1500, offset: 0, maxKeyframe: 5000, locale: 'en-us' //TODO: break out defaults into own module
    }
  } else {
    vals = {
      music: stored.conversions.music, italic: stored.conversions.italic, bold: stored.conversions.bold, maxLineNo: stored.warnings.maxLineNo, maxLineLength: stored.warnings.maxLineLength, minBetweenKeyframes: stored.warnings.minBetweenKeyframes, offset: stored.timings.offset, maxKeyframe: stored.timings.maxKeyframe, locale: stored.locale
    }
  }

  ['music', 'italic', 'bold'].forEach(el => {
    document.querySelector(`input[name="${el}"][value="${vals[el]}"]`).checked = true;
  });

  ['maxLineNo', 'maxLineLength', 'minBetweenKeyframes', 'offset', 'maxKeyframe', 'locale'].forEach(el => {
    pipe(`#${el}`, qs).value = vals[el];
  });

}

setFields();

configForm.addEventListener('submit', (e) => {
  e.preventDefault();
  localStorage.setItem('config', JSON.stringify({
    conversions: { // 1 = convert; 0 = do nothing; -1 = remove
      music: +pipe('music', radio, qs, val),
      italic: +pipe('italic', radio, qs, val),
      bold: +pipe('bold', radio, qs, val),
    },
    warnings: { // >1 = number; 0 = turned off
      maxLineNo: +pipe('#maxLineNo', qs, val),
      maxLineLength: +pipe('#maxLineLength', qs, val),
      minBetweenKeyframes: +pipe('#minBetweenKeyframes', qs, val) //ms
    },
    timings: { // in ms
      offset: +pipe('#offset', qs, val),
      maxKeyframe: +pipe('#maxKeyframe', qs, val)
    },
    locale: pipe('#locale', qs, val)
  }));
});

configForm.addEventListener('reset', (e) => {
  e.preventDefault();
  localStorage.removeItem('config');
  setFields();
});



