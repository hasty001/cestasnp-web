import React from 'react';
import moment from 'moment';
import Loader from '../reusable/Loader';
import Message from './Message';
import SentMessages from './SentMessages';

class TravellerAccount extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      meno: this.props.traveller.travellerDetails.meno,
      popis: this.props.traveller.travellerDetails.text,
      zaciatok: this.props.traveller.travellerDetails.start_miesto,
      pocet: this.props.traveller.travellerDetails.number,
      start_date: this.props.traveller.travellerDetails.start_date,
      user_id: this.props.traveller.travellerDetails.user_id,
      travellerId: this.props.traveller.travellerDetails._id,
      travellerMsgs: this.props.traveller.travellerMessages || [],
      loading: 0,
      edit: {
        meno: 0,
        popis: 0,
        zaciatok: 0,
        pocet: 0,
        start_date: 0
      },
      error: '',
      successMsg: ''
    };
    this.handleChange = this.handleChange.bind(this);
    this.updateTraveller = this.updateTraveller.bind(this);
    this.updateTravellerMsgs = this.updateTravellerMsgs.bind(this);
    this.triggerEdit = this.triggerEdit.bind(this);
  }

  handleChange(event) {
    if (event.target.name === 'start_date') {
      this.setState({
        [event.target.name]: event.target.value.toString(),
        error: '',
        successMsg: ''
      });
    } else {
      this.setState({
        [event.target.name]: event.target.value,
        error: '',
        successMsg: ''
      });
    }
  }

  updateTravellerMsgs(msg) {
    const updatedMsgs = this.state.travellerMsgs;
    updatedMsgs.push(msg);
    updatedMsgs.sort((a, b) => {
      if (new Date(b.pub_date) < new Date(a.pub_date)) return -1;
      if (new Date(b.pub_date) > new Date(a.pub_date)) return 1;

      return 0;
    });
    this.setState({
      // eslint-disable-next-line react/no-unused-state
      travellerMessages: updatedMsgs
    });
  }

  triggerEdit(target) {
    const editUpdate = this.state.edit;
    editUpdate[target] = this.state.edit[target] === 1 ? 0 : 1;
    this.setState({
      edit: editUpdate
    });
  }

  updateTraveller() {
    const { meno, popis, zaciatok, pocet, start_date, user_id } = this.state;

    if (
      meno === this.props.traveller.travellerDetails.meno &&
      popis === this.props.traveller.travellerDetails.text &&
      zaciatok === this.props.traveller.travellerDetails.start_miesto &&
      pocet === this.props.traveller.travellerDetails.number &&
      start_date === this.props.traveller.travellerDetails.start_date &&
      user_id === this.props.traveller.travellerDetails.user_id
    ) {
      this.setState({
        error: 'Nič si nezmenil'
      });
      return;
    }

    if (!meno || meno.trim().length === 0) {
      this.setState({
        error: 'Názov nesmie byť prázdny!'
      });
      return;
    }

    if (!popis || popis.trim().length === 0) {
      this.setState({
        error: 'Popis nesmie byť prázdny!'
      });
      return;
    }

    if (popis.trim().length < 32) {
      this.setState({
        error: 'Popis cesty je príliš krátky (min. 32 znakov)!'
      });
      return;
    }

    if (pocet.trim().length < 0 || pocet < 0) {
      this.setState({
        error: 'Počet účasníkov nesmie byť záporný!'
      });
      return;
    }

    if (
      start_date !== this.props.traveller.travellerDetails.start_date &&
      moment(start_date).diff(moment(), 'days') < 0
    ) {
      this.setState({
        error: 'Začiatok cesty je v minulosti. Vyber iný dátum!'
      });
      return;
    }

    this.setState({
      loading: 1
    });

    fetch('/api/traveller/updateTraveller', {
      method: 'POST',
      body: JSON.stringify({
        meno,
        text: popis,
        start_date,
        uid: user_id,
        start_miesto: zaciatok,
        number: pocet,
        end_date: '',
        completed: '',
        email: 0,
        finishedTracking: false
      }),
      headers: new Headers({
        'Content-Type': 'application/json'
      })
    })
      .then(resp => resp.json())
      .then(() => {
        this.setState({
          loading: 0,
          edit: {
            meno: 0,
            popis: 0,
            zaciatok: 0,
            pocet: 0,
            start_date: 0
          },
          error: '',
          successMsg: 'Detaily tvojej cesty sme úspešne zmenili'
        });
        this.props.traveller.updateTravellerDetails({
          meno,
          text: popis,
          start_date,
          uid: user_id,
          start_miesto: zaciatok,
          number: pocet,
          end_date: '',
          completed: '',
          email: 0,
          finishedTracking: false
        });
      })
      .catch(e => {
        console.error('fanAccount err ', e);
      });
  }

  render() {
    return (
      <form
        className="fanAccountWrap"
        onSubmit={e => {
          this.updateTraveller();
          e.preventDefault();
        }}
      >
        <Message
          userId={this.state.user_id}
          travellerId={this.state.travellerId}
          updateTravellerMsgs={this.updateTravellerMsgs}
        />
        {this.state.travellerMsgs.length > 0 && (
          <SentMessages msgs={this.state.travellerMsgs} />
        )}
        <h2>Moja cesta</h2>
        <p>
          Tu si môžeš upraviť detaily o svojej ceste a zároveň posielať správy.
        </p>
        <label htmlFor="meno">
          <span onClick={() => this.triggerEdit('meno')}>
            Moja cesta <i className="fas fa-edit" />
          </span>
          {this.state.edit.meno ? (
            <input
              id="meno"
              name="meno"
              value={this.state.meno}
              type="text"
              maxLength="30"
              onBlur={e => {
                this.handleChange(e);
                e.preventDefault();
              }}
              onChange={this.handleChange}
            />
          ) : (
            <p className="travellerP">{this.state.meno}</p>
          )}
        </label>
        <label htmlFor="popis">
          <span onClick={() => this.triggerEdit('popis')}>
            Popis <i className="fas fa-edit" />
          </span>
          {this.state.edit.popis ? (
            <textarea
              id="popis"
              name="popis"
              value={this.state.popis}
              onBlur={e => {
                this.handleChange(e);
                e.preventDefault();
              }}
              onChange={this.handleChange}
            />
          ) : (
            <p className="travellerP">{this.state.popis}</p>
          )}
        </label>
        <label htmlFor="zaciatok">
          <span
            onClick={() => {
              this.triggerEdit('zaciatok');
              this.triggerEdit('start_date');
            }}
          >
            Začiatok <i className="fas fa-edit" />
          </span>
          {this.state.edit.zaciatok ? (
            <input
              id="zaciatok"
              name="zaciatok"
              value={this.state.zaciatok}
              onBlur={e => {
                this.handleChange(e);
                e.preventDefault();
              }}
              onChange={this.handleChange}
            />
          ) : (
            <p className="travellerP">{this.state.zaciatok}</p>
          )}
        </label>
        <label htmlFor="start_date">
          {this.state.edit.start_date ? (
            <input
              type="date"
              id="start_date"
              name="start_date"
              value={this.state.start_date}
              onBlur={e => {
                this.handleChange(e);
                e.preventDefault();
              }}
              onChange={this.handleChange}
            />
          ) : (
            <p className="travellerP">{this.state.start_date}</p>
          )}
        </label>
        <label htmlFor="pocet">
          <span onClick={() => this.triggerEdit('pocet')}>
            Počet <i className="fas fa-edit" />
          </span>
          {this.state.edit.pocet ? (
            <input
              type="number"
              id="pocet"
              name="pocet"
              value={this.state.pocet}
              onBlur={e => {
                this.handleChange(e);
                e.preventDefault();
              }}
              onChange={this.handleChange}
            />
          ) : (
            <p className="travellerP">{this.state.pocet}</p>
          )}
        </label>
        {this.state.error && <p className="errorMsg">{this.state.error}</p>}
        {this.state.successMsg && (
          <p className="successMsg">{this.state.successMsg}</p>
        )}
        {this.state.loading ? (
          <Loader />
        ) : (
          <button
            className="snpBtn"
            onClick={this.updateTraveller}
            type="submit"
          >
            Uložiť zmeny
          </button>
        )}
      </form>
    );
  }
}
export default TravellerAccount;
