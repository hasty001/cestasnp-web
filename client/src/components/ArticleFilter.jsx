import React from 'react'
import { DropdownButton, MenuItem } from 'react-bootstrap'

const ArticleFilter = (props) => (
  <DropdownButton title='Vyber si kategóriu'
    key={'1'} 
    id={'dropdown-basic-1'}
    style={{ display: 'block' }}>
    {props.articleCategories.map((category, i) => {
      if (i === props.activeFilter) {
        return <MenuItem eventKey={i} key={i} active onSelect={props.handleCategorySelect}>{category.text}</MenuItem>
      } else {
        return <MenuItem eventKey={i} key={i} onSelect={props.handleCategorySelect}>{category.text}</MenuItem>
      }
    })}
  </DropdownButton>
)

export default ArticleFilter
