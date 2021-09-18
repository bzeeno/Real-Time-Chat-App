import React, {useState, useEffect} from 'react'
import {useHistory} from 'react-router-dom'
//import {Button} from './Button'
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import { MenuItem } from '@mui/material';

//import FormControl from '@mui/material/FormControl';
//import InputLabel from '@mui/material/InputLabel';

import '../pages/Home.scss'
import './Preview.scss'

const SIZES = ['img-large','img-small']

export const Preview = (props) => {
    const getImgSize = SIZES.includes(props.size) ? props.size : SIZES[0]; // get button style. default to primary
    const [isFriend, setIsFriend] = useState(false)
    const [previewPic, setPreviewPic] = useState('')
    const [previewName, setPreviewName] = useState('')
    const [friends, setFriends] = useState(false)

    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const history = useHistory()

    // when friend is clicked function
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

        const checkFriend = async () => {
            const response = await fetch("http://localhost:8000/api/check-friend", { // send post request to logout endpoint
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                credentials: 'include',
                body: JSON.stringify({
                    friend_id: props.friend_id
                })
            })

            const result = await response.json()

            if (result['message'] === 'true') {
                setIsFriend(true)
            } else {
                setIsFriend(false)
            }
        }
        const getFriendInfo = async () => {
            const response = await fetch("http://localhost:8000/api/get-friend-info", { // send post request to logout endpoint
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                credentials: 'include',
                body: JSON.stringify({
                    friend_id: props.friend_id
                })
            })

            const result = await response.json()

            if (result['message'] === 'Could Not Find User') {
                console.log(result)
            } else {
                setPreviewName(result['username'])
                setPreviewPic(result['profile_pic'])
            }
        }
        const getRoomInfo = async () => {
            const response = await fetch("http://localhost:8000/api/get-room-info", { // send post request to logout endpoint
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                credentials: 'include',
                body: JSON.stringify({
                    room_id: props.room_id
                })
            })

            const result = await response.json()

            if (result['message'] === 'Could Not Find Room') {
                console.log(result)
            } else {
                setPreviewName(result['room_name'])
                setPreviewPic(result['room_pic'])
            }
        }

        if (props.isRoom === true) {
            getRoomInfo()
            getFriends()
        } else {
            checkFriend()
            getFriendInfo()
        }
    }, [props.friend_id, props.room_id, props.isRoom])

    const addFriend = async() => {
        const response = await fetch("http://localhost:8000/api/add-friend", { // send post request to logout endpoint
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            credentials: 'include',
            body: JSON.stringify({
                friend_id: props.friend_id
            })
        })

        const result = await response.json();

        window.location.reload()
    }

    const removeFriend = async() => {
        const response = await fetch("http://localhost:8000/api/remove-friend", { // send post request to logout endpoint
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            credentials: 'include',
            body: JSON.stringify({
                friend_id: props.friend_id
            })
        })

        const result = await response.json()
        console.log(result);

        history.push('/')
        window.location.reload();
    }


    const goToMessages = () => {
        history.push('/friend/' + props.friend_id)
    }

    const leaveRoom = async() => {
        const response = await fetch("http://localhost:8000/api/leave-room", { // send post request to logout endpoint
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            credentials: 'include',
            body: JSON.stringify({
                room_id: props.room_id
            })
        })
        window.location.reload();
        return response
    }

    const goToChat = async() => {
        history.push('/room/' + props.room_id)
    }

    const sendRoomInvite = (event) => {

    }


    return (
        <div>
            <div className='friend-container mt-2'>
                <img src={'../'+previewPic} alt='friend' className={`${getImgSize}`} />
                { !props.isRoom ? // if preview for friend:
                        getImgSize === 'img-large' ? // if image is large:
                        <div className={`overlay ${getImgSize}`}>  
                        <div className='col'>
                            {isFriend === false ? // if they are not friends:
                                <div classname='row'>
                                    <Button style={{margin: '0 auto', display: "flex"}} className='overlay-btn mt-4' variant='contained' color='secondary' size='small' onClick={addFriend}>Add Friend</Button>
                                </div>
                                :   // if they are friends:
                                <div classname='row'>
                                    <Button style={{margin: '0 auto', display: "flex"}} className='overlay-btn mt-4' variant='contained' color='secondary' size='small' onClick={goToMessages}>Message</Button>
                                </div>
                            }
                            {isFriend === true ?
                                <div classname='row'>
                                    <Button style={{margin: '0 auto', display: "flex"}} className='overlay-btn mt-4' variant='contained' color='error' size='small' onClick={removeFriend}>Remove Friend</Button>
                                </div>
                                : null}
                        </div>
                        </div>
                        : null // if small-image
            : // if preview for Room: }
                <div className={`overlay ${getImgSize}`}>  
                    <div className='col'>
                        <div classname='row'>
                            <Button style={{margin: '0 auto', display: "flex"}} className='overlay-btn mt-3' variant='contained' color='secondary' size='small' onClick={goToChat}>Chat</Button>
                        </div>
                        <div classname='row'>
                            <Button
                                style={{margin: '0 auto', display: "flex"}}
                                variant='contained'
                                color='secondary'
                                className='overlay-btn mt-2'
                                id="basic-button"
                                aria-controls="basic-menu"
                                aria-haspopup="true"
                                aria-expanded={open ? 'true' : undefined}
                                onClick={handleClick}
                            >
                            Invite Friend
                            </Button>
                            <Menu
                                id="basic-menu"
                                anchorEl={anchorEl}
                                open={open}
                                onClose={handleClose}
                                MenuListProps={{'aria-labelledby': 'basic-button',}}
                                
                            >
                                {Object.keys(friends).map(key => 
                                    <MenuItem sx={{backgroundColor: '#242424', '&:hover': {backgroundColor: '#242424'}}} onClick={sendRoomInvite} value={friends[key]}>
                                        <Preview alt='friend' size='img-small' isRoom={false} friend_id={friends[key]} />
                                    </MenuItem>
                                )}

                            </Menu>
                        </div>
                        <div classname='row'>
                            <Button style={{margin: '0 auto', display: "flex"}} variant='contained' color='error' className='overlay-btn mt-2' onClick={leaveRoom}>Leave Room</Button>
                        </div>
                    </div>
                </div>}

        </div>

            <div className='friend-name'>
                <p>{previewName}</p>
            </div>
        </div>
    )
}
