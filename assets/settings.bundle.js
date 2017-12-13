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
/******/ 	return __webpack_require__(__webpack_require__.s = 3);
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
/* 1 */,
/* 2 */,
/* 3 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__defaultSettings_js__ = __webpack_require__(0);


// TODO: make the whole thing less spaghetti-code like + DRY up

const settingsFormEl = document.querySelector('#settingsForm');

const settings = {};

function setFields() {

  Object.keys(localStorage).forEach(key => {
    settings[key] = typeof __WEBPACK_IMPORTED_MODULE_0__defaultSettings_js__["a" /* defaultSettings */][key] === 'number' ? +localStorage[key] : localStorage[key];
  });

  Object.keys(__WEBPACK_IMPORTED_MODULE_0__defaultSettings_js__["a" /* defaultSettings */]).forEach(key => {
    if (!localStorage[key]) {
      settings[key] = __WEBPACK_IMPORTED_MODULE_0__defaultSettings_js__["a" /* defaultSettings */][key];
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

settingsFormEl.addEventListener('submit', e => {
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

settingsFormEl.addEventListener('reset', e => {
  e.preventDefault();
  localStorage.clear();
  setFields();
});

/***/ })
/******/ ]);