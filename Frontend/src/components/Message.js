import React from 'react'
import './Message.scss'

export const Message = (props) => {
    const getColor = props.isCurrUser ? 'current-user' : 'not-current-user';
    return (
        <div className={`message mt-3 ${getColor}`}>
            <div className='message-text mx-2 mt-2'>{props.user + ':'}</div>
            <div className='message-text mx-2 mt-2'>{props.text}</div>
        </div>
    )
}
