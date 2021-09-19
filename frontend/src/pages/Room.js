import React, {useEffect, useState, useRef} from 'react'
import {useHistory, useParams} from 'react-router-dom'
import {Preview} from '../components/Preview'
import {Message} from '../components/Message'
import {MessageBox} from '../components/MessageBox'
import './RoomFriend.scss'

export const Room = (props) => {
    const history = useHistory()
    const [msg, setMsg] = useState()
    const [messages, setMessages] = useState('')
    const socket = useRef(null);
    // get room id
    let router_data = useParams()
    let room_id = router_data['room_id']
    props.setRoomID(room_id)

    if (!localStorage.getItem("user")) {
        history.push('/login')
    }

    useEffect(() => {
        const getMessages = async() => {
            const response = await fetch("http://localhost:8000/api/get-messages", {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                credentials: 'include',
                body: JSON.stringify({
                    room_id: room_id
                })
            })

            const result = await response.json()
            setMessages(result['messages']) 
        }
        
        getMessages()

        socket.current = new WebSocket("ws://localhost:8000/ws/"+room_id)

        socket.current.onopen = (event) => {
            console.log("Connection at: ", "ws://localhost:8000/ws/"+room_id)
        }
        socket.current.onmessage = (msg) => {
            let new_msg = JSON.parse(msg.data)
            console.log(new_msg)
            setMessages(prev => [...prev, new_msg])
        }
        socket.current.onclose = (event) => {
            console.log("socket closed connection: ", event)
        }
        
        return () => socket.current.close()
    }, [room_id])


    const sendMsg = () => socket.current.send(msg)

    return (
        <div className='container room-friend-container'>
            <div className='row mt-5'>
                <Preview alt='room' size='img-large' isRoom={true} room_id={room_id} />
            </div>
            <div className='row'>
                {messages.length === 0 ? null : Object.keys(messages).map(key => 
                    <div key={key} className=''>
                        <Message user={messages[key]['user']} text={messages[key]['text']} isCurrUser={props.user['username'] === messages[key]['user']} />
                    </div>
                )}
            </div>

            <div className='row'>
                <MessageBox onChange={setMsg} onClick={sendMsg}/>
            </div>
        </div>
    )
}
