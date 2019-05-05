import React from 'react'

import { auth } from '../../helpers/firebase'

class Login extends React.Component {
    constructor(props) {
        super(props) 
        this.state = {
            email: '',
            password: '',
            error: '',
        }

        this.handleChange=this.handleChange.bind(this)
        this.handleLogin=this.handleLogin.bind(this)
    }

    handleChange(event) {
        this.setState({
            [event.target.name]: event.target.value
        })
    }

    handleLogin() {
        let { email, password } = this.state
        auth.signInWithEmailAndPassword(email, password)
        .then(({ user }) => {
            console.log('user ', user.emailVerified)
            if (!user.emailVerified) {
                this.setState({
                    error: 'Účet ešte nie je potvrdený. Po registrácii sme ti zaslali email, ktorý treba otvoriť a potvrdiť. Skús pozrieť do svojej emailovej schránky. Mohlo sa stať aj že skončil v spame.'
                })
            }
            return
        })
        .catch(e => {
            console.error('error ', e)
            this.setState({
                error: 'Email alebo heslo nesedia. Skús ešte raz!'
            })
        })
    }

    render() {
        return(
            <form onSubmit={(e) => {
                this.handleLogin
                e.preventDefault()
            }}>
                <h1>Prihlásiť sa</h1>
                {this.state.error && <p className="errorMsg">{this.state.error}</p>}
                <label htmlFor="email">
                <span>Email:</span>
                <input
                    type="email"
                    id="login-email"
                    name="email"
                    autoComplete="new-email"
                    onBlur={(e) => {
                        this.handleChange(e)
                        e.preventDefault()
                    }}
                    onChange={this.handleChange}/>
                </label>
                <label htmlFor="password">
                <span>Heslo:</span>
                <input
                    type="password"
                    id="login-password"
                    name="password"
                    autoComplete="new-password"
                    onBlur={(e) => {
                        this.handleChange(e)
                        e.preventDefault()
                    }}
                    onChange={this.handleChange}/>
                </label>

                <button className="button button--primary button--pill" onClick={this.handleLogin} type="submit">Prihlásiť</button>
            </form>
        ) 
    }
}

export default Login