import React, { useEffect, useState, useRef } from 'react';
import { useStateEx, useStateProp } from '../../helpers/reactUtils';
import FormItem from './FormItem';
import { CompositeDecorator, Editor, EditorState, Modifier, RichUtils, SelectionState } from "draft-js";
import "draft-js/dist/Draft.css";
import { stateFromHTML } from 'draft-js-import-html';
import { stateToHTML } from 'draft-js-export-html';
import { findImageEntities, findLinkEntities, Image, Link, optionsFromHTML, optionsToHTML } from './Decorators';
import LinkBox from './LinkBox';
import CloudinaryWidget from './CloudinaryWidget';
import * as Constants from '../Constants';
import {getDefaultKeyBinding, KeyBindingUtil} from 'draft-js';
const {hasCommandModifier} = KeyBindingUtil;

const FormTextArea = (props) => {

  const [value, setValue] = useStateProp(props.value);
  const [editorState, setEditorState] = useState(() => EditorState.createEmpty(decorator));
  const [savedSelection, setSavedSelection] = useState();
  const [savedScrollTop, setSavedScrollTop] = useState();
  const [linkUrl, setLinkUrl] = useState(null);
  const [linkSelection, setLinkSelection] = useState();
  const [imageId, setImageId] = useState(null);

  const editor = useRef(null);

  const focus = (selection, scrollTop) => {
    setTimeout(() => {
      editor.current.focus();

      if (selection) {
        setTimeout(() => {        
          setEditorState(editorState => EditorState.forceSelection(editorState, selection));

          if (scrollTop) {
            setTimeout(() => {
              editor.current.editor.parentElement.parentElement.scrollTop = scrollTop;
            }, 100);    
          }
        }, 200);
      }
    }, 50);
  };

  const mergeEntityData = (blockKey, start, end, entityKey, value) => {
    setEditorState(editorState => {   
      const selection = SelectionState.createEmpty(blockKey).set('anchorOffset', start).set('focusOffset', start);

      return EditorState.forceSelection(
        EditorState.push(editorState, editorState.getCurrentContent().mergeEntityData(entityKey, value),
        'apply-entity'), selection);
    });

    focus();
  }

  const removeEntity = (blockKey, start, end) => {
    setEditorState(editorState => {
      const contentState = editorState.getCurrentContent();
      const selection = SelectionState.createEmpty(blockKey).merge(
        { anchorKey: blockKey, anchorOffset: start, focusKey: blockKey, focusOffset: end });
      const newContent = Modifier.removeRange(contentState, selection, 'forward');

      return EditorState.push(editorState, newContent, 'remove-range');
    });
    focus();
  }

  const toggleInline = (style) => {
    setEditorState(RichUtils.toggleInlineStyle(editorState, style));
    focus();
  }

  const toggleBlock = (style) => {
    setEditorState(RichUtils.toggleBlockType(editorState, style));
    focus();
  }

  const showImage = () => {
    setSavedSelection(selection => editorState.getSelection() || selection)      
    setSavedScrollTop(editor.current.editor.parentElement.parentElement.scrollTop);

    setImageId(Date.now());
  }

  const insertImage = (img) => {
    setImageId(null);
      
    const pastedBlock = stateFromHTML(`<img class="left" src="${img.secure_url}" />`, optionsFromHTML).getBlockMap();

    const start = savedSelection.getStartOffset();
    const newContent = Modifier.replaceWithFragment(editorState.getCurrentContent(), 
      savedSelection.set('anchorOffset', start).set('focusOffset', start), pastedBlock);
    setEditorState(EditorState.push(editorState, newContent, 'insert-fragment'));

    focus(savedSelection, savedScrollTop);
  }

  const showLink = () => {
    setSavedSelection(selection => editorState.getSelection() || selection);              
    setSavedScrollTop(editor.current.editor.parentElement.parentElement.scrollTop);

    const selection = editorState.getSelection();

    if (selection.getStartKey() == selection.getEndKey()) {
      const content = editorState.getCurrentContent();
      const block = content.getBlockForKey(selection.getStartKey());

      const entityKey = block.getEntityAt(selection.getStartOffset());
      const entity = entityKey ? content.getEntity(entityKey) : null;

      if (entity && entity.getType() == "LINK") {
        var start = selection.getStartOffset();
        while (start > 0 && block.getEntityAt(start) == entityKey) start--;
        var end = selection.getStartOffset();
        while (end < block.getLength() - 1 && block.getEntityAt(end) == entityKey) end++;

        setLinkSelection(SelectionState.createEmpty(selection.getStartKey()).set('anchorOffset', start).set('focusOffset', end));
        setLinkUrl(entity.getData()['url'] || "");
      } else if (selection.getStartOffset() != selection.getEndOffset()) {
        setLinkSelection(selection); 
        setLinkUrl("");
      }
    }
  }

  const setLink = (url, hide) => {
    setLinkUrl(null);

    if (!hide) {
      const newContentState = url ? editorState.getCurrentContent().createEntity('LINK', 'MUTABLE', { url }) 
      : editorState.getCurrentContent();
      const entityKey = url ? newContentState.getLastCreatedEntityKey() : null;

      setEditorState(RichUtils.toggleLink(EditorState.push(editorState, newContentState), linkSelection, entityKey));
    }

    focus(savedSelection, savedScrollTop);
  }

  const keyBindingFn = (e) => {
    if (e.keyCode === 66 /* `B` key */ && hasCommandModifier(e)) {
      return 'toggle-bold';
    }
    if (e.keyCode === 75 /* `K` key */ && hasCommandModifier(e)) {
      return 'insert-link';
    }

    return getDefaultKeyBinding(e);
  }

  const handleKeyCommand = (command) => {
    if (command === 'insert-link') {
      showLink();
      return 'handled';
    }
    if (command === 'toggle-bold') {
      toggleInline("BOLD"); 
      return 'handled';
    }
    return 'not-handled';
  }

  const decorator = new CompositeDecorator([
    {
      strategy: findLinkEntities,
      component: Link,
      props: { mergeEntityData, removeEntity }
    },
    {
      strategy: findImageEntities,
      component: Image,
      props: { mergeEntityData, removeEntity }
    },
  ]);

  useEffect(() => {
    if (props.html) {
      setEditorState(EditorState.createWithContent(stateFromHTML(value, optionsFromHTML), decorator));
    }
  }, [value, props.html]);

  const paste = (text, html, editorState) => {
    if (html) {
      const pastedBlock = stateFromHTML(html, optionsFromHTML).getBlockMap();
      const newContent = Modifier.replaceWithFragment(editorState.getCurrentContent(), 
        editorState.getSelection(), pastedBlock);
      setEditorState(EditorState.push(editorState, newContent, 'insert-fragment'));

      return true;
    }
  }

  const inlineHas = (value) => {
    if (editorState)
    try {
      return editorState.getCurrentInlineStyle().has(value) ? "down" : ""; 
    } catch (e) {
      console.error(e);
    }
    return "";
  }

  const blockHas = (value) => {
    if (editorState)
    try {
      return RichUtils.getCurrentBlockType(editorState) == value ? "down" : "";
    } catch (e) {
      console.error(e);
    }
    return "";
  }

  const hasLink = () => {
    if (editorState)
    try {
      const selection = editorState.getSelection();

      if (selection.getStartKey() == selection.getEndKey()) {
        const content = editorState.getCurrentContent();
        const block = content.getBlockForKey(selection.getStartKey());

        const entityKey = block.getEntityAt(selection.getStartOffset());
        const entity = entityKey ? content.getEntity(entityKey) : null;

        return (entity && entity.getType() == "LINK") ? "down" : "";
      }
    } catch (e) {
      console.error(e);
    }

    return "";
  }

  return (
    <FormItem {...props} value={value}>
      {!!props.html ? 
      (<div>
         <LinkBox show={linkUrl != null} 
           url={linkUrl}
           onConfirm={url => setLink(url)}
           onDelete={() => setLink(null)}
           onHide={() => setLink(null, true)}
           />
        <CloudinaryWidget show={!!imageId} uid={props.uid} imageId={imageId} 
            updateImageDetails={i => insertImage(i)} type={Constants.ImageType.Clanky} />
         <div className="editor-toolbar">
           <button title="Tučne" className={inlineHas("BOLD")} onMouseDown={e => { e.preventDefault(); toggleInline("BOLD"); }}><strong>B</strong></button>
           <button title="Kurzíva" className={inlineHas("ITALIC")} onMouseDown={e => { e.preventDefault(); toggleInline("ITALIC"); }}><em>I</em></button>
           <button title="Normálny" className={blockHas("unstyled")} onMouseDown={e => { e.preventDefault(); toggleBlock("unstyled"); }}>t</button>
           <button title="Veľký nadpis" className={blockHas("header-two")} onMouseDown={e => { e.preventDefault(); toggleBlock("header-two"); }}>H2</button>
           <button title="Nadpis" className={blockHas("header-three")} onMouseDown={e => { e.preventDefault(); toggleBlock("header-three"); }}>H3</button>
           <button title="Malý nadpis" className={blockHas("header-four")} onMouseDown={e => { e.preventDefault(); toggleBlock("header-four"); }}>H4</button>
           <button title="Citácie" className={blockHas("blockquote")} onMouseDown={e => { e.preventDefault(); toggleBlock("blockquote"); }}>""</button>
           <button title="Odrážky" className={blockHas("unordered-list-item")} onMouseDown={e => { e.preventDefault(); toggleBlock("unordered-list-item"); }}>-t</button>
           <button title="Číslovaný zoznam" className={blockHas("ordered-list-item")} onMouseDown={e => { e.preventDefault(); toggleBlock("ordered-list-item"); }}>1.</button>
           <button title="Odkaz" className={hasLink()} onMouseDown={e => { e.preventDefault(); showLink(); }}><i className="fas fa-link"></i></button>
           <button title="Obrázok" onMouseDown={e => { e.preventDefault(); showImage(); }}><i className="far fa-images"></i></button>
         </div>
         
         <Editor ref={editor} editorState={editorState} onChange={s => setEditorState(s)} handlePastedText={paste}
         keyBindingFn={keyBindingFn} handleKeyCommand={handleKeyCommand}
           onBlur={() => { setValue(stateToHTML(editorState.getCurrentContent(), optionsToHTML).replaceAll('>&nbsp;</img>', '/>')); }}/>
       </div>)
      :
      (<textarea
        className={props.itemClassName}
        type="text"
        id={props.valueName}
        name={props.valueName}
        onBlur={e => {
          e.preventDefault();
          setValue(e.target.value);
        }}
        onChange={e => setValue(e.target.value)}
        value={value}
        {...props.inputAttrs}
        />)}
    </FormItem>
  )
}
export default FormTextArea;