import { EditorState } from 'draft-js';
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

  const imageAlign = (align) => {
    const { className } = props.contentState.getEntity(props.entityKey).getData();

    const list = (className || '').split(' ');
    const index = Math.max(list.indexOf('left'), list.indexOf('center'), list.indexOf('right'), list.indexOf('row'));
    if (index >= 0) {
      list[index] = align;
    } else {
      list.push(align);
    }

    props.mergeEntityData(props.blockKey, props.start, props.end, props.entityKey, { className: list.join(' ').trim() });
  }

  const imageToggleClass = (value) => {
    const { className } = props.contentState.getEntity(props.entityKey).getData();

    const list = (className || '').split(' ');
    const index = list.indexOf(value);
    if (index >= 0) {
      list.splice(index, 1);
    } else {
      list.push(value);
    }

    props.mergeEntityData(props.blockKey, props.start, props.end, props.entityKey, { className: list.join(' ').trim() });
  } 

  const block = props.contentState.getBlockForKey(props.blockKey);

  const beforeKey = props.start > 0 ? block.getEntityAt(props.start - 1) : null;
  const before = (beforeKey && beforeKey != props.entityKey) ? props.contentState.getEntity(beforeKey) : null;

  const afterKey = block.getEntityAt(props.end);
  const after = (afterKey && afterKey != props.entityKey) ? props.contentState.getEntity(afterKey) : null;

  const noRow = (e) => (className || '').split(' ').indexOf('row') >= 0 
    && (!e || e.getType() != "IMAGE" || (e.getData()['className'] || '').split(' ').indexOf('row') < 0);

  return (
    <>
      {noRow(before) && <br className="clear-both"/>}
      <span className={`editor-image ${className}`}>
        <img src={src} alt={alt} title={title}/>
        <span className="editor-image-buttons">
          <button title="Vľavo" onMouseDown={e => { e.preventDefault(); imageAlign('left'); }}><i className="fas fa-align-left" /></button>
          <button title="Na stred" onMouseDown={e => { e.preventDefault(); imageAlign('center'); }}><i className="fas fa-align-center" /></button>
          <button title="V rade" onMouseDown={e => { e.preventDefault(); imageAlign('row'); }}><i className="fas fa-align-center" /><i className="fas fa-align-center" /></button>
          <button title="Vpravo" onMouseDown={e => { e.preventDefault(); imageAlign('right'); }}><i className="fas fa-align-right" /></button>
          <button title="Malý" onMouseDown={e => { e.preventDefault(); imageToggleClass('small'); }}><i className="fas fa-compress" /></button>
          <button title="S náhľadom" onMouseDown={e => { e.preventDefault(); imageToggleClass('preview'); }}><i className="fas fa-external-link-alt" /></button>
          <button title="Zmazať" onMouseDown={e => { e.preventDefault(); props.removeEntity(props.blockKey, props.start, props.end); }}><i className="fas fa-trash-alt" /></button>
        </span>
      </span>
      {noRow(after) && <br className="clear-both"/>}
    </>
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