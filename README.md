# Real-Time-Chat-App
Real time text communication web application. Server-side code is written in Go using the Fiber framework and the client-side code is written in React.js. 
Real-time communication is done through websockets and the client requests data from the server through a REST API.

Table of Contents
=================

   * [Introduction](#introduction)
   * [Server](#server)
      * [Server Directory Structure](#server-directory-structure)
      * [main.go](#main.go)
      * [Models](#models)
        * [user.go](#user.go)
        * [room.go](#room.go)
      * [API](#api)
        * [auth.go](#auth.go)
        * [friend.go](#friend.go)
        * [room.go](#room.go)
      * [Chat](#chat)
        * [connect.go](#connect.go)
        * [client.go](#client.go)
        * [pool.go](#pool.go)
    * [Client](#client)
      * [Client Directory Structure](#client-directory-structure)
      
## Introduction
This web application allows users to communicate in real-time with other users. Users can add friends and create rooms on the homepage. Data is sent to and received
 from the server through a REST API. However, real-time communication is done through the use of websockets. 

## Server
### Server Directory Structure
<pre>
├── api
│   ├── auth.go
│   ├── friend.go
│   └── room.go
├── chat
│   ├── client.go
│   ├── connect.go
│   └── pool.go
├── database
│   └── connect.go
├── docker-compose.yml
├── Dockerfile
├── go.mod
├── go.sum
├── main.go
├── models
│   ├── room.go
│   └── user.go
└── routes
    └── routes.go
</pre>
### main.go
- The main file first connects to the MongoDB database through the method in database/connect.go
  - Disconnecting from the database is deferred immediately after the connection completes
- Next, a new fiber instance is instantiated
  - The fiber instance is configured to use CORS and websockets
  - Additionaly, the routes for API requests and websocket connections are established through the Setup method in the routes/routes.go file
- Finally, the fiber instance is setup to listen on the port stored as an environment variable
  - If the environment variable cannot be found, the instance listens on port 8000
  
### Models
#### user.go
- This file defines the user model
- The user model has the following fields:
  - ID: a unique id of type primitive.ObjectID (a mongo object id)
  - Username
  - Email
  - Password
  - Friends: a list of IDs
  - FriendReqs: a list of IDs. Holds IDs from users who sent friend requests
  - Rooms: a list of room IDs
  - ProfilePic: A string to the path of the user's profile picture
#### room.go
- This file defines the room model
- The room model has the following fields:
  - ID: a unique id of type primitive.ObjectID (a mongo object id)
  - Name: string that is the name of the room
  - People: a list of IDs for the people in the room
  - Messages: a list of message objects
  - FriendRoom: a boolean that tells if the room is a friend chat room (a room that is created when 2 users become friends)
  - RoomPic: string to the path of room picture
- The message model has the following fields:
  - ID: a unique id of type primitive.ObjectID (a mongo object id)
  - User: a string that holds the username of who sent the message
  - Text: a string of the message itself
  
### API
#### auth.go
- This file contains the following methods: 
  - Register: register new users
  - Login: log in using bcrypt and jwt 
  - GetUserAuth, GetUser: two methods for getting the user's model based on the jwt cookie (the first is for internal acces the latter for external)
  - Logout: log out 
#### friend.go
- This file contains the following methods:
  - GetFriends: get all friends
  - GetFriendReqs: get friend requests
  - GetFriendInfo: get friend username and profile pic
  - GetFriendChat: get room ID for chat w/this particular friend
  - SearchUsers: get search results when searching for friends
  - AddFriend: add friend and create friend chat room
  - RemoveFriend: remove friend and delete friend chat room
  - CheckIfFriends: check if user and potential friend are friends
  - getFriend: Get friend model for internal use
#### room.go
- This file contains the following methods:
  - GetRooms: get all rooms the user is in
  - GetRoomInfo: get room name, picture, and users in specified room
  - AddToRoom: add specified user to specified room
  - CreateRoom
  - LeaveRoom
  - GetMessages: get all messages for this room
  
### Chat
#### connect.go
- This file contains the logic necessary for the client to connect to the server through websockets
- Contains a list of currently active pools
- When a user requests to connect to a pool, if the pool is active, the user is registered with the pool. Otherwise, a new pool is created and the user is
registered with the pool.
  - When a pool is created, a go routine is also created for the Listen method in pool.go
- If the websocket connection request was sent from the home page, the ReadHome method in client.go is ran. Otherwise, the ReadMessage method in client.go will be ran
#### client.go
- This file defines two models: Client and Request
- The Client model contains the following fields:
  - ID
  - User: a string of the username of the client
  - Conn: a pointer to the websocket connection
  - Pool: a pointer to the pool the client is in
- The Request model represents the request that is passed from one client to another. The model contains the following fields:
  - SenderID: ID of the client who sent the request
  - FriendID: ID of the client who will receive the request
  - RoomID: Id of the room that will receive the request
  - InPending: a string formatted boolean that tells if the sender is in pending friend requests
  - Request: the request itself
- The ReadHome method reads JSON requests over the websocket connection and sends them to the specified user
- The ReadMessage method is similar to the ReadHome method, however, this method broadcasts the incoming message to all the clients connected to the pool. Additionaly,
the message is saved in the database.
#### pool.go
- This file defines a Pool model with the following fields:
  - ID
  - ClientCount: number of clients in pool
  - Clients: a hashmap where the key is a pointer to a client object and the value is a bool that determines if they are in the pool
  - Register: a channel that is a pointer to a client
  - Unregister: a channel that is a pointer to a client
  - Broadcast: a channel that is a message object
- The Listen method in this file is an infinite while loop with a select case statement to determine the desired request
  - If the pool receives a request on the register channel, the client is added to the pool and the client count is incremented
  - If the pool receives a request on the unregister channel, the client is removed from the pool and the client coutn is decremented
  - If the pool receives a request on the broadcast channel, the message is broadcasted to all connected clients

## Client
### Client Directory Structure
<pre>
├── build
│   ├── ...
├── node_modules
│   ├── ...
├── public
│   ├── default_pic.jpeg
|   ├── default_room.jpeg
|   └── ...
├── src
│   ├── App.css
│   ├── App.js
|   ├── index.css
|   ├── index.js
|   ├── reportWebVitals.js
|   ├── components
|   |   ├── Button.js
|   |   ├── Button.scss
|   |   ├── CreateRoom.js
|   |   ├── CreateRoom.scss
|   |   ├── Dropdown.js
|   |   ├── Dropdown.scss
|   |   ├── MessageBox.js
|   |   ├── MessageBox.scss
|   |   ├── Message.js
|   |   ├── Message.scss
|   |   ├── Navbar.js
|   |   ├── Navbar.scss
|   |   ├── Preview.js
|   |   ├── Preview.scss
|   |   ├── Search.js
|   |   └── Search.scss
|   └──pages
|      ├── Friend.js
|      ├── Home.js
|      ├── Home.scss
|      ├── Login.js
|      ├── Login.scss
|      ├── Logout.js
|      ├── Register.js
|      ├── RoomFriend.scss
|      └── Room.js 
└── ...
</pre>
