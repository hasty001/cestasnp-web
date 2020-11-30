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
    history.push(value);
  } else {
    const event = value;

    if (isNormalClickEvent(event)) {
      event.preventDefault();

      history.push(event.currentTarget.getAttribute("href"));
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