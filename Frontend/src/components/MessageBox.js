import React from 'react'
import {Button} from './Button'
import TextField from '@material-ui/core/TextField';
import './MessageBox.scss'

export const MessageBox = (props) => {
    return (
        <div className='row mt-5 message-box' align='center'>
            <div className='col-sm-11 px-0'>
                {/* <input className='message-input' type="text" required /> */}
            <TextField
                id="filled-multiline-flexible"
                className="message-input"
                label="Message"
                fullWidth
                variant="filled"
                onChange={e=>props.onChange(e.target.value)}
            />
            </div>
            <div className='col-sm-1 my-auto pl-1' >
                <Button buttonSize='btn--md btn--primary' onClick={props.onClick}>Send</Button>
            </div>
        </div>
    )
}
