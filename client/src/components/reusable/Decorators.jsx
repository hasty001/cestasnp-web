import React from 'react';

function findLinkEntities(contentBlock, callback, contentState) {
  contentBlock.findEntityRanges(
    (character) => {
      const entityKey = character.getEntity();
      return (
        entityKey !== null &&
        contentState.getEntity(entityKey).getType() === 'LINK'
      );
    },
    callback
  );
}

const Link = (props) => {
  const {url} = props.contentState.getEntity(props.entityKey).getData();
  return (
    <a href={url}>
      {props.children}
    </a>
  );
};

function findImageEntities(contentBlock, callback, contentState) {
  contentBlock.findEntityRanges(
    (character) => {
      const entityKey = character.getEntity();
      return (
        entityKey !== null &&
        contentState.getEntity(entityKey).getType() === 'IMAGE'
      );
    },
    callback
  );
}

const Image = (props) => {
  const {
    className, src, alt, title
  } = props.contentState.getEntity(props.entityKey).getData();

  return (
    <img className={className} src={src} alt={alt} title={title}/>
  );
};

const inlineFn = (element, inlineCreators) => {
  if (element.tagName == "IMG") {
    return inlineCreators.Entity("IMAGE", { src: element.getAttribute('src'), 
      className: element.getAttribute('class'), alt: element.getAttribute('alt'),
      title: element.getAttribute('title') });
  }

  if (element.tagName === 'SPAN') {
    const style = element.getAttribute('style');

    if (style && style.indexOf('font-style: italic') >= 0) {
      return inlineCreators.Style('ITALIC');
    }
    if (style && style.indexOf('font-weight: bold') >= 0) {
      return inlineCreators.Style('BOLD');
    }
  }
}

const imageOutFn = (entity) => {
  if (entity.getType() === 'IMAGE') {
    const {
      className, src, alt, title
    } = entity.getData()

    return {
      element: 'img',
      attributes: { className, src, alt, title },
      style: null
    };
  }
}

const optionsFromHTML = { customInlineFn: inlineFn };
const optionsToHTML = { entityStyleFn: imageOutFn };

export { findLinkEntities, Link, findImageEntities, Image, optionsFromHTML, optionsToHTML };