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
  if (!html) {
    return html;
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
  return DOMPurify.sanitize(styleLinks(html), { ALLOWED_TAGS: ['#text', 'br', 'a'], ALLOWED_ATTR: ['href'] } );
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

  return fixImageUrl(url, 'c_fill,w_240,h_240');
}

const fixImageUrl = (url, code) => {
  return (url || '').replace(/https:\/\/res\.cloudinary\.com\/cestasnp-sk\/image\/upload(\/[^/]+?)?\/v/, 
    `https://res.cloudinary.com/cestasnp-sk/image/upload${code ? ("/" + code) : ""}/v`);
};

const getArticleCategoryText = (tag) => {
  const index = Constants.ArticleCategories.findIndex(c => c.tag == tag);

  return index >= 0 ? Constants.ArticleCategories[index].text : "";
}

export { sortByDateDesc, sortByDateAsc, dateToStr, dateTimeToStr, 
  escapeHtml, htmlSanitize, htmlSimpleSanitize, htmlClean, htmlLineClean,
  getArticleState, getArticleStateIcon, getArticleImage, fixImageUrl, getArticleCategoryText };
