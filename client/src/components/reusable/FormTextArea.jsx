import React, { useEffect, useState } from 'react';
import { useStateProp } from '../../helpers/reactUtils';
import FormItem from './FormItem';
import { CompositeDecorator, Editor, EditorState, Modifier } from "draft-js";
import "draft-js/dist/Draft.css";
import { stateFromHTML } from 'draft-js-import-html';
import { stateToHTML } from 'draft-js-export-html';
import { findImageEntities, findLinkEntities, Image, Link, optionsFromHTML, optionsToHTML } from './Decorators';

const FormTextArea = (props) => {

  const decorator = new CompositeDecorator([
    {
      strategy: findLinkEntities,
      component: Link
    },
    {
      strategy: findImageEntities,
      component: Image
    },
  ]);

  const [value, setValue] = useStateProp(props.value);
  const [editorState, setEditorState] = useState(EditorState.createEmpty(decorator));

  useEffect(() => {
    if (props.html) {
      setEditorState(EditorState.createWithContent(stateFromHTML(value, optionsFromHTML), decorator));
    }
  }, [value, props.html]);

  /*
  const toolbarConfig = {
    display: ['INLINE_STYLE_BUTTONS', 'BLOCK_ALIGNMENT_BUTTONS', 'BLOCK_TYPE_BUTTONS', 'LINK_BUTTONS', 'IMAGE_BUTTON', 'BLOCK_TYPE_DROPDOWN', 'HISTORY_BUTTONS'],
    INLINE_STYLE_BUTTONS: [
      {label: 'Tučne', style: 'BOLD'},
      {label: 'Kurzíva', style: 'ITALIC'},
    ],
    BLOCK_TYPE_DROPDOWN: [
      {label: 'Normálny', style: 'unstyled'},
      {label: 'Veľký nadpis', style: 'header-two'},
      {label: 'Nadpis', style: 'header-three'},
      {label: 'Malý nadpis', style: 'header-four'},
      {label: 'Citace', style: 'blockquote'},
      {label: 'Kód', style: 'code-block'}
    ],
    BLOCK_ALIGNMENT_BUTTONS: [
      {label: 'Vľevo', style: 'ALIGN_LEFT'},
      {label: 'Na stred', style: 'ALIGN_CENTER'},
      {label: 'Vpravo', style: 'ALIGN_RIGHT'}
    ],
    LINK_BUTTONS: { link: { label: 'Odkaz' }, removeLink: { label: 'Odstaniť odkaz' } },
    BLOCK_TYPE_BUTTONS: [
      {label: 'Odrážky', style: 'unordered-list-item'},
      {label: 'Číslovaný zoznam', style: 'ordered-list-item'}
    ]
  };*/

  const paste = (text, html, editorState) => {
    if (html) {
      const pastedBlock = stateFromHTML(html, optionsFromHTML).getBlockMap();
      const newContent = Modifier.replaceWithFragment(editorState.getCurrentContent(), 
        editorState.getSelection(), pastedBlock);
      setEditorState(EditorState.push(editorState, newContent, 'insert-fragment'));

      return true;
    }
  }

  return (
    <FormItem {...props} value={value}>
      {!!props.html ? 
      <Editor editorState={editorState} onChange={s => setEditorState(s)} handlePastedText={paste}
        onBlur = {() => setValue(stateToHTML(editorState.getCurrentContent(), optionsToHTML).replaceAll('>&nbsp;</img>', '/>'))}/>
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
        />)}
    </FormItem>
  )
}
export default FormTextArea;