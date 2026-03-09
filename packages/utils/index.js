export function isNotNull (value){
  if (value !== '' && (value+'').trim() !== '' && value !== null && typeof (value) !== 'undefined' && value !== 'null' && value !== 'undefined' && (value+'').trim() !== 'undefined') {
      return true;
  } else if (Object.prototype.toString.call(value) === '[object Array]') {
      return true;
  } else if (value + '' === '0') {
      return true;
  } else {
      return false;
  }
}
