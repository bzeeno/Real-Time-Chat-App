import React, {useState, useEffect, useRef} from 'react'
//import {Button} from '../components/Button'
import {useHistory} from 'react-router-dom'
import {Preview} from '../components/Preview'
//import Alert from '@material-ui/lab/Alert'
import {Search} from '../components/Search'
import {CreateRoom} from '../components/CreateRoom'
import './Home.scss'

export const Home = (props) => {
    const [search, setSearch] = useState(false)
    const [createRoom, setCreateRoom] = useState(false)
    const [friends, setFriends] = useState('')
    const [rooms, setRooms] = useState('')
    const [requests, setRequests] = useState('')
    const socket = useRef(null);
    const history = useHistory()
    let alert = false

    if(!localStorage.getItem("user")) {
        history.push('/login')
    }

    const  showSearchWindow = () => setSearch(!search) // toggle search bar
    const  showRoomWindow = () => setCreateRoom(!createRoom) // toggle search bar
    const searchClass = search ? 'rotate-icon' : '';
    const roomClass = createRoom ? 'rotate-icon' : '';

    useEffect(() => {
        const getFriends = async() => {
            const response = await fetch("http://localhost:8000/api/get-friends", {
                headers: {'Content-Type': 'application/json'},
                credentials: 'include'
            })

            const result = await response.json()
            setFriends(result['friends']) 
            console.log("friends: ",result['friends'])
        }
        const getFriendReqs = async() => {
            const response = await fetch("http://localhost:8000/api/get-friend-reqs", {
                headers: {'Content-Type': 'application/json'},
                credentials: 'include'
            })
            const result = await response.json()
            setRequests(result['requests'])
            console.log("requests: ",result['requests'])
        }
        const getRooms = async() => {
            const response = await fetch("http://localhost:8000/api/get-rooms", {
                headers: {'Content-Type': 'application/json'},
                credentials: 'include'
            })

            const result = await response.json()
            setRooms(result['rooms']) 
        }
        getFriends().catch(setFriends(''))
        getFriendReqs().catch(setRequests(''))
        getRooms().catch(setRooms(''))

        socket.current = new WebSocket("ws://localhost:8000/ws/")

        socket.current.onopen = (event) => {
            console.log("Connection at: ", "ws://localhost:8000/ws/")
        }
        socket.current.onmessage = (msg) => {
            let new_msg = JSON.parse(msg.data)
            console.log(new_msg)
        }
        socket.current.onclose = (event) => {
            console.log("socket closed connection: ", event)
        }
        
        return () => socket.current.close()
        
    }, [])


    return(
        <div className='container'>
            <div className="rooms-header">
                <h2 className="rooms-header-text mb-0">Friends</h2>
                <i className={`fas fa-plus-circle add-btn mb-0 ${searchClass}`} onClick={showSearchWindow} />
            </div>
            <div className="search-window-container">
                <Search search={search} setSearch={setSearch}/>
            </div>
            <div className='row'>
                {friends === null ? null : Object.keys(friends).map(key => 
                    <div key={key} className='col-sm-12 col-md-4 col-lg-2 px-0 mx-3'>
                        <Preview alt='friend' size='img-large' isRoom={false} friend_id={friends[key]} />
                    </div>
                )}

            </div>


            <div className='rooms-header'>
                <h2 className="rooms-header-text mt-2">Rooms</h2>
                <i className={`fas fa-plus-circle add-btn mb-0 ${roomClass}`} onClick={showRoomWindow} />
            </div>
            <div className="search-window-container">
                <CreateRoom createRoom={createRoom} />
            </div>
            <div className='row'>
                {rooms === null ? null : Object.keys(rooms).map(key => 
                    <div key={key} className='col-sm-12 col-md-4 col-lg-2 px-0 mx-3'>
                        <Preview alt='default_room.jpeg' size='img-large' isRoom={true} room_id={rooms[key]} />
                    </div>
                )}
            </div>


            <div className="rooms-header">
                <h2 className="rooms-header-text mb-0">Pending Friends</h2>
            </div>
            <div className='row'>
                {requests === null ? null : Object.keys(requests).map(key =>
                    <div className='col-sm-12 col-md-4 col-lg-2 px-0 mx-3' key={key}>
                        <Preview src='default_pic.jpeg' alt='friend' size='img-large' name='username' isRoom={false} friend_id={requests[key]} setAlert={alert} />
                    </div>
                )}
            </div>

            <p className="mt-5 mb-3 mx-auto text-muted">&copy; 2017–2021</p>

        </div>
    )
}
