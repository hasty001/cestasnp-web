import React from 'react'
import moment from 'moment'
import Loader from '../reusable/Loader'

class TravellerAccount extends React.Component {

    constructor(props) {
        super(props) 
        this.state = {
          meno: this.props.traveller.travellerDetails.meno,
          error: "",
          popis: this.props.traveller.travellerDetails.text,
          zaciatok: this.props.traveller.travellerDetails.start_miesto,
          pocet: this.props.traveller.travellerDetails.number,
          start_date: this.props.traveller.travellerDetails.start_date,
          user_id: this.props.traveller.travellerDetails.user_id,
          loading: 0,
        }
        this.handleChange=this.handleChange.bind(this)
        this.updateTraveller=this.updateTraveller.bind(this)
    }

    handleChange(event) {
        if (event.target.name === 'start_date') {
            this.setState({
                [event.target.name]: event.target.value.toString(),
                error: "",
            })
        } else {
            this.setState({
                [event.target.name]: event.target.value,
                error: "",
            })
        }
    }

    updateTraveller() {
        let {
            meno,
            popis,
            zaciatok,
            pocet,
            start_date,
            user_id,
        } = this.state

        if (
          popis === this.props.traveller.travellerDetails.text &&
          zaciatok === this.props.traveller.travellerDetails.start_miesto &&
          pocet === this.props.traveller.travellerDetails.number &&
          start_date === this.props.traveller.travellerDetails.start_date &&
          user_id === this.props.traveller.travellerDetails.user_id
        ) {
            this.setState({
                error: "Nič si nezmenil"
            })
            return 
        }

        if (!meno || meno.trim().length === 0) {
            this.setState({
                error: "Názov nesmie byť prázdny!"
            })
            return
        }

        if (!popis || popis.trim().length === 0) {
            this.setState({
                error: "Popis nesmie byť prázdny!"
            })
            return
        }

        if (pocet.trim().length < 0 || pocet < 0) {
            this.setState({
                error: "Počet účasníkov nesmie byť záporný!"
            })
            return
        }

        if (moment(start_date).diff(moment(), 'days') < 0) {
            this.setState({
                error: "Začiatok cesty je v minulosti. Vyber iný dátum!"
            })
            return
        }

        this.setState({
            loading: 1
        })

        fetch('/api/traveller/updateTraveller', {
            method: 'POST',
            body: JSON.stringify({
                meno,
                text: popis,
                start_date,
                uid: user_id,
                start_miesto: zaciatok,
                number: pocet,
                end_date: "", 
                completed: "", 
                email: 0, 
                finishedTracking: false,
            }),
            headers: new Headers({
              'Content-Type': 'application/json',
            }),
        })
        .then(resp => resp.json())
        .then(travellerDetails => {
            console.log('UPDATED successfully ', travellerDetails);
            this.setState({
                loading: 0
            })
            this.props.traveller.updateTravellerDetails({
                meno,
                text: popis,
                start_date,
                uid: user_id,
                start_miesto: zaciatok,
                number: pocet,
                end_date: "", 
                completed: "", 
                email: 0, 
                finishedTracking: false,
            })
            return
        })
        .catch(e => {
            console.error('fanAccount err ', e)
            return
        })
    }

    render() {
        console.log('traveller ', this.props.traveller)

        return (
            <form 
            className="fanAccountWrap"
            onSubmit={(e) => {
                this.updateTraveller
                e.preventDefault()
            }}>
                <h2>Moja cesta</h2>
                <p>Tu si môžeš upraviť detaily o svojej ceste a zároveň posielať správy.</p>
                <label htmlFor="nazov">
                    <span>Moja cesta</span>
                    <input
                        id="nazov"
                        name="nazov"
                        value={this.state.meno}
                        type="text"
                        onBlur={(e) => {
                            this.handleChange(e)
                            e.preventDefault()
                        }}
                        onChange={this.handleChange}
                        />
                </label>
                <label htmlFor="popis">
                    <span>Popis</span>
                    <textarea
                        id="popis"
                        name="popis"
                        value={this.state.popis}
                        onBlur={(e) => {
                            this.handleChange(e)
                            e.preventDefault()
                        }}
                        onChange={this.handleChange}
                        />
                </label>
                <label htmlFor="zaciatok">
                    <span>Začiatok</span>
                    <input
                        id="zaciatok"
                        name="zaciatok"
                        value={this.state.zaciatok}
                        onBlur={(e) => {
                            this.handleChange(e)
                            e.preventDefault()
                        }}
                        onChange={this.handleChange}
                        />
                </label>
                <label htmlFor="start_date">
                    <input
                        type="date"
                        id="start_date"
                        name="start_date"
                        value={this.state.start_date}
                        onBlur={(e) => {
                            this.handleChange(e)
                            e.preventDefault()
                        }}
                        onChange={this.handleChange}
                        />
                </label>
                <label htmlFor="pocet">
                    <span>Počet</span>
                    <input
                        type="number"
                        id="pocet"
                        name="pocet"
                        value={this.state.pocet}
                        onBlur={(e) => {
                            this.handleChange(e)
                            e.preventDefault()
                        }}
                        onChange={this.handleChange}
                        />
                </label>
                {this.state.error && <p className="errorMsg">{this.state.error}</p>}
                {this.state.loading ? 
                    <Loader />
                    :
                    <button className="snpBtn" onClick={this.updateTraveller} type="submit">Zmeniť detaily</button>}
            </form>
        ) 
    }
}
export default TravellerAccount
