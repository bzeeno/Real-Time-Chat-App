import React, {useState, useEffect} from 'react'
import {useHistory} from 'react-router-dom'
import {Button} from './Button'
import '../pages/Home.scss'
import './Preview.scss'

const SIZES = ['img-large','img-small']

export const Preview = (props) => {
    const getImgSize = SIZES.includes(props.size) ? props.size : SIZES[0]; // get button style. default to primary
    const [isFriend, setIsFriend] = useState(false)
    const [previewPic, setPreviewPic] = useState('')
    const [previewName, setPreviewName] = useState('')
    const history = useHistory()

    // when friend is clicked function
    useEffect(() => {
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


    return (
        <div>
            <div className='friend-container mt-2'>
                <img src={'../'+previewPic} alt='friend' className={`${getImgSize}`} />
                { !props.isRoom ? // if preview for friend:
                        getImgSize === 'img-large' ? // if image is large:
                        <div className={`overlay ${getImgSize}`}>  
                            {isFriend === false ? // if they are not friends:
                                <Button buttonStyle='btn--primary' buttonSize='btn--sm' classes='overlay-btn' type="submit" onClick={addFriend}>Add Friend</Button>
                                :   // if they are friends:
                                <Button buttonStyle='btn--primary' buttonSize='btn--sm' type="submit" classes='overlay-btn' onClick={goToMessages}>Message</Button>
                            }
                            {isFriend === true ?
                                <Button buttonStyle='btn--primary' buttonSize='btn--sm' type="submit" classes='mt-5 overlay-btn' onClick={removeFriend}>Remove Friend</Button>
                                : null}
                        </div>
                        : null // if small-image
            : // if preview for Room: }
                <div className={`overlay ${getImgSize}`}>  
                    <Button buttonStyle='btn--primary' buttonSize='btn--sm' classes='overlay-btn' type="submit" onClick={goToChat}>Chat</Button>
                    <Button buttonStyle='btn--primary' buttonSize='btn--sm' classes='mt-5 overlay-btn' type="submit" onClick={leaveRoom}>Leave Room</Button>
                </div>}

        </div>

            <div className='friend-name'>
                <p>{previewName}</p>
            </div>
        </div>
    )
}
