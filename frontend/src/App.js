import './App.css';
import React, {useState, useEffect} from 'react'
import { Navbar } from './components/Navbar';
import {BrowserRouter, Route} from 'react-router-dom';
import {Home} from './pages/Home';
import {Login} from './pages/Login';
import {Register} from './pages/Register';
import {Friend} from './pages/Friend'
import {Room} from './pages/Room'


function App() {
    const [user, setUser] = useState('')
    const [room_id, setRoomID] = useState(null)

    // Get user if logged in
    useEffect(() => {
        const fetchUser = async() => {
            const response = await fetch("http://localhost:8000/api/getuser", {
                headers: {'Content-Type': 'application/json'},
                credentials: 'include'
            })

            const user = await response.json()
            
            if (user.message !== undefined) { // if error message from server:
                setUser('')                   // set user to empty (couldn't get user)
            } else {                          // else:
                localStorage.setItem("user", user)
                setUser(user)    // set user to retrieved user's user
            }
        }
        fetchUser().catch(setUser('')) // get user, set to empty if cannot get user
    },[])

  return (
    <>
        <BrowserRouter>
            <Navbar user={user} setUser={setUser} room_id={room_id} />
            <Route exact path='/'                  component={() => <Home user={user} setUser={setUser} setRoomID={room_id => setRoomID(room_id)}/>}/>
            <Route path='/login'                   component={() => <Login user={user} setUser={setUser} />}/>
            <Route path='/register'                component={() => <Register user={user} />} />
            <Route exact path='/friend/:friend_id' component={() => <Friend user={user} isRoom={false} setRoomID={room_id => setRoomID(room_id)}/>} />
            <Route exact path='/room/:room_id'     component={() => <Room user={user} isRoom={true} setRoomID={room_id => setRoomID(room_id)} />}/>
        </BrowserRouter>

    </>
  );
}

export default App;
