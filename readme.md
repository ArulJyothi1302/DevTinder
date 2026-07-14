Chat using Websocket - Realtime
Lib - socket.io
socket.io is a library
keywords - low-latency, bi-directional, event-based

Socket.IO is a library that enables low-latency, bidirectional and event-based communication between a client and a server.

low-latency
fast and seamless
Bi-directional  
 client -> server
server -> client
Event-based
like event listeners

Build-Chat Window

    Create CHAT.JSX
    add a router /chat
    it should be user based chat -> chat/peer-user-id
    npm i socket.io
    require http
    listen the server
    require socket
    pass the server for socket io = socket(Server,()=>{})
    accept the connection
    create unique secured roomid
    emit send message
    emit recieveMessage
