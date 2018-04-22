import React, { Component } from 'react';
import { Modal, Button } from 'react-bootstrap';

class CommentBox extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Modal
        {...this.props}
        show={this.props.show}
        onHide={this.props.onHide}
        dialogClassName="comment-box"
        style={{ marginTop: '100px' }}
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-lg">Tvoj koment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Modal</p>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={this.handleHide}>Pridaj koment</Button>
          <Button onClick={this.props.onHide}>Zavri</Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default CommentBox;
