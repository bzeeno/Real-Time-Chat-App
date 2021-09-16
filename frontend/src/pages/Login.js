import React, {SyntheticEvent, useState} from 'react';
import {Button} from '../components/Button';
import {Link, Redirect, useHistory} from 'react-router-dom'
import './Login.scss';

export const Login = (props) => {
    const [redirect, setRedirect] = useState(false)
    const [email, setEmail]       = useState('')
    const [pass, setPass]         = useState('')
    const [error, setError]       = useState('')
    const history = useHistory()

    if(localStorage.getItem("user")) {
        history.push('/')
    }

    // on submit function
    const submit = async(e: SyntheticEvent) => {
        e.preventDefault()

        const response = await fetch("http://localhost:8000/api/login", { // send post request to login endpoint
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            credentials: 'include',
            body: JSON.stringify({
                email: email,
                password: pass
            })
        })

        const user = await response.json() // get content
        console.log("Login", user)

        if (user.message !== undefined) {
            setError(user.message)
        } else {
            localStorage.setItem("user", user)
            props.setUser(user) // set user to logged in user
            setError('')
            setRedirect(true) // set redirect to true
        }
    }

    // redirect if state is true
    if(redirect) {
        return <Redirect to='/' />
    }

    return (
    <form className='container login-form' onSubmit={submit}>
        <h2 className="signin-header">Please Sign In</h2>

        <div className="login-input">
            <input type="email" className="form-control" placeholder="Email Address" required onChange={e=>setEmail(e.target.value)}/>
        </div>
        <div className="login-input mb-4">
          <input type="password" className="form-control" placeholder="Password" required onChange={e=>setPass(e.target.value)}/>
        </div>
        <div className="text-danger mb-3">{error}</div>

        <Button buttonStyle='btn--primary' type="submit">Sign In</Button>

        <p className="mt-5 mb-3 text-muted">Need and account? <Link to="register">Register</Link></p>
    </form>
    )
}
