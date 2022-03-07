const paddingChar = 'xgP'; // For label sizing, it looks much better if we slightly overprovision
const font = 'Avenir, Helvetica, Arial, sans-serif';
const fontSize = 'medium';

const sizeCache = {};
function text(s) {
  s += paddingChar;
  if (sizeCache[s])
    return sizeCache[s];

  var div = document.createElement('div');
  div.style.position = 'absolute';
  div.style.visibility = 'hidden';
  div.style.height = 'auto';
  div.style.width = 'auto';
  div.style.padding = "0";
  div.style.whiteSpace = 'nowrap';
  div.style.fontFamily = font;
  div.style.fontSize = fontSize;
  div.style.border = "1px solid blue"; // for convenience when visible

  div.innerHTML = s;
  document.body.appendChild(div);
  
  var clientWidth = div.clientWidth;
  var clientHeight = div.clientHeight;
  
  document.body.removeChild(div);
  
  let result = {w: clientWidth, h: clientHeight};
  sizeCache[s] = result;
  return result;
}

export default { text }