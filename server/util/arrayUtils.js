const cleanup = (arr, keys, fix_image = 'img_url') => {
  arr.forEach(e => {
    keys.forEach(key => {
      delete e[key];
    });

    if (fix_image) {
      img = e[fix_image]
      if (img) {
        if (img.secureurl) {
          e[fix_image] = img.secureurl
        } else if (img.url) {
          e[fix_image] = img.url
        }
      }
    }
  });
}

module.exports = { cleanup };