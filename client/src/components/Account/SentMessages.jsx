import React, { Component } from 'react';
import moment from 'moment-timezone';

moment.tz.setDefault('Europe/Vienna');

class SentMessages extends Component {
  constructor(props) {
    super(props);
    this.state = {
      msgs: this.props.msgs.sort(function(a, b) {
        if (new Date(b.pub_date) < new Date(a.pub_date)) return -1;
        if (new Date(b.pub_date) > new Date(a.pub_date)) return 1;

        return 0;
      })
    };
  }

  componentDidUpdate(prevProps) {
    if (this.props.msgs !== prevProps.msgs) {
      this.setState({
        msgs: this.props.msgs
      });
    }
  }

  render() {
    return (
      <div id="SentMessages" className="thinRedWrap">
        <h2>Moje správy</h2>
        {this.state.msgs.map((message, i) => (
          <div key={i} className="traveller-message">
            {message.img && message.img !== 'None' && message.img !== null && (
              <img
                src={message.img.eager[0].secure_url}
                style={{
                  display: 'block',
                  margin: '0px auto 15px',
                  minWidth: '80px',
                  maxWidth: '100%',
                  maxHeight: '80vh'
                }}
                alt="fotka z putovania"
                // onClick={() => {
                // this.handleImageBox(
                //     true,
                //     message.img.secure_url,
                // );
                // }}
              />
            )}
            <div className="red-stripe" />
            <p style={{ display: 'inline-block' }}>{message.pub_date}</p>
            <p dangerouslySetInnerHTML={{ __html: message.text }} />
          </div>
        ))}
      </div>
    );
  }
}

export default SentMessages;
