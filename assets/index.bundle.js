/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return defaultSettings; });
const defaultSettings = {
  // Conversions: 1 = convert; 0 = do nothing; -1 = remove
  convertMusic: 1,
  convertItalics: 1,
  convertBold: 1,

  // Warnings: >0 = specified number; 0 = turned off
  warnMaxLineNo: 2,
  warnMaxLineLength: 45,
  warnMinBetweenKeyframes: 1500, //ms

  // Timing: in ms
  offset: 0,
  maxKeyframe: 5000,

  // Other
  locale: 'en-us'
};



/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__defaultSettings_js__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__helpers_js__ = __webpack_require__(2);



const CRLF = '\r\n';

const conversionForm = document.querySelector('#conversionForm');
const outputDisplay = document.querySelector('#output');
const warningDisplay = document.querySelector('#warnings');
const fileUpload = document.querySelector('#fileUpload');
const filenameInput = document.querySelector('#filename');

const settings = {};

Object.keys(localStorage).forEach(key => {
  settings[key] = typeof __WEBPACK_IMPORTED_MODULE_0__defaultSettings_js__["a" /* defaultSettings */][key] === 'number' ? +localStorage[key] : localStorage[key];
});

Object.keys(__WEBPACK_IMPORTED_MODULE_0__defaultSettings_js__["a" /* defaultSettings */]).forEach(key => {
  if (!localStorage[key]) {
    settings[key] = __WEBPACK_IMPORTED_MODULE_0__defaultSettings_js__["a" /* defaultSettings */][key];
  }
});

console.log(settings);

function guessFps(maxFrame) {
  const fpses = [24, 25, 30, 50, 60];
  const fps = fpses.find(el => el >= maxFrame);

  return fps ? fps : 60;
}

function escapeHTML(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function unescapeAllowedTags(str) {
  return str.replace(/&lt;((?:[bi]|font color=(["'])[#0-9a-zA-Z]+?\2)|(?:\/(?:[bi]|font)))&gt;/g, '<$1>');
}

function show(el) {
  el.classList.remove('hidden');
}

function hide(el) {
  el.classList.add('hidden');
}

let inputSource = '';

fileUpload.addEventListener('change', () => {
  const fileReader = new FileReader();
  const file = fileUpload.files[0];
  if (file) {
    fileReader.readAsText(file, 'UTF-8');
    fileReader.addEventListener('load', e => {
      inputSource = e.target.result;
      const fileSplit = fileUpload.value ? fileUpload.value.split(/[\\\/]/) : undefined;
      const filename = fileSplit ? fileSplit[fileSplit.length - 1].match(/(.+)\.\w+$/)[1] : undefined;
      filenameInput.value = filename;
    });
  } else {
    inputSource = '';
  }
});

conversionForm.addEventListener('submit', e => {
  e.preventDefault();

  hide(outputDisplay);
  hide(warningDisplay);

  const input = inputSource.split(/\r?\n/g);
  const outputArr = [];
  let warnings = [];

  for (let i = 0; i < input.length; i++) {
    // building JSON
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
    if (inputSource === '') {
      alert('No file selected or the selected file is empty. \
Please upload a text file with \
timestamps in the format "[hh:mm:ss.ff]" (hours, minutes, seconds, frames).');
    } else {
      alert('Uploaded file is invalid. Please upload a text file with \
timestamps in the format "[hh:mm:ss.ff]" (hours, minutes, seconds, frames).');
    }
    return;
  }

  const fps = guessFps(Math.max(...outputArr.map(st => st.fr)));

  function getMs(fr) {
    return Math.floor(1000 / fps * (fr - 1));
  }

  outputArr.sort((a, b) => {
    return a.hr !== b.hr ? a.hr - b.hr : a.min !== b.min ? a.min - b.min : a.sec !== b.sec ? a.sec - b.sec : a.fr - b.fr;
  });

  outputArr.forEach((el, idx) => {
    el.ms = getMs(el.fr);
    el.counter = idx + 1;
  });

  function getTotalMs(st) {
    return st.ms + (st.sec + (st.min + st.hr * 60) * 60) * 1000;
  }

  function getHrsMinsSecsMs(totalMs) {
    const hrsInMs = Math.floor(totalMs / 3600000) * 3600000;
    const minsInMs = Math.floor(totalMs / 60000) * 60000 - hrsInMs;
    const secsInMs = Math.floor(totalMs / 1000) * 1000 - hrsInMs - minsInMs;

    const ms = totalMs - hrsInMs - minsInMs - secsInMs;

    const hr = hrsInMs / 3600000;
    const min = minsInMs / 60000;
    const sec = secsInMs / 1000;

    return { hr, min, sec, ms };
  }

  function getTimestamp(totalMs) {
    const vals = getHrsMinsSecsMs(totalMs + settings.offset);

    return `${('' + vals.hr).padStart(2, '0')}:${('' + vals.min).padStart(2, '0')}:${('' + vals.sec).padStart(2, '0')},${('' + vals.ms).padStart(3, '0')}`;
  }

  function parseBold(contentStr) {
    if (settings.convertBold === 0) {
      return contentStr;
    } else {
      const tags = settings.convertBold === 1 ? ['<b>', '</b>'] : ['', ''];
      return contentStr.replace(/(^|[\b\W])([\*_])\2([\s\S]+?)\2\2($|[\b\W])/g, `$1${tags[0]}$3${tags[1]}$4`);
    }
  }

  function parseItalics(contentStr) {
    if (settings.convertItalics === 0) {
      return contentStr;
    } else {
      const tags = settings.convertItalics === 1 ? ['<i>', '</i>'] : ['', ''];
      return contentStr.replace(/(^|[\b\W])([\*_])([\s\S]+?)\2($|[\b\W])/g, `$1${tags[0]}$3${tags[1]}$4`);
    }
  }

  function parseMusic(contentStr) {
    if (settings.convertMusic === 0) {
      return contentStr;
    } else {
      const tags = settings.convertMusic === 1 ? ['♫', '♫'] : ['', ''];
      return contentStr.replace(/^#\s?([\s\S]+?)\s?#$/g, `${tags[0]} $1 ${tags[1]}`);
    }
  }

  function getOutput() {
    let output = '';
    let lineNumber = 1;

    function appendLine(line) {
      //as str
      output += line;
      output += CRLF;
      lineNumber++;
    }

    function appendContentLines(lines) {
      //as arr of strs
      const numOfLines = lines.length;
      const contentStr = lines.map(line => line.trim()).join(CRLF);
      const parsedContentStr = Object(__WEBPACK_IMPORTED_MODULE_1__helpers_js__["a" /* pipe */])(contentStr, parseBold, parseItalics, parseMusic);

      output += parsedContentStr;
      output += CRLF;
      lineNumber += numOfLines;
    }

    outputArr.forEach((st, idx) => {
      // building output string

      appendLine(st.counter);

      const startMs = getTotalMs(st);

      const nextStartMs = idx === outputArr.length - 1 ? undefined : getTotalMs(outputArr[idx + 1]);

      const startTime = getTimestamp(startMs);

      const endTime = nextStartMs === undefined || nextStartMs - startMs > settings.maxKeyframe ? getTimestamp(startMs + settings.maxKeyframe) : getTimestamp(nextStartMs - 1);

      appendLine(`${startTime} --> ${endTime}`);

      appendContentLines(st.lines);

      /*if (st.lines.length > settings.warnMaxLineNo) {
        warnings.push(1);
      }
      if (st.lines.some((line) => line.length > settings.warnMaxLineLength)) {
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

    return `<div class="lineContent" data-linenumber="${idx + 1}">${Object(__WEBPACK_IMPORTED_MODULE_1__helpers_js__["a" /* pipe */])(el, escapeHTML, unescapeAllowedTags)}</div>`;
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

/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = pipe;
function pipe(input, ...funcs) {
  let output = input;
  funcs.forEach(func => {
    output = func(output);
  });
  return output;
}

/***/ })
/******/ ]);