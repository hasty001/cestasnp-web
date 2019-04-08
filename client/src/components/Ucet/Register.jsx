import React from 'react'

class Register extends React.Component {
    constructor(props) {
        super(props) 
        this.state = {
            name: '',
            email: '',
            password: '',
            passwordConfirmation: '',
        }

        this.handleChange=this.handleChange.bind(this)
        this.handleRegister=this.handleRegister.bind(this)
    }

    handleChange(event) {
        this.setState({
            [event.target.name]: event.target.value
        })
    }

    handleRegister() {
        console.log(this.state)
        let { name, email, password, passwordConfirmation } = this.state
        
        if (password !== passwordConfirmation) {
            return
        }

        firebase.auth().createUserWithEmailAndPassword(email, password)
        .then(user => {
            console.log('user ', user)
            let currentUser = firebase.auth().currentUser
            console.log('currentUser ', currentUser)
            return currentUser.updateProfile({
                displayName: name,
            })
        })
        .catch(error => {
            console.log('error ', error)
            let errorCode = error.code
            let errorMessage = error.message
        })
    }

    render() {
        return(
            <form onSubmit={(e) => {
                this.handleRegister
                e.preventDefault()
            }}>
                <h1>Vytvoriť si účet</h1>
                <label htmlFor="name">
                    <span>Meno:</span>
                    <input
                        type="name"
                        id="name"
                        name="name"
                        onBlur={(e) => {
                            this.handleChange(e)
                            e.preventDefault()
                        }}
                        onChange={this.handleChange}
                    />
                </label>
                <label htmlFor="email">
                    <span>Email:</span>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        autoComplete="new-email"
                        onBlur={(e) => {
                            this.handleChange(e)
                            e.preventDefault()
                        }}
                        onChange={this.handleChange}
                    />
                </label>
                <label htmlFor="password">
                    <span>Heslo:</span>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        autoComplete="new-password"
                        onBlur={(e) => {
                            this.handleChange(e)
                            e.preventDefault()
                        }}
                        onChange={this.handleChange}
                    />
                </label>
                <label htmlFor="passwordConfirmation">
                    <span>Potvrď heslo:</span>
                    <input
                        type="password"
                        id="passwordConfirmation"
                        name="passwordConfirmation"
                        onBlur={(e) => {
                            this.handleChange(e)
                            e.preventDefault()
                        }}
                        onChange={this.handleChange}
                    />
                </label>

                <button className="button button--primary button--pill" onClick={this.handleRegister} type="submit">Prihlasit</button>
            </form>
        ) 
    }
}

export default Register