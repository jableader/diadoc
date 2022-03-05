const paddingChar = 'x'; // For label sizing, it looks much better if we slightly overprovision
const font = 'Avenir, Helvetica, Arial, sans-serif';
const fontSize = 'medium';

const sizeCache = {};
function measure(s) {
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

function sizing(shape) {
  let labelSize = measure(shape.label + paddingChar, font, fontSize);
  let availableW = shape.width - shape.strokeWidth * 2;
  let labelScale = (availableW < labelSize.w) ? availableW / labelSize.w : 1;
  let labelBottom = labelSize.h * labelScale;
  let availableH = shape.height - labelBottom - shape.strokeWidth;
  let childScale = Math.min(availableW/100, availableH/100);

  return {
    label: { h: labelSize.h, w: labelSize.w, scale: labelScale, bottom: labelBottom }, 
    child: { h: availableH, w: availableW, scale: childScale, y: labelBottom + shape.strokeWidth*1.5, x: shape.strokeWidth/2 },
  }
}

export default {measure, sizing}