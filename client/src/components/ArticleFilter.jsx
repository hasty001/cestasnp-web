import React, { Component } from 'react';
import { DropdownButton, MenuItem } from 'react-bootstrap';
class ArticleFilter extends Component {
  constructor(props) {
    super(props);
    this.state = {
      articleCategories: this.props.articleCategories,
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      articleCategories: nextProps.articleCategories,
    });
  }

  render() {
    return (
      <DropdownButton
        title="Vyber si kategóriu"
        key={'1'}
        id={'dropdown-basic-1'}
        style={{ display: 'block' }}
      >
        {this.state.articleCategories.map((category, i) => {
          return (
            <MenuItem eventKey={i} key={i} onSelect={this.props.handleCategorySelect}>
              {category.text}
            </MenuItem>
          );
        })}
      </DropdownButton>
    );
  }
}

export default ArticleFilter;
