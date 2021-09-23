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
    /*
    const socket = new WebSocket("ws://localhost:8000/ws/")
    const socketRef = useRef();
    socketRef.current = socket;
    */
    const socket = useRef(null);

    const [search, setSearch] = useState(false)
    const [createRoom, setCreateRoom] = useState(false)
    const [friends, setFriends] = useState('')
    const [rooms, setRooms] = useState([])
    const [requests, setRequests] = useState('') // friend requests
    const requestsRef = useRef();
    requestsRef.current = requests;
    const [req, setReq] = useStateWithCallback(null, req => {
        if (req !== null && socket.current.readyState === 1) {
            socket.current.send(JSON.stringify(req));
            setReq(null);
        } 
    });
    const history = useHistory()
    props.setRoomID(null)

    if(!localStorage.getItem("user")) {
        history.push('/login')
    }

    const  showSearchWindow = () => setSearch(!search) // toggle search bar
    const  showRoomWindow = () => setCreateRoom(!createRoom) // toggle search bar
    const searchClass = search ? 'rotate-icon' : '';
    const roomClass = createRoom ? 'rotate-icon' : '';

    console.log("requests in home: ", requests)

    useEffect(() => {
        let isMounted = true;
        const getFriends = async() => {
            const response = await fetch(`http://${process.env.REACT_APP_SERVER_URL}/api/get-friends`, {
                headers: {'Content-Type': 'application/json'},
                credentials: 'include'
            })

            const result = await response.json()
            if (isMounted) {
                setFriends(result['friends']) 
            }
        }
        const getFriendReqs = async() => {
            const response = await fetch(`http://${process.env.REACT_APP_SERVER_URL}/api/get-friend-reqs`, {
                headers: {'Content-Type': 'application/json'},
                credentials: 'include'
            })
            const result = await response.json()
            if (isMounted) {
                setRequests(result['requests'])
            }
        }
        const getRooms = async() => {
            const response = await fetch(`http://${process.env.REACT_APP_SERVER_URL}/api/get-rooms`, {
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
            getRooms().catch(setRooms([]))
        }

        socket.current = new WebSocket(`ws://${process.env.REACT_APP_SERVER_URL}/ws`)
        socket.current.onopen = (event) => {
            console.log("Connected to ws")
            //socket.current.send(JSON.stringify({friend_id: 0+'', req: "HELP ME"}))
        }
        socket.current.onmessage = (request) => {
            let new_req = JSON.parse(request.data)
            console.log("requests: ", requests)
            switch(new_req['req']) {
                case 'add-friend':
                    console.log("requests: ", requestsRef.current)
                    let filteredRequests = [];
                    let isInRequests = false;
                    // check if friend is in requests
                    Object.keys(requestsRef.current).map(key => {
                        if (requestsRef.current[key] !== new_req['friend_id']) { // if friend is not current request:
                            filteredRequests.push(requests[key])   // add to array
                        } else {
                            isInRequests = true;                  // otherwise: set isInRequests to true
                        }
                        return requestsRef.current[key]
                    })
                    console.log("isInRequests: ", isInRequests)
                    if (new_req['sender_id'] === props.user['_id']) {           // if this client is the sender:
                        if(isInRequests) {                                          // if accepting friend request:
                            console.log("Accepting friend request")
                            console.log("new requests: ", filteredRequests)
                            setRequests(filteredRequests)                               // setRequests to array without friend that was just added
                            setFriends(prev => [...prev, new_req['friend_id']])         // setFriends with newly added friend
                        }                                                       
                    } else {                                                    // if this client is the receiver:
                        if(new_req['in_pending'] === 'true') {                      // if other client accepted friend request:
                            console.log("Friend accepted request")
                            setFriends(prev => [...prev, new_req['friend_id']])         // setFriends with newly added friend
                        } else {                                                // if received friend request from other client:
                            console.log("Received friend request")
                            setRequests(prev => [...prev, new_req['friend_id']])    // setRequests with client who sent request
                        }
                    }
                    break;
                case 'remove-friend':
                    let filteredArray = [];
                    Object.keys(friends).map(key => {
                        console.log("friend: ", friends[key])
                        if (friends[key] !== new_req['friend_id']) {
                           filteredArray.push(friends[key])
                        }
                        return friends[key]
                    })
                    console.log("filtered array: ", filteredArray)
                    setFriends(filteredArray)
                    break;
                case 'add-to-room':
                    console.log("In add-to-room")
                    console.log("Is receiver: ", new_req['sender_id'] !== props.user['_id'])
                    if (new_req['sender_id'] !== props.user['_id']) {    // if this client is not the sender:
                        window.location.reload();
                        //setRooms(prev => [...prev, new_req['room_id']])    // setRequests with client who sent request (this doesn't work, very annoying)
                    }
                    break;
                default:
                    setReq(null)
                    break;
            }
        }

        socket.current.onclose = (event) => {
            console.log("socket closed connection: ", event)
        }

        return () => { isMounted=false }
    }, [])

    //const sendReq = () =>{ console.log("req in sendReq: ", req); socket.current.send(req); }

    //console.log("req in home: ", req)

    return(
        <div className='container'>
            <div className="rooms-header">
                <h2 className="rooms-header-text mb-0">Friends</h2>
                <i className={`fas fa-plus-circle add-btn mb-0 ${searchClass}`} onClick={showSearchWindow} />
            </div>
            <div className="search-window-container">
                <Search search={search} setSearch={setSearch} setReq={ data => {setReq(data);} } user={props.user} />
            </div>
            <div className='row'>
                {friends === null ? null : Object.keys(friends).map(key => 
                    <div key={key} className='col-sm-12 col-md-4 col-lg-2 px-0 mx-3'>
                        <Preview alt='friend' size='img-large' isRoom={false} friend_id={friends[key]} setReq={ data => {setReq(data);} } user={props.user} inPending={false} overlay={true} />
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
                        <Preview alt='default_room.jpeg' size='img-large' isRoom={true} room_id={rooms[key]} setReq={ data => {setReq(data);} } user={props.user} overlay={true} />
                    </div>
                )}
            </div>


            <div className="rooms-header">
                <h2 className="rooms-header-text mb-0">Pending Friends</h2>
            </div>
            <div className='row'>
                {requests === null ? null : Object.keys(requests).map(key =>
                    <div className='col-sm-12 col-md-4 col-lg-2 px-0 mx-3' key={key}>
                        <Preview src='default_pic.jpeg' alt='friend' size='img-large' name='username' isRoom={false} friend_id={requests[key]} setReq={ data => {setReq(data);} } user={props.user} inPending={true} overlay={true} />
                    </div>
                )}
            </div>

            <p className="mt-5 mb-3 mx-auto text-muted">&copy; 2017–2021</p>

        </div>
    )
}
