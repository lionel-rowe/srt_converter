const CRLF = '\r\n';

const conversionForm = document.querySelector('#conversionForm');
const outputDisplay = document.querySelector('#output');
const warningDisplay = document.querySelector('#warnings');
const fileUpload = document.querySelector('#fileUpload');

const config = localStorage.config
  ? JSON.parse(localStorage.config)
  : {
    conversions: { // 1 = convert; 0 = do nothing; -1 = remove
      music: 1,
      italic: 1,
      bold: 1,
    },
    warnings: { // >1 = number; 0 = turned off
      maxLineNo: 2,
      maxLineLength: 45,
      minBetweenKeyframes: 1500 //ms
    },
    timings: { // in ms
      offset: 0,
      maxKeyframe: 5000
    },
    locale: 'en-us'
  };

console.log(config);

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
  fileReader.addEventListener('load', e => {inputSource = e.target.result});
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

  outputArr.sort((a, b) => {
    return a.hr !== b.hr
      ? a.hr - b.hr
      : a.min !== b.min
        ? a.min - b.min
        : a.sec !== b.sec
          ? a.sec - b.sec
          : a.fr - b.fr;
  });

  outputArr.forEach((el, idx) => el.counter = idx + 1);


  const fps = guessFps(Math.max(...outputArr.map(st => st.fr)));
  
  function getMs(st) {
    return Math.floor((1000 / fps) * (st.fr - 1));
  }
  
  function getTotalSecs(st) {
    return (
      st.hr * 60 * 60
      + st.min * 60
      + st.sec
    );
  }
  
  function getHrsMinsSecs(totalSecs) {
    const hr = Math.floor(totalSecs / (60*60));
    const min = Math.floor((totalSecs - (hr * 60 * 60)) / 60);
    const sec = Math.floor(totalSecs - (hr * 60 * 60) - (min * 60));
    return {hr, min, sec};
  }

  function getTs(st, offsetSecs, offsetMs) { //TODO: refactor this nonsense (make MS part of original JSON);
    //base everything on ms
    //eliminate 1000 ms
    
    if (offsetSecs) {

      const totalSecs = getTotalSecs(st) + offsetSecs;
      const hMS = getHrsMinsSecs(totalSecs);

      st.hr = hMS.hr;
      st.min = hMS.min;
      st.sec = hMS.sec;
    }
    if (!offsetMs) {
      offsetMs = 0
    };
    
    return `${('' + st.hr).padStart(2, '0')}:${('' + st.min).padStart(2, '0')}:${('' + st.sec).padStart(2, '0')},${('' + (getMs(st) + offsetMs)).padStart(3, '0')}`;
  }

  function parseBold(contentStr) {
    return contentStr.replace(/(^|[\b\W])([\*_])\2([\s\S]+?)\2\2($|[\b\W])/g, '$1<b>$3</b>$4');
  }

  function parseItalic(contentStr) {
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
      const parsedContentStr = pipe(contentStr, parseBold, parseItalic, parseMusic);

      output += parsedContentStr;
      output += CRLF;
      lineNumber += numOfLines;
    }

    outputArr.forEach((st, idx) => { // building output string
      
      appendLine(st.counter);

      const startTime = getTs(st);
      const endTime = 
        idx === outputArr.length - 1
          ? getTs(st, 5) :
            st.sec * 1000 + getMs(st) + config.timings.maxKeyframe > outputArr[idx + 1].sec * 1000 + getMs(outputArr[idx + 1])
            ? getTs(outputArr[idx + 1], 0, -1)
            : getTs(st, 5);

      appendLine(`${startTime} --> ${endTime}`)

      appendContentLines(st.lines);

      /*if (st.lines.length > config.warnings.maxLineNo) {
        warnings.push(1);
      }
      if (st.lines.some((line) => line.length > config.warnings.maxLineLength)) {
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

/*TODO: store user settings (+ most recent filename used) in browser*/

/*TODO: use (visible) bounding box to check line length instead of
no of chars (and update SG to reflect this)
*/

/*TODO: clean up/modularize code + use webpack*/

/*TODO: add tests (incl. overall functionality, line length + no, markdown + music note support)*/

});


