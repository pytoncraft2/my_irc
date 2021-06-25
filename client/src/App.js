import './App.css';
import React, { useState, useRef, useEffect } from 'react';
import Form from "./components/UtilisateurForm";
import Chat from "./components/Chat";
import io from "socket.io-client";
import immer from "immer";

const initialMessagesState = {
  general: [],
  random: [],
  jokes: [],
  javascript: []
};

function App() {

const [pseudo, setUsername] = useState("");
const [infos, setInfos] = useState([]);
const [connected, setConnected] = useState(false);
const [currentChat, setCurrentChat] = useState({ isChannel: true, chatName: "general", receiverId: "", author: "personne"});
const [connectedRooms, setConnectedRooms] = useState(["general"]);
const [allUsers, setAllUsers] = useState([]);
const [messages, setMessages] = useState(initialMessagesState);
const [message, setMessage] = useState("");
const [rooms, setRooms] = useState([
  {title: "general", author: "personne"},
  {title: "random", author: "personne"},
  {title: "jokes", author: "personne"},
  {title: "javascript", author: "personne"}]
);


const socketRef = useRef();


useEffect(() => {
  setMessage("")
}, [messages]);

function handleMessageChange(e) {
  setMessage(e.target.value);
}

function suppression(e) {
  console.log("EEEE");
  console.log(e);
  let chan = currentChat.chatName;
  alert("SUPPRESSION de " + chan);
  for (var i = 0; i < rooms.length; i++) {
    if (rooms[i].title === chan) {
      socketRef.current.emit("info")
      socketRef.current.emit("delete channel", {i: i, name: rooms[i].title});
    }
  }
  toggleChat({ author: "personne",
    chatName: "general",
    isChannel: true,
    receiverId: ""});
}

/**
 * ENVOIE MESSAGE
 * @return {[type]} [description]
 */

function sendMessage() {
  const payload = {
    content: message,
    to: currentChat.isChannel ? currentChat.chatName : currentChat.receiverId,
    sender: pseudo,
    chatName: currentChat.chatName,
    isChannel: currentChat.isChannel
  };

  socketRef.current.emit("send message", payload);

/**
 * Ajout au tableau messages un nouveau pseudo & message
 * De maniere immutable
 * @type {[type]}
 */

  const newMessages = immer(messages, draft => {
    draft[currentChat.chatName].push({
      sender: pseudo,
      content: message
    });
  });
  setMessages(newMessages);
}


async function interpreteMessage() {
  if (message === "/list") {
  }
  //create
  let res = message.match(/\/create/g);
  if (res !== null) {
      alert("Creation de "+res);
      let result = await message.match(/\s+[^\s]+/)
      let r = result[0];
      initialMessagesState[r] = [];
      socketRef.current.emit("new channel", {author: pseudo, channelName: result[0].trim()});
      return false;
  }

  //delete
  let res2 = message.match(/\/delete/g);
  if (res2 !== null) {
      alert("Suppression de "+res2);
      let result2 = message.match(/\s+[^\s]+/)
      suppression(result2[0].trim());
      return false;
  }

    //join
    let res3 = message.match(/\/join/g);
  if (res3 !== null) {
      alert("OK "+res3);
      let result3 = message.match(/\s+[^\s]+/)
    let rep = result3[0].trim();
      toggleChat({ author: "personne",
        chatName: rep,
        isChannel: true,
        receiverId: ""});
      return false;
  }

    //leave
    let res4 = message.match(/\/leave/g);
  if (res4 !== null) {
      alert("OK "+res4);
      let result4 = message.match(/\s+[^\s]+/)
      alert(result4);
      setConnected(false);
      return false;
  }

  //users
  let res5 = message.match(/\/users/g);
  if (res5 !== null) {
      alert("USERS");
  }

      //msg
    let res6 = message.match(/\/msg/g);
  if (res6 !== null) {
      let result6 = message.match(/\s+[^\s]+/)
      alert("MESSAGE"+result6);
  }
  return true;
}

function roomJoinCallback(incomingMessages, room, pseudo) {
  const newMessages = immer(messages, draft => {
  draft[room] = incomingMessages;
});
setMessages(newMessages);
}

/**
 *
 * @param  {[type]} room [description]
 * @return {[type]}      [description]
 */

function rejoindreSalle(room) {
  const newConnectedRooms = immer(connectedRooms, draft => {
    draft.push(room);
  });

  socketRef.current.emit("join room", {room: room, pseudo: pseudo}, (messages, infos) => roomJoinCallback(messages, room));
  setConnectedRooms(newConnectedRooms);
}

/**
 * Ajoute un tableau vide si le channel n'as jamais était crée
 * Change l'etat du Chat actuelle
 * @param  {Object} currentChat [description]
 * @return {[type]}             [description]
 */

function toggleChat(currentChat)  {
  socketRef.current.emit("leave room", {room: currentChat.chatName, pseudo: pseudo});
  if(!messages[currentChat.chatName]) {
    const newMessages = immer(messages, draft => {
      draft[currentChat.chatName] = [];
    });
    setMessages(newMessages);
  }
  setCurrentChat(currentChat);
}


function handleChange(e) {
  setUsername(e.target.value);
}

function connect() {
  setConnected(true);
  socketRef.current = io.connect("/");
  socketRef.current.emit("join server", pseudo);
  socketRef.current.emit("join room", {room: 'general', pseudo: pseudo}, (messages) => roomJoinCallback(messages, "general"));
  socketRef.current.on("new user", allUsers => {
    setAllUsers(allUsers);
  });


socketRef.current.on("delete", res => {
  const currentChat = {
      chatName: "general",
      isChannel: true,
      receiverId: "",
    }
    setRooms(rooms);
    toggleChat(currentChat);
  });

  socketRef.current.on("create new channel", res => {
    setRooms(rooms => {
      const newRooms = immer(rooms, draft => {
          draft.push({title: res.channelName, author: res.author});
      });
      return newRooms;
    });
});

/**
 * AFFICHAGE INFOS
 * @param  { Object } data
 * @return {[type]}      [description]
 */
socketRef.current.on('info', function(data) {
  setInfos(data.msg);
});

  socketRef.current.on("new message", ({ content, sender, chatName }) => {
    setMessages(messages => {
      const newMessages = immer(messages, draft => {
        if (draft[chatName]) {
          draft[chatName].push({ content, sender });
        } else {
          draft[chatName] = [{ content, sender }];
        }
      });
      return newMessages;
    });
  });
}


let body;

if(connected) {
body = (
  <Chat
  message={message}
  pseudo={pseudo}
  rooms={rooms}
  handleMessageChange={handleMessageChange}
  sendMessage={sendMessage}
  yourId={socketRef.current ? socketRef.current.id : ""}
  allUsers={allUsers}
  rejoindreSalle={rejoindreSalle}
  interpreteMessage={interpreteMessage}
  connectedRooms={connectedRooms}
  currentChat={currentChat}
  socketRef={socketRef}
  toggleChat={toggleChat}
  infos={infos}
  suppression={suppression}
  messages={messages[currentChat.chatName]}
  />
);
} else {
  body = (
    <Form pseudo={pseudo} onChange={handleChange} connect={connect}/>
  )
}
  return (
    <div className="App">
    {body}
    </div>
  );
}

export default App;
