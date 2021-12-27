//Decimal to binary
function dec2bin(dec){
    return (dec >>> 0).toString(2);
}

function hexToBase64(hexstring) {
    return btoa(hexstring.match(/\w{2}/g).map(function(a) {
        return String.fromCharCode(parseInt(a, 16));
    }).join(""));
}
function base64ToHex(str) {
  const raw = atob(str);
  let result = '';
  for (let i = 0; i < raw.length; i++) {
    const hex = raw.charCodeAt(i).toString(16);
    result += (hex.length === 2 ? hex : '0' + hex);
  }
  return result.toLowerCase();
}
function strip_string(string){
	return string.toLowerCase().replace(/\s+/g, '').replace(/\./g, "");
}
const hexToB64 = hex => btoa(String.fromCharCode(...Array.apply(null, Array(hex.length / 2)).map((_,i) => parseInt(hex[i*2] + hex[i*2+1],16))));
const fromHexString = hexString => new Uint8Array(hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
function sha256_64(string){
	return hexToBase64(sha256(string));
}
const escapeHtml = (unsafe) => {
    return unsafe.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
}
/*Hash-function*/
//Murmur hash 3 - non cryptographic (reversible)
//Use - Repetitive Hash cycles for seeding PRNG
//This should be fine for its use, since no output is saved.
//Known vulnerabilities - susceptible to hash collision
//Analysis: Based on my limited knowledge this function with its use shouldn't be the source of any vulnerabilities.
//Designation: Temporary
function xmur3(str) {
    for(var i = 0, h = 1779033703 ^ str.length; i < str.length; i++)
        h = Math.imul(h ^ str.charCodeAt(i), 3432918353),
        h = h << 13 | h >>> 19;
    return function() {
        h = Math.imul(h ^ h >>> 16, 2246822507);
        h = Math.imul(h ^ h >>> 13, 3266489909);
        return (h ^= h >>> 16) >>> 0;
    }
}


/*128-bit seedable rng*/
// Small Fast Counter 32 from PracRand PRNG test suite.
//Analysis: I don't know much about this PRNG, it may be vulnerable in it's use case. Also limited to 128-bits. Considering researching another PRNG to use in it's place.
//Designation: Temporary
function sfc32(a, b, c, d) {
    return function() {
      a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0; 
      var t = (a + b) | 0;
      a = b ^ b >>> 9;
      b = c + (c << 3) | 0;
      c = (c << 21 | c >>> 11);
      d = d + 1 | 0;
      t = t + d | 0;
      c = c + t | 0;
      return (t >>> 0) / 4294967296;
    }
}

function rgb2hex(rgb) {
    rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    function hex(x) {
        return ("0" + parseInt(x).toString(16)).slice(-2);
    }
    return "" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
}