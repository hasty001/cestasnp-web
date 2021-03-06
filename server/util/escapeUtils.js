const _const = require('../../const');

const escape = (html) => {
  return !html ? '' : String(html)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

const fixImageUrl = (url, code) => {
  return (url || '').replace(/https:\/\/res\.cloudinary\.com\/cestasnp-sk\/image\/upload(\/[^/]+?)?\/v/, 
    `https://res.cloudinary.com/cestasnp-sk/image/upload${code ? ("/" + code) : ""}/v`);
};

const escapeImg = (img, def = "") => {
  if (img && typeof img == "string") {
    if (img != "None") {
      if (img.indexOf('res.cloudinary.com') === -1) {
        return escape(`https://res.cloudinary.com/cestasnp-sk/image/upload/${_const.EscapeImgFormat}/v1520586674/img/sledovanie/${img}`);
      } else {
        return escape(fixImageUrl(img, _const.EscapeImgFormat));
      }
    }

    return def;
  }
  
  if (img && img.secure_url) {
    return escape(fixImageUrl(img.secure_url, _const.EscapeImgFormat));
  }

  return def;  
}

const escapeDate = (date) => {
  try {

    if (!date)
      return "";
    const d = new Date(date);
    return isNaN(d) ? "" : escape(d.toISOString());
  } catch {
    return "";
  }
}

const fix = (s, m) => {
  if (!s || !m) {
    return s;
  }

  var result = s;
  while (result.indexOf(m + m) >= 0) {
    result = result.replace(m + m, m);
  }

  if (result.startsWith(m)) {
    result = result.slice(m.length);
  }

  if (result.endsWith(m)) {
    result = result.slice(0, -m.length);
  }

  return result;
}

const toUrlName = (s) => {
  return fix(s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/&/g, 'a').toLowerCase().replace(/[^a-z0-9]/g, "-"), '-');
}

module.exports = { escape, escapeImg, escapeDate, toUrlName };