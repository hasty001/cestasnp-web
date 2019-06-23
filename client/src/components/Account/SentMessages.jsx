import React, { Component, Fragment } from 'react';
import moment from 'moment-timezone';

moment.tz.setDefault('Europe/Vienna');

class SentMessages extends Component {
    constructor(props) {
        super(props);
        this.state = {
            msgs: this.props.msgs.sort((a,b) => new Date(b.pub_date) - new Date(a.pub_date))
        };
        // this.triggerEdit = this.triggerEdit.bind(this);
    }

    //   triggerEdit(target) {
    //     console.log('trigger event ', target)
    //     let edit = this.state.edit
    //     edit[target] = this.state.edit[target] === 1 ? 0 : 1
    //     this.setState({
    //         edit
    //     })
    //   }
    componentDidUpdate(prevProps) {
        if (this.props.msgs != prevProps.msgs) {
            this.setState({
                msgs: this.props.msgs
            })
        }
    }

    render() {
        return (
            <div id="SentMessages" className="thinRedWrap">
                <h2>Tvoje správy</h2>
                {this.state.msgs.map((message, i) => 
                    <div key={i} className="traveller-message">
                        {message.img &&
                            message.img !== 'None' &&
                            message.img !== null && (
                            <img
                                src={
                                typeof message.img === 'string' &&
                                message.img.indexOf('res.cloudinary.com') === -1
                                    ? 'https://res.cloudinary.com/cestasnp-sk/image/upload/v1520586674/img/sledovanie/' +
                                    message.img
                                    : message.img
                                }
                                style={{
                                display: 'block',
                                margin: '0px auto 15px',
                                minWidth: '80px',
                                maxWidth: '100%',
                                maxHeight: '80vh',
                                }}
                                alt="fotka z putovania"
                                onClick={() => {
                                this.handleImageBox(
                                    true,
                                    message.img.indexOf('res.cloudinary.com') === -1
                                    ? 'https://res.cloudinary.com/cestasnp-sk/image/upload/v1520586674/img/sledovanie/' +
                                        message.img
                                    : message.fullImg,
                                );
                                }}
                            />
                            )}
                        <div className="red-stripe" />
                        <p style={{ display: 'inline-block' }}>
                            {message.pub_date}
                        </p>
                        <p dangerouslySetInnerHTML={{ __html: message.text }} />
                    </div>
                )}
            </div>
        );
    }
}

export default SentMessages;
