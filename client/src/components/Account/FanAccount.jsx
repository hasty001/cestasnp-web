import React from 'react'

import moment from 'moment'

class FanAccount extends React.Component {

    constructor(props) {
      super(props) 
      this.state = {
        fan: this.props.fan,
        error: "",
        nazov: "",
        popis: "",
        zaciatok: "Dukla",
        inyZaciatok: "",
        pocet: "",
        start_date: "",
      }
      this.handleChange=this.handleChange.bind(this)
      this.createTraveller=this.createTraveller.bind(this)
    }

    handleChange(event) {
        console.log('state ', this.state)
        console.log('event ', event.target.value)
        if (event.target.name === 'zaciatok' && event.target.value !== 'oth') {
            this.setState({
                [event.target.name]: event.target.value,
                inyZaciatok: "",
                error: "",
            })
        } else if(event.target.name === 'start_date') {
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

    createTraveller() {
        let {
            nazov,
            popis,
            zaciatok,
            inyZaciatok,
            pocet,
            start_date,
        } = this.state

        if (!nazov || nazov.trim().length === 0) {
            this.setState({
                error: "Zabudol si na názov cesty!"
            })
            return
        }

        if (!popis || popis.trim().length === 0) {
            this.setState({
                error: "Zabudol si na popis!"
            })
            return
        }

        if (zaciatok === 'oth' && (!inyZaciatok || inyZaciatok.trim().length === 0)) {
            this.setState({
                error: "Zabudol si na alternatívny začiatok, kedže nevyrážaš ani z Dukly ani z Devína!"
            })
            return
        }

        if (pocet.trim().length < 0 || pocet < 0) {
            this.setState({
                error: "Zabudol si na počet účastníkov!"
            })
            return
        }

        if (!start_date || start_date.trim().length === 0) {
            this.setState({
                error: "Zabudol si na dátum začiatku cesty!"
            })
            return
        } else if (moment(start_date).diff(moment(), 'days') < 0) {
            this.setState({
                error: "Začiatok cesty je v minulosti. Vyber iný dátum!"
            })
            return
        }

        console.log('this.state ', this.state)
        
    }
  
    render() {
        console.log('this.props ', this.props)
        
        return <form 
        className="fanAccountWrap"
        onSubmit={(e) => {
            this.createTraveller
            e.preventDefault()
        }}>
            <h2>Chystáš sa na cestu?</h2>
            <p>Vytvor si profil a vyraz!</p>
            <label htmlFor="nazov">
                <span>Názov tvojej cesty</span>
                <input
                    id="nazov"
                    name="nazov"
                    value={this.state.nazov}
                    type="text"
                    onBlur={(e) => {
                        this.handleChange(e)
                        e.preventDefault()
                    }}
                    onChange={this.handleChange}
                    />
            </label>
            <label htmlFor="popis">
                <span>O tvojej skupine alebo putovaní</span>
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
                <span>Kde štartuješ/te?</span>
                <select
                    name="zaciatok"
                    value={this.state.zaciatok}
                    onBlur={(e) => {
                        this.handleChange(e)
                        e.preventDefault()
                    }}
                    onChange={this.handleChange}
                >
                    <option selected value="Dukla">Dukla</option>
                    <option value="Devín">Devín</option>
                    <option value="oth">Inde</option>
                </select>
                {this.state.zaciatok === "oth" && <input
                    type="text"
                    name="inyZaciatok"
                    defaultValue="Kde?"
                    id="inyZaciatok"
                    onBlur={(e) => {
                        this.handleChange(e)
                        e.preventDefault()
                    }}
                    onChange={this.handleChange}
                    />}
            </label>
            <label htmlFor="pocet">
                <span>Koľko vás ide? (0 ak nechceš uviesť)</span>
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
            <label htmlFor="start_date">
                <span>Kedy vyrážaš/te?</span>
                <input
                    type="date"
                    id="start_date"
                    name="start_date"
                    onBlur={(e) => {
                        this.handleChange(e)
                        e.preventDefault()
                    }}
                    onChange={this.handleChange}
                    />
            </label>
            {this.state.error && <p className="errorMsg">{this.state.error}</p>}
            <button className="snpBtn" onClick={this.createTraveller} type="submit">Vytvoriť účet</button>
        </form>
    }
}

export default FanAccount
