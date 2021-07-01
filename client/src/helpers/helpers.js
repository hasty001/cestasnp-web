import React from 'react';
import * as Constants from '../components/Constants';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import DOMPurify from 'dompurify';
import { navigate } from '../components/reusable/Navigate';
import { addDays, differenceInDays } from 'date-fns';

const sortByDateDesc = (array, date = 'date') => {
  return array.sort((a, b) => {
    return b[date] > a[date] ? 1 : b[date] < a[date] ? -1 : 0;
  });
};

const sortByDateAsc = (array, date = 'date') => {
  return array.sort((a, b) => {
    return a[date] > b[date] ? 1 : a[date] < b[date] ? -1 : 0;
  });
};

/**
 * Sorts array by date ascending if order or descending if not order.
 */
const sortByDate = (array, getDate = (a) => a.date, order = true) => {
  array.sort((a, b) => (order ? 1 : -1) * (parseDate(getDate(a)) - parseDate(getDate(b))));
};

const dateToStrFormat = (date, strFormat, def = "") => 
{
  var startDateText = def;

  if (date && date !== "")
  try 
  {
    startDateText = format(date, strFormat, {locale: "sk-SK"})
  } 
  catch(err) 
  { 
    console.error(err);
    startDateText = def;
  }

  return startDateText;
}

const dateTimeToStr = (date, def = "") => dateToStrFormat(date, Constants.DateTimeViewFormat, def);
const dateToStr = (date, def = "") => dateToStrFormat(date, Constants.DateViewFormat, def);

/**
 * Parse string to date (with time).
 */
const parseDate = (date) => {
  if (date && date.length && date.trim().length <= 10) {
    if (date.indexOf(".") > 0) {
      // parse sk formated date
      const parts = date.trim().split('.');
      if (parts && parts.length == 3) {
        return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
      }
    }

    if (date.indexOf("-") > 0) {
      // parse en formated date
      const parts = date.trim().split('-');
      if (parts && parts.length == 3) {
        return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      }
    }
  }

  return parse(date);
}

/**
 * Escape html special characters.
 */
const escapeHtml = (html) => {
  return !html ? '' : String(html)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

DOMPurify.addHook('afterSanitizeAttributes', function (node) {
  // set all internal links to use navigate and external add target blank
  if (node.tagName === "A" && node.hasAttribute('href')) {
    const href = (node.getAttribute('href') || '').trim();
    
    if (href && !href.startsWith("#")) {
      if ((href.indexOf(":") > 0 || !href.startsWith("/") || href.startsWith("//")) && !href.startsWith("https://cestasnp.sk")) {
        node.setAttribute('target', '_blank');
        node.setAttribute('rel', 'noopener');
      } else {
        if (!window.__navigate) {
          window.__navigate = navigate;
        }

        if (href.startsWith("https://cestasnp.sk/")) {
          node.setAttribute('href', href.replace("https://cestasnp.sk/", "/"))
        }

        node.setAttribute('onclick', '__navigate(event)');
      }
    }
  }

  // set image format if not specified
  if (node.tagName === "IMG" && node.hasAttribute('src')) {
    const src = (node.getAttribute('src') || '').trim();

      if (src && (src.startsWith(Constants.CloudinaryPathNoCodePrefix) || src.indexOf("/") < 0)) {
        node.setAttribute('src', fixImageUrl(src, Constants.DefaultArticleImageFormat));
      }
  }

  // set image preview and divide image in row from other content
  if (node.tagName === "IMG" && node.hasAttribute('class') && node.hasAttribute('src')) {
    const cl = (node.getAttribute('class') || '').trim().split(' ');

    if (cl.indexOf('preview') >= 0) {
      const src = (node.getAttribute('src') || '').trim();

      if (src) {
        node.setAttribute('onclick', `__setPreview("${src}")`);
      }
    }

    if (cl.indexOf('row') >= 0) {
      const br = () => {
        const e = document.createElement("br");
        e.setAttribute("class", "clear-both");
        return e;
      }
      const noRow = (e) => !e || e.tagName != "IMG" || (e.getAttribute('class') || '').split(' ').indexOf('row') < 0;

      if (noRow(node.previousElementSibling)) {
        node.parentElement.insertBefore(br(), node);
      }
      if (noRow(node.nextElementSibling)) {
        node.parentElement.insertBefore(br(), node.nextElementSibling);
      }
    }
  }
});

const LinkRegEx = /(http[s]?:\/\/[^\s]+)/g;

const styleLinks = (html) => {
  if (!html || (typeof html != "string")) {
    return '';
  }

  if (html.indexOf("<") >= 0) {
    return html;
  }

  if (html.indexOf("http://") < 0 && html.indexOf("https://") < 0) {
    return html.replaceAll("\n", "<br/>");
  }
  
  const matches = [...html.matchAll(LinkRegEx)];
  if (matches) {
    var shift = 0;
    matches.forEach(m => {
      const href = m[1].replace(/[;,\.\]\)}'"`]$/g, '');;
      const link = `<a href="${href}">${href}</a>${m[1].slice(href.length)}`;
      html = html.slice(0, m.index + shift) + link + html.slice(m.index + m[0].length + shift);

      shift += link.length - m[0].length;
    });
  }
  
  return html.replaceAll("\n", "<br/>");
}

