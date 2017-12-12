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
/******/ 	return __webpack_require__(__webpack_require__.s = 2);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return defaultSettings; });
const defaultSettings = {
  conversions: { // 1 = convert; 0 = do nothing; -1 = remove
    music: 1,
    italics: 1,
    bold: 1
  },
  warnings: { // >1 = number; 0 = turned off
    maxLineNo: 2,
    maxLineLength: 45,
    minBetweenKeyframes: 1500 //ms
  },
  timing: { // in ms
    offset: 0,
    maxKeyframe: 5000
  },
  locale: 'en-us'
};



/***/ }),
/* 1 */,
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__defaultSettings_js__ = __webpack_require__(0);



// TODO: make the whole thing less spaghetti-code like + DRY up

const settingsForm = document.querySelector('#settingsForm');

function pipe(input, ...funcs) {
  //TODO: remove this nonsense (from this module)
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

  const stored = localStorage.settings ? JSON.parse(localStorage.settings) : undefined;

  if (!stored) {
    vals = {
      music: 1, italics: 1, bold: 1, maxLineNo: 2, maxLineLength: 45, minBetweenKeyframes: 1500, offset: 0, maxKeyframe: 5000, locale: 'en-us' //TODO: break out defaults into own module
    };
  } else {
    vals = {
      music: stored.conversions.music, italics: stored.conversions.italics, bold: stored.conversions.bold, maxLineNo: stored.warnings.maxLineNo, maxLineLength: stored.warnings.maxLineLength, minBetweenKeyframes: stored.warnings.minBetweenKeyframes, offset: stored.timing.offset, maxKeyframe: stored.timing.maxKeyframe, locale: stored.locale
    };
  }

  ['music', 'italics', 'bold'].forEach(el => {
    document.querySelector(`input[name="${el}"][value="${vals[el]}"]`).checked = true;
  });

  ['maxLineNo', 'maxLineLength', 'minBetweenKeyframes', 'offset', 'maxKeyframe', 'locale'].forEach(el => {
    pipe(`#${el}`, qs).value = vals[el];
  });
}

setFields();

settingsForm.addEventListener('submit', e => {
  e.preventDefault();
  localStorage.setItem('settings', JSON.stringify({
    conversions: { // 1 = convert; 0 = do nothing; -1 = remove
      music: +pipe('music', radio, qs, val),
      italics: +pipe('italics', radio, qs, val),
      bold: +pipe('bold', radio, qs, val)
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

settingsForm.addEventListener('reset', e => {
  e.preventDefault();
  localStorage.removeItem('settings');
  setFields();
});

/***/ })
/******/ ]);