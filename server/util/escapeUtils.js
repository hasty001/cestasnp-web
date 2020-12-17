const escape = (html) => {
  return !html ? '' : String(html)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

const escapeImg = (img) => {
  if (img && typeof img == "string") {
    if (img != "None") {
      if (img.indexOf('res.cloudinary.com') === -1) {
        return escape(`https://res.cloudinary.com/cestasnp-sk/image/upload/v1520586674/img/sledovanie/${img}`);
      } else {
        return escape(img);
      }
    }

    return "";
  }
  
  if (img && img.secure_url) {
    return escape(img.secure_url);
  }

  return "";  
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

module.exports = { escape, escapeImg, escapeDate };