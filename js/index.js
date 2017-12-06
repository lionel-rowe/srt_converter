const CRLF = '\r\n';

function guessFps(maxFrame) {
  const fpses = [24, 25, 30, 50, 60];
  return fpses.find(el => el >= maxFrame) ? fpses.find(el => el >= maxFrame) : 60;
}

document.querySelector('#conversionForm').addEventListener('submit', e => {
  e.preventDefault();
	const input = document.querySelector('#input').value.split(/\r?\n/g);
  const outputArr = [];
  let output = '';
  let counter = 1;

  for (let i = 0; i < input.length; i++) { // building JSON
    const line = input[i];

  	if (line !== '') {
      const ts = line.match(/\[(\d\d):(\d\d):(\d\d).(\d\d)]/);
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
        outputArr[outputArr.length - 1].lines.push(line);
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
    return {
      hr: Math.floor(totalSecs / (60*60)),
      min: 1,
      sec: 1
    };
  }

  console.log(getTotalSecs({
    hr: 8,
    min: 9,
    sec: 10
  }));


  function getTs(st, offset) {
    
    if (offset) {
      st.sec = st.sec + 5;
      //TODO: add logic to handle spillover
    }
    
    return `${st.hr}:${st.min}:${st.sec},${('' + getMs(st)).padStart(3, '0')}`;
  }

  outputArr.forEach((st, idx) => { // building output string
    output += st.counter;
    output += CRLF;
    output += getTs(st);
    output += ' --> ';
    
    output += 
      idx === outputArr.length - 1
      ? getTs(st, 5) :
        st.sec * 1000 + getMs(st) + 5000 > outputArr[idx + 1].sec * 1000 + getMs(outputArr[idx + 1])
        ? getTs(outputArr[idx + 1])
        : getTs(st, 5);
    
    output += CRLF;
    
    output += st.lines.join(CRLF);
    
    output += CRLF + CRLF;
  });
  
  document.querySelector('#output').value = output;

});

//TODO: check if line length > 40 || lines length > 2 and warn
//TODO: auto-download file as .srt
