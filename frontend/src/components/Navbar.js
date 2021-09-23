import React, {useState, useEffect} from 'react'
import {Link, useHistory} from 'react-router-dom'
import {Preview} from './Preview'
import './Navbar.scss'

export const Navbar = (props) => {
    const [sidebar, setSidebar] = useState(false)
    const [users, setUsers] = useState([])
    const history = useHistory()

    const showSidebar = () => setSidebar(!sidebar) // toggle sidebar

    useEffect(() => {
        const getRoomInfo = async () => {
            const response = await fetch(`http://${process.env.REACT_APP_SERVER_URL}/api/get-room-info`, { // send post request to logout endpoint
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                credentials: 'include',
                body: JSON.stringify({
                    room_id: props.room_id
                })
            })
            const result = await response.json()
            console.log(result['users'])
            setUsers(result['users'])
        }
        if (props.room_id === null) {
            setUsers([])
        } else {
            getRoomInfo()
        }
    }, [props.room_id])

    // logout function
    const logout = async () => {
        props.setUser('')

        await fetch(`http://${process.env.REACT_APP_SERVER_URL}/api/logout`, { // send post request to logout endpoint
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            credentials: 'include',
        })
        localStorage.removeItem("user")
        history.push('/login')
    }

    let menu;
    // if no user: don't display menu
    if (props.user === '') {
        menu = (<></>)
    } else {
        menu = (
        <>
        <div className='navbar'>
            <div className='container-fluid navbar-container'/>
            <div className='nav-bars'>
                <i className="fas fa-bars fa-3x" onClick={showSidebar}/>
            </div>
            <nav className={sidebar ? 'nav-menu active' : 'nav-menu'}>
                <ul className='nav-menu-items' onClick={showSidebar}>
                    <li className='nav-toggle'>
                        <div className='nav-x'>
                            <i className="fas fa-times fa-3x"/>
                        </div>
                    </li>
                    <li className='nav-text'>
                        <Link to='/'>
                            <i className="fas fa-atom" />
                            <span> Home</span>
                        </Link>
                    </li>
                    <li className='nav-text'>
                        <Link to='/login' onClick={logout}>
                            <i className="fas fa-power-off" />
                            <span> Logout</span>
                        </Link>
                    </li>
                    {users.length === 0 ? null : Object.keys(users).map(key => 
                        <li key={key} className=''>
                            <Preview alt='default.jpeg' size='img-small' isRoom={false} friend_id={users[key]} />
                        </li>
                    )}
                    
                </ul>
            </nav>
        </div>
        </>
        )
    }

    return (
        <>
        {menu}
        </>
    )
}
