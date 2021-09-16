import React, {useState} from 'react'
import {Link, useHistory} from 'react-router-dom'
import {Preview} from './Preview'
import './Navbar.scss'

export const Navbar = (props) => {
    const [sidebar, setSidebar] = useState(false)
    const history = useHistory()

    const showSidebar = () => setSidebar(!sidebar) // toggle sidebar

    // logout function
    const logout = async () => {
        props.setUser('')

        await fetch("http://localhost:8000/api/logout", { // send post request to logout endpoint
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
