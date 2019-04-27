import React from 'react'

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
        firebase.auth().signInWithEmailAndPassword(email, password)
        .then(() => {
            return
        })
        .catch(e => {
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