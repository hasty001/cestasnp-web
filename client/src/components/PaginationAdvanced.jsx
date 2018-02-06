import React from 'react';
import { Pagination } from 'react-bootstrap';

const PaginationAdvanced = props => (
  <Pagination
    prev
    next
    first
    last
    ellipsis
    boundaryLinks
    items={props.totalArticles}
    maxButtons={3}
    activePage={props.activePage}
    onSelect={props.handlePageSelect}
  />
);

export default PaginationAdvanced;
