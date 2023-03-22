import React from 'react';
import history from "../../helpers/history";

const isModifiedEvent = (event) =>
  !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);

const isNormalClickEvent = (event) =>
  !event.defaultPrevented && // onClick prevented default
  event.button === 0 && // ignore right clicks
  !isModifiedEvent(event); // ignore clicks with modifier keys

/**
 * Navigate via router, pass event object of anchor click or string url.
 */
const navigate = (value) => {
  if (typeof value === "string") {
    if (value.startsWith("https://") || value.startsWith("http://")) {
      window.location = value;
    } else {
      history.push(value);
    }
  } else {
    const event = value;

    if (isNormalClickEvent(event)) {
      const href = event.currentTarget.getAttribute("href")
      if (href.startsWith("https://") || href.startsWith("http://")) {
        return;
      }

      event.preventDefault();

      history.push(href);
    }
  }
}

/**
 * Generates link for navigation via router, pass href, attrs and child content.
 */
const generateAnchor = (href, attrs = '', content = '') => {
  if (!window.__navigate) {
    window.__navigate = navigate;
  }

  return (`<a href="${href}" onclick="__navigate(event)" ${attrs} >${content}</a>`);
}

/**
 * Link for navigation via router, set href property.
 */
const A = ({ href, children, ...attrs }) => (
  <a href={href} onClick={(e) => navigate(e)} {...attrs} >{children}</a>);

export { A, generateAnchor, navigate, isNormalClickEvent }