import React, {SyntheticEvent, useState} from 'react'
import {Button} from './Button'
import TextField from '@material-ui/core/TextField';
import './CreateRoom.scss'
import './Message.scss'

export const CreateRoom = (props) => {
    const [error, setError] = useState('')
    const [roomName, setRoomName] = useState('')

    const submit = async(e: SyntheticEvent) => {
        e.preventDefault()

        const response = await fetch("http://localhost:8000/api/create-room", { // send post request to login endpoint
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            credentials: 'include',
            body: JSON.stringify({
                name: roomName,
            })
        })

        const result = await response.json() // get content
        if (result['message'] === 'Successfully created room!') {
            window.location.reload();
        } else {
            setError(result)
        }

    }

    return (
        <div className={props.createRoom ? 'create-window active' : 'create-window'} >
            <div className='search-box'>
            <div className='mt-5' align='center'>
                <TextField
                    label="Room Name"
                    variant="filled"
                    onChange={e=>setRoomName(e.target.value)}
                />
                <Button buttonSize='btn--md' buttonStyle='btn--secondary' type='submit' my='mt-2' mx='mx-auto' onClick={submit}>Create Room</Button>
                {error === '' ? null : <li className='search-result'>{error}</li>}
            </div>
            </div>
        </div>
    )
}
