import {defaultSettings} from './defaultSettings.js';

const CRLF = '\r\n';

const conversionForm = document.querySelector('#conversionForm');
const outputDisplay = document.querySelector('#output');
const warningDisplay = document.querySelector('#warnings');
const fileUpload = document.querySelector('#fileUpload');
const filenameInput = document.querySelector('#filename');

const settings = localStorage.settings
  ? JSON.parse(localStorage.settings)  : defaultSettings;

console.log(settings);

function pipe(input, ...funcs) {
  let output = input;
  funcs.forEach(func => {
    output = func(output);
  });
  return output;
}

function guessFps(maxFrame) {
  const fpses = [24, 25, 30, 50, 60];
  const fps = fpses.find(el => el >= maxFrame);

  return fps ? fps : 60;
}

function escapeHTML(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function unescapeAllowedTags(str) {
  return str.replace(/&lt;((?:[bi]|font color=(["'])[#0-9a-zA-Z]+?\2)|(?:\/(?:[bi]|font)))&gt;/g, '<$1>')
}

function show(el) {
  el.classList.remove('hidden');
}

function hide(el) {
  el.classList.add('hidden');
}



let inputSource;

fileUpload.addEventListener('change', () => {
  const fileReader = new FileReader;
  fileReader.readAsText(fileUpload.files[0], 'UTF-8');
  fileReader.addEventListener('load', e => {
    inputSource = e.target.result;
    const fileSplit = fileUpload.value ? fileUpload.value.split(/[\\\/]/) : undefined;
    const filename = fileSplit ? fileSplit[fileSplit.length - 1].match(/(.+)\.\w+$/)[1] : undefined;
    filenameInput.value = filename;
  });
});


conversionForm.addEventListener('submit', e => {
  e.preventDefault();

  hide(outputDisplay);
  hide(warningDisplay);

	const input = inputSource.split(/\r?\n/g);
  const outputArr = [];
  let warnings = [];

  for (let i = 0; i < input.length; i++) { // building JSON
    const line = input[i];

  	if (line !== '') {
      const ts = line.match(/\[(\d\d):(\d\d):(\d\d).(\d\d)\]/);
    	if (ts) {
        outputArr.push({
          hr: +ts[1],
          min: +ts[2],
          sec: +ts[3],
          fr: +ts[4],
          lines: []
        });
      } else {
        if (outputArr.length) {
          outputArr[outputArr.length - 1].lines.push(line);
        } //else noop
      }
    }
  }
  
  if (!outputArr.length) {
    alert('Uploaded file is invalid. Please upload a text file with \
timestamps in the format "[hh:mm:ss.ff]" (hours, minutes, seconds, frames).');
    return;
  }

  const fps = guessFps(Math.max(...outputArr.map(st => st.fr)));
  
  function getMs(fr) {
    return Math.floor((1000 / fps) * (fr - 1));
  }

  outputArr.sort((a, b) => {
    return a.hr !== b.hr
      ? a.hr - b.hr
      : a.min !== b.min
        ? a.min - b.min
        : a.sec !== b.sec
          ? a.sec - b.sec
          : a.fr - b.fr;
  });

  outputArr.forEach((el, idx) => {
    el.ms = getMs(el.fr);
    el.counter = idx + 1;
  });
  
  function getTotalMs(st) {
    return (
      st.ms + (st.sec + (st.min + st.hr * 60) * 60) * 1000
    );
  }

  function getHrsMinsSecsMs(totalMs) {
    const hrsInMs = Math.floor(totalMs/3600000) * 3600000;
    const minsInMs = Math.floor(totalMs/60000) * 60000 - hrsInMs;
    const secsInMs = Math.floor(totalMs/1000) * 1000 - hrsInMs - minsInMs;

    const ms = totalMs - hrsInMs - minsInMs - secsInMs;

    const hr = hrsInMs / 3600000;
    const min = minsInMs / 60000;
    const sec = secsInMs / 1000;

    return {hr, min, sec, ms};
  }


  function getTimestamp(totalMs) {
    const vals = getHrsMinsSecsMs(totalMs);

    return `${('' + vals.hr).padStart(2, '0')}:${('' + vals.min).padStart(2, '0')}:${('' + vals.sec).padStart(2, '0')},${('' + vals.ms).padStart(3, '0')}`;
  }

  function parseBold(contentStr) {
    return contentStr.replace(/(^|[\b\W])([\*_])\2([\s\S]+?)\2\2($|[\b\W])/g, '$1<b>$3</b>$4');
  }

  function parseItalics(contentStr) {
    return contentStr.replace(/(^|[\b\W])([\*_])([\s\S]+?)\2($|[\b\W])/g, '$1<i>$3</i>$4');
  }

  function parseMusic(contentStr) {
    return contentStr.replace(/^#\s?([\s\S]+?)\s?#$/g,'♫ $1 ♫');
  }

  function getOutput() {
    let output = '';
    let lineNumber = 1;

    function appendLine(line) { //as str
      output += line;
      output += CRLF;
      lineNumber ++;
    }

    function appendContentLines(lines) { //as arr of strs
      const numOfLines = lines.length;
      const contentStr = lines.map(line => line.trim()).join(CRLF);
      const parsedContentStr = pipe(contentStr, parseBold, parseItalics, parseMusic);

      output += parsedContentStr;
      output += CRLF;
      lineNumber += numOfLines;
    }

    outputArr.forEach((st, idx) => { // building output string
      
      appendLine(st.counter);

      const startMs = getTotalMs(st);

      const nextStartMs = 
        idx === outputArr.length - 1
          ? undefined
          : getTotalMs(outputArr[idx + 1]);

      const startTime = getTimestamp(startMs);

      const endTime = 
        nextStartMs === undefined || nextStartMs - startMs > settings.timing.maxKeyframe
        ? getTimestamp(startMs + settings.timing.maxKeyframe)
        : getTimestamp(nextStartMs - 1);

      appendLine(`${startTime} --> ${endTime}`)

      appendContentLines(st.lines);

      /*if (st.lines.length > settings.warnings.maxLineNo) {
        warnings.push(1);
      }
      if (st.lines.some((line) => line.length > settings.warnings.maxLineLength)) {
        warnings.push(2);
      }*/ //TODO: add warning functionality w. line number
            
      if (idx !== outputArr.length - 1) {
        appendLine('');
      }

    });

    return output;
  }
  
  const output = getOutput();

  const uri = `data:text/plain;charset=utf-8,\uFEFF${encodeURIComponent(output)}`;

  const dummyLink = document.createElement('a');

  dummyLink.setAttribute('download', `${document.querySelector('#filename').value}.srt`);
  dummyLink.setAttribute('href', uri);
  dummyLink.click();

  show(outputDisplay);
  outputDisplay.innerHTML = output.split(CRLF).map((el, idx) => {

    return `<div class="lineContent" data-linenumber="${idx + 1}">${pipe(el, escapeHTML, unescapeAllowedTags)}</div>`;
  }).join(CRLF);

/*  if (warnings.length) {
    show(warningDisplay);
    warningDisplay.textContent = warnings;
  }*/ //TODO: add warning functionality line number

/*TODO: add warning for timestamps within 1.5 seconds*/

/*TODO: i14e*/

/*
DOCUMENTATION TODOS:
- QSG and SG: MD/music support
*/

/*TODO: add settings page:
- MDish conversion
- music note conversion on or off
- Changing max line length/max # of lines
- Default # of seconds to display subtitle
*/

/*TODO: use (visible) bounding box to check line length instead of
no of chars (and update SG to reflect this)
*/

/*TODO: clean up/modularize code*/

/*TODO: add tests (incl. overall functionality, line length + no, markdown + music note support)*/

});