/**
 * Sanitize html code.
 */
const htmlSanitize = (html) => {
  return DOMPurify.sanitize(styleLinks(html), { USE_PROFILES: { html: true } } );
}

/*
* Sanitize html code allowing <br/> and <a href>.
*/
const htmlSimpleSanitize = (html) => {
  return DOMPurify.sanitize(styleLinks(html || '').replaceAll("<p>", "<br/><p>"), 
    { ALLOWED_TAGS: ['#text', 'br', 'a'], ALLOWED_ATTR: ['href'] } );
}

/*
* Sanitize html code allowing <a href>.
*/
const htmlLineSimpleSanitize = (html) => {
  return DOMPurify.sanitize(styleLinks(html || ''), 
    { ALLOWED_TAGS: ['#text', 'a'], ALLOWED_ATTR: ['href'] } ).replaceAll('\r', ' ').replaceAll('\n', ' ');
}

/**
 * Clean html tags.
 */
const htmlClean = (html) => {
  return DOMPurify.sanitize((html || '').replaceAll("<p>", "\n<p>"), { ALLOWED_TAGS: ['#text'] } );
}

/**
 * Clean html tags, remove new lines.
 */
const htmlLineClean = (html) => {
  return DOMPurify.sanitize(html || '', { ALLOWED_TAGS: ['#text'] } ).replaceAll('\r', ' ').replaceAll('\n', ' ');
}

const getArticleState = (state) => {
  switch (state) {
    case -1:
      return "na schválenie";
    case 0:
      return "skrytý";
    case 1:
      return "publikovaný";
    default:
      return "neznámý";
  }
}

const getArticleStateIcon = (state) => {
  switch (state) {
    case 0:
      return <i className="fa fa-eye-slash"/>;
    default:
      return "";
  }
}

const getArticleImage = (intro) => {
  const res = intro && intro.match(/["'](https:\/\/res\.cloudinary\.com\/.*?)["']/);
  const url = res && res.length > 1 ? res[1] : '';

  return fixImageUrl(url, 'c_fill,f_auto,g_auto,w_240,h_240');
}

const isImageValid = (image) => image && image != 'None';

const fixImageUrl = (url, code) => {
  return ((url && url != 'None') ? (url.secure_url || ((url.indexOf("/") < 0 && url.indexOf('res.cloudinary.com') === -1)?
      `${Constants.CloudinaryPath}${url}` : url)) 
    : '').replace(/https:\/\/res\.cloudinary\.com\/cestasnp-sk\/image\/upload(\/[^/]+?)?\/v/, 
    `https://res.cloudinary.com/cestasnp-sk/image/upload${code ? ("/" + code) : ""}/v`);
};

const getArticleCategoryText = (tag) => {
  const index = Constants.ArticleCategories.findIndex(c => c.tag == tag);

  return index >= 0 ? Constants.ArticleCategories[index].text : "";
}

const getTravellersImages = travellers => travellers ? 
  travellers.filter(t => t.lastImg && t.lastImg != "None").map(t => {
    const url = `/na/${t.url_name || t.user_id}${t.finishedTracking ? Constants.FromOldQuery : ''}#${t.lastImgMsgId}`;
    const title = t.meno;

    return { url: url, title: title, src: fixImageUrl(t.lastImg), 
        aspect: (t.lastImg && t.lastImg.width && t.lastImg.height) ? (t.lastImg.height / t.lastImg.width) : 1 };
  }) : [];

const sortActiveTravellers = (travellers, now) => {
  const pad = t => ("00000000000000000000" + t).slice(-20);

  const getSortValue = t => ((t.finishedTracking && differenceInDays(now, parseDate(t.end_date)) >= 2) ? 
    ("11_" + pad(parseDate(t.start_date).valueOf())) 
    : ("0" + (parseDate(t.start_date) <= now && t.lastMessage ? 
      ("0_" + pad(addDays(now, 1).valueOf() - parseDate(t.lastMessage.pub_date).valueOf())) 
      : ("1_" + pad(parseDate(t.start_date).valueOf())))));

  //console.log(travellers.map(t => { return { sort: getSortValue(t), meno: t.meno, start: t.start_date, end: t.end_date, last: (t.lastMessage || {}).pub_date }; }));

  travellers.sort((a, b) => getSortValue(a).localeCompare(getSortValue(b)));

  return travellers;
} 

export { sortByDateDesc, sortByDateAsc, sortByDate, dateToStr, dateTimeToStr, parseDate,
  escapeHtml, htmlSanitize, htmlSimpleSanitize, htmlLineSimpleSanitize, htmlClean, htmlLineClean,
  getArticleState, getArticleStateIcon, getArticleImage, isImageValid, fixImageUrl, getArticleCategoryText, 
  getTravellersImages, sortActiveTravellers };
