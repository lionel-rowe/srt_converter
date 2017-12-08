const CRLF = '\r\n';

const inputField = document.querySelector('#input');
const outputDisplay = document.querySelector('#output');
const warningDisplay = document.querySelector('#warnings');

const maxLines = 2;
const maxLineLength = 45;

function guessFps(maxFrame) {
  const fpses = [24, 25, 30, 50, 60];
  const fps = fpses.find(el => el >= maxFrame);

  return fps ? fps : 60;
}

function escapeHTML(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
} 

function show(el) {
  el.classList.remove('hidden');
}

function hide(el) {
  el.classList.add('hidden');
}

document.querySelector('#conversionForm').addEventListener('submit', e => {
  e.preventDefault();

  hide(outputDisplay);
  hide(warningDisplay);

  if (/^\s*$/.test(inputField.value)) {
    return;
  }

	const input = inputField.value.split(/\r?\n/g);
  const outputArr = [];
  let counter = 1;
  let warnings = [];

  for (let i = 0; i < input.length; i++) { // building JSON
    const line = input[i];

  	if (line !== '') {
      const ts = line.match(/\[(\d\d):(\d\d):(\d\d).(\d\d)\]/);
    	if (ts) {
        outputArr.push({
          counter: counter,
          hr: +ts[1],
          min: +ts[2],
          sec: +ts[3],
          fr: +ts[4],
          lines: []
        });
        counter++;
      } else {
        if (outputArr.length) {
          outputArr[outputArr.length - 1].lines.push(line);
        } else {
          return;
        }
      }
    }
  }
  
  const fps = guessFps(Math.max(...outputArr.map(st => st.fr)));
  
  function getMs(st) {
    return Math.floor((1000 / fps) * st.fr);
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

  function getTs(st, offsetSecs, offsetMs) {
    
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

  function getOutput() {
    let output = '';

    outputArr.forEach((st, idx) => { // building output string
      output += st.counter;
      output += CRLF;
      output += getTs(st);
      output += ' --> ';
      
      output += // get the end time for subtitle display; if next subtitle within 5 seconds,
      // use next subtitle, else use 5 seconds later
        idx === outputArr.length - 1
        ? getTs(st, 5) :
          st.sec * 1000 + getMs(st) + 5000 > outputArr[idx + 1].sec * 1000 + getMs(outputArr[idx + 1])
          ? getTs(outputArr[idx + 1], 0, -1)
          : getTs(st, 5);
      
      output += CRLF;
      
      output += st.lines.join(CRLF);

      if (st.lines.length > maxLines) {
        warnings.push(1);
      }
      if (st.lines.some((line) => line.length > maxLineLength)) {
        warnings.push(2);
      } //TODO: add warning functionality line number
      
      output += idx !== outputArr.length - 1 ? CRLF.repeat(2) : CRLF;

    });

    return output;
  }
  
  const output = getOutput();

  const uri = `data:text/plain;charset=utf-8,${encodeURIComponent(output)}`;

  const dummyLink = document.createElement('a');
  dummyLink.setAttribute('download', `${document.querySelector('#filename').value}.srt`);
  dummyLink.setAttribute('href', uri);
  dummyLink.click();

  show(outputDisplay);
  outputDisplay.innerHTML = output.split(CRLF).map((el, idx) => {

    return `<div class="lineContent" data-linenumber="${idx + 1}">${escapeHTML(el)}</div>`;
  }).join(CRLF);

/*  if (warnings.length) {
    show(warningDisplay);
    warningDisplay.textContent = warnings;
  }*/ //TODO: add warning functionality line number

});
