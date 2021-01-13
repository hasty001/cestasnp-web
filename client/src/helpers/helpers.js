import React from 'react';
import * as Constants from '../components/Constants';
import format from 'date-fns/format';
import DOMPurify from 'dompurify';
import { navigate } from '../components/reusable/Navigate';

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
});

const LinkRegEx = /(http[s]?:\/\/[^\s]+)/g;

const styleLinks = (html) => {
  if (!html) {
    return html;
  }

  if (html.indexOf("<") >= 0) {
    return html;
  }

  if (html.indexOf("http://") < 0 && html.indexOf("https://") < 0) {
    return html;
  }
  
  const matches = [...html.matchAll(LinkRegEx)];
  if (matches) {
    var shift = 0;
    matches.forEach(m => {
      const href = m[1].replace(/[;,\.\]\)}]$/g, '');;
      const link = `<a href="${href}">${href}</a>${m[1].slice(href.length)}`;
      html = html.slice(0, m.index + shift) + link + html.slice(m.index + m[0].length + shift);

      shift += link.length - m[0].length;
    });
  }
  return html;
}

/**
 * Sanitize html code.
 */
const htmlSanitize = (html) => {
  return DOMPurify.sanitize(styleLinks(html), { USE_PROFILES: { html: true } } );
}

/**
 * Clean html tags.
 */
const htmlClean = (html) => {
  return DOMPurify.sanitize((html || '').replaceAll("<p>", "\n<p>"), { ALLOWED_TAGS: ['#text'] } );
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

export { sortByDateDesc, sortByDateAsc, dateToStr, dateTimeToStr, escapeHtml, htmlSanitize, htmlClean,
  getArticleState, getArticleStateIcon };
