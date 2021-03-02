import React from 'react';
import { DropdownButton, MenuItem } from 'react-bootstrap';

const ArticleFilter = (props) => {

  return (
    <DropdownButton
      title={props.title}
      key="1"
      id="dropdown-basic-1"
      style={{ display: 'block' }}
    >
      {!!props.articleCategories && props.articleCategories.map((category, i) => (
          <MenuItem
            eventKey={i}
            key={i}
            onSelect={props.handleCategorySelect}
          >
            {category.text}
          </MenuItem>
        ))}
    </DropdownButton>
  );
}

export default ArticleFilter;
