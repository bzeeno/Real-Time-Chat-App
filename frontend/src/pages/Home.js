import React, {useState, useEffect, useRef} from 'react'
import useStateWithCallback from 'use-state-with-callback';
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
    const [requests, setRequests] = useState('') // friend requests
    //const [req, setReq] = useState(null) // websocket requests
    const [req, setReq] = useStateWithCallback(null, req => {
        if (req !== null && socket.current.readyState === 1) {
            console.log('socket readyState: ', socket.current.readyState)
            console.log("req in sendReq: ", req);
            socket.current.send(req);
        } 
    });
    const socket = useRef(null);
    const history = useHistory()
    let alert = false
    props.setRoomID(null)

    if(!localStorage.getItem("user")) {
        history.push('/login')
    }

    const  showSearchWindow = () => setSearch(!search) // toggle search bar
    const  showRoomWindow = () => setCreateRoom(!createRoom) // toggle search bar
    const searchClass = search ? 'rotate-icon' : '';
    const roomClass = createRoom ? 'rotate-icon' : '';

    useEffect(() => {
        let isMounted = true;
        const getFriends = async() => {
            const response = await fetch("http://localhost:8000/api/get-friends", {
                headers: {'Content-Type': 'application/json'},
                credentials: 'include'
            })

            const result = await response.json()
            if (isMounted) {
                setFriends(result['friends']) 
            }
        }
        const getFriendReqs = async() => {
            const response = await fetch("http://localhost:8000/api/get-friend-reqs", {
                headers: {'Content-Type': 'application/json'},
                credentials: 'include'
            })
            const result = await response.json()
            if (isMounted) {
                setRequests(result['requests'])
            }
        }
        const getRooms = async() => {
            const response = await fetch("http://localhost:8000/api/get-rooms", {
                headers: {'Content-Type': 'application/json'},
                credentials: 'include'
            })

            const result = await response.json()
            if (isMounted) {
                setRooms(result['rooms']) 
            }
        }

        if (isMounted) {
            getFriends().catch(setFriends(''))
            getFriendReqs().catch(setRequests(''))
            getRooms().catch(setRooms(''))
        }

        socket.current = new WebSocket("ws://localhost:8000/ws/")

        socket.current.onopen = (event) => {
            console.log("Connection at: ", "ws://localhost:8000/ws/")
            //socket.current.send({'friend_id': '0', 'req': 'HELP ME'})
        }
        socket.current.onmessage = (request) => {
            let new_req = JSON.parse(request.data)
            console.log("msg onmessage: ", new_req)
            switch(new_req) {
                case 'add-friend':
                    setFriends(prev => [...prev, new_req['friend_id']])
                    break;
                case 'remove-friend':
                    let filteredArray = friends.filter(item => item !== req['friend_id']);
                    setFriends(filteredArray)
                    break;
                case 'add-to-room':
                    setRooms(prev => [...prev, new_req['room_id']]); 
                    break;
                default:
                    break;
            }
        }
        socket.current.onclose = (event) => {
            console.log("socket closed connection: ", event)
        }
        
        return () => { socket.current.close(); isMounted=false }
        
    }, [req])



    const sendReq = () =>{ console.log("req in sendReq: ", req); socket.current.send(req); }

    console.log("req in home: ", req)

    return(
        <div className='container'>
            <div className="rooms-header">
                <h2 className="rooms-header-text mb-0">Friends</h2>
                <i className={`fas fa-plus-circle add-btn mb-0 ${searchClass}`} onClick={showSearchWindow} />
            </div>
            <div className="search-window-container">
                <Search search={search} setSearch={setSearch} setReq={ data => {setReq(data);} } />
            </div>
            <div className='row'>
                {friends === null ? null : Object.keys(friends).map(key => 
                    <div key={key} className='col-sm-12 col-md-4 col-lg-2 px-0 mx-3'>
                        <Preview alt='friend' size='img-large' isRoom={false} friend_id={friends[key]} setReq={ data => {setReq(data);} }/>
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
                        <Preview alt='default_room.jpeg' size='img-large' isRoom={true} room_id={rooms[key]} setReq={ data => {setReq(data);} } />
                    </div>
                )}
            </div>


            <div className="rooms-header">
                <h2 className="rooms-header-text mb-0">Pending Friends</h2>
            </div>
            <div className='row'>
                {requests === null ? null : Object.keys(requests).map(key =>
                    <div className='col-sm-12 col-md-4 col-lg-2 px-0 mx-3' key={key}>
                        <Preview src='default_pic.jpeg' alt='friend' size='img-large' name='username' isRoom={false} friend_id={requests[key]} setAlert={alert} setReq={ data => {setReq(data);} } />
                    </div>
                )}
            </div>

            <p className="mt-5 mb-3 mx-auto text-muted">&copy; 2017–2021</p>

        </div>
    )
}
