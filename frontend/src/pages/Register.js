import React, {SyntheticEvent, useState} from 'react';
import {Button} from '../components/Button';
import {Link, Redirect, useHistory} from 'react-router-dom'
import './Login.scss';

export const Register = (props) => {
    const [, setConfirmPass] = useState('')
    const [redirect, setRedirect] = useState(false)
    const [username, setUsername] = useState('')
    const [email, setEmail]       = useState('')
    const [error, setError]       = useState('')
    const [pass, setPass]         = useState('')
    const history = useHistory()

    if(localStorage.getItem("user")) {
        history.push('/')
    }


    console.log(props.username)

    const submit = async (e: SyntheticEvent) => {
        e.preventDefault()
        // if passwords match and email has @ char
        if (!error) {
            await fetch(`http://${process.env.REACT_APP_SERVER_URL}/api/register`, { // send post request to register endpoint
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    username: username,
                    email: email,
                    password: pass,
                })
            })
            setRedirect(true) // set redirect to true
        }
    }

    // redirect if state is true
    if(redirect) {
        return <Redirect to='/login' />
    }

    // Check if passwords match
    const validatePass = (e_val) => {
        const confirm_pass = e_val
        setConfirmPass(confirm_pass)
        if (pass !== confirm_pass) {
           setError('Passwords do not match') 
        } else {
            setError('')
        }
    }


    return (
    <form className='container login-form' onSubmit={submit}>
        <h2 className="signin-header">Sign Up</h2>

        <div className="login-input">
            <input type="text" className="form-control" name="username"  placeholder="Username" required onChange={e => setUsername(e.target.value)}/>
        </div>
        <div className="login-input">
          <input type="email" className="form-control" name="email" placeholder="Email Address" required onChange={e => setEmail(e.target.value)}/>
        </div>
        <div className="login-input">
          <input type="password" className="form-control" name="pass" placeholder="Password" required onChange={e => setPass(e.target.value)}/>
        </div>
        <div className="login-input">
          <input type="password" className="form-control" name="confirmPass" placeholder="Confirm Password" required onChange={e => validatePass(e.target.value)}/>
        </div>
        <div className="text-danger mb-3">{error}</div>

        <Button buttonStyle='btn--primary' link="/register" type="submit">Sign Up</Button>

        <p className="mt-5 mb-3 text-muted">Have an account? <Link to="/login">Login</Link></p>
    </form>
    )
}
