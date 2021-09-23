import React, {SyntheticEvent, useState} from 'react'
import {Button} from './Button'
//import {Link} from 'react-router-dom'
import {Preview} from './Preview'
import TextField from '@material-ui/core/TextField';
import './Search.scss'
import './Message.scss'

export const Search = (props) => {
    const [error, setError] = useState('')
    const [username, setUsername] = useState('')
    const [receivedData, setReceivedData] = useState(false)
    const [data, setData] = useState('')

    const submit = async(e: SyntheticEvent) => {
        e.preventDefault()

        const response = await fetch(`http://${process.env.REACT_APP_SERVER_URL}/api/search-friend`, { // send post request to login endpoint
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            credentials: 'include',
            body: JSON.stringify({
                username: username
            })
        })

        const result = await response.json() // get content

        if (result !== null) {
            setError('')
            setReceivedData(true)
            setData(result)
        } else {
            setError('user not found')
            setReceivedData(false)
            setData('')
        }

    }

    return (
        <div className={props.search ? 'search-window active' : 'search-window'} >
            <div className='search-box'>
            <div className='mt-5' align='center'>
                <TextField
                    label="Search..."
                    maxRows={4}
                    variant="filled"
                    onChange={e=>setUsername(e.target.value)}
                />
                <Button buttonSize='btn--md' buttonStyle='btn--secondary' type='submit' my='mt-2' mx='mx-auto' onClick={submit}>Search</Button>
                {error === '' ? null : <li className='search-result'>{error}</li>}
                {receivedData ? Object.keys(data).map(key => 
                    <li key={key} className='search-result'>
                        <Preview src={data[key]['profile_pic']} alt='friend' size='img-large' name={data[key]['username']} friend_id={data[key]['_id']} setReq={data => props.setReq(data) } user={props.user} inPending={false} overlay={true} />
                    </li>
                )
                : null}
            </div>
            </div>
        </div>
    )
}
