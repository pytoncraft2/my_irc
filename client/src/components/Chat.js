import React from 'react';
import styled from "styled-components";


const Container = styled.div`
    height: 100vh;
    width: 100%;
    display: flex;
`;

const SideBar = styled.div`
    height: 100%;
    width: 15%;
    border-right: 1px solid black;
    background-image: repeating-linear-gradient(222deg,#202d2f,transparent 417px);
    box-shadow:-3px 0px 20px 0px inset black;
    z-index:4;
    color:white;
`;

const RightBar = styled.div`
    height: 100%;
    width: 15%;
    border-right: 1px solid black;
    background-image:repeating-linear-gradient(40deg,#202d2f,transparent 417px);
    box-shadow:1px 11px 20px 0px inset black;
    color:white;
`;

const ChatPanel = styled.div`
    height: 100;
    width: 85%;
    display: flex;
    flex-direction: column;
    background:#276A75;
    color:white;
`;

const BodyContainer = styled.div`
    width: 100%;
    height: 75%;
    overflow: auto;
    border-bottom: 1px solid black;
`;

const TextBox = styled.textarea`
    height: 15%;
    width: 100%;
    background:#123036;
    box-sizing: border-box;
    color:white;
`;

const ChannelInfo = styled.div`
    border-bottom: 1px solid black;
    background-image:repeating-linear-gradient(181deg, black, transparent 100px);
    box-shadow:-4px 1px 9px 6px #0d2428;
    display: flex;
    justify-content: center;
    align-items: center;
`;

const Row = styled.div`
    cursor: pointer;
`;

const Messages = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
`;

const Msg = styled.div`
      display:flex;
      width:100%;
      justify-content: left;
      text-align: left;
      text-indent: 20%;
      padding-bottom: 1%;
 `;

const Msgi = styled.div`
      display:flex;
      width:100%;
      justify-content: center;
      text-align: center;
 `;

const Msgm = styled.div`
      width:100%;
      display:flex;
      justify-content: flex-end;
      padding-bottom: 1%;
      padding-top: 1%;
 `;

const Bloc = styled.div`
      background: #00404a;
      width: 50%;
      box-shadow: 0px 0px 8px 0px;
      margin: 2%;
      border-radius: 7px;
 `;


const BlocI = styled.div`
      background: #00404a;
      width: 100%;
      color: grey;
 `;

const Button = styled.div`
    background: #276a75;
    color: white;
    border: 2px solid #2f3b3d;
    padding: 1%;
    cursor: pointer;
`;

const Blocm = styled.div`
      background: #202d2f;
      width: 50%;
      border-radius: 7px;
      box-shadow: 1px 1px 4px 0px black;
 `;

const Infos = styled.div`
    background-color: #12303663;
    color: grey;

`;

export default function Chat(props) {

/**
 * AFFICHAGE CHANNEL
 *
 * @param  {[type]} room [description]
 * @return {[type]}      [description]
 */

function renderRooms(room) {

return (
  <Row key={room}>
  {props.rooms.map((key, index)=> {
    const currentChat = {
      author: key.author,
      chatName: key.title,
      isChannel: true,
      receiverId: "",
    }
    return(<Button key={index} onClick={() => props.toggleChat(currentChat)}>{key.title}</Button>)
  })}
  </Row>
  );
}

/**
 * AFFICHAGE UTILISATEURS
 *
 * Creation de la liste + redirection vers un autre chat lors du clique
 * @param  { Object } user liste des utilisateurs
 * @return { Component }      Element HTML
 */

    function renderUser(user) {

      if (user.id === props.yourId) {
        return (
          <Row key={user.id}>
            Vous: {user.username}
          </Row>
        );
      }

    const currentChat = {
      chatName: user.username,
      isChannel: false,
      receiverId: user.id,
    }
    return (
      <Row onClick={() => {
        props.toggleChat(currentChat);
      }} key={user.id}>
      {user.username}
      </Row>
    );
  };

/**
 * LISTE MESSAGE
 * @param  {Object} message [description]
 * @param  {int} index   [description]
 * @return {[type]}         [description]
 */
    function afficheMessage(message, index) {
      if (message.sender === props.pseudo) {
        return (
            <Msg key={index}>
              <Bloc>
                <h3>{message.sender}</h3>
                <p>{message.content}</p>
              </Bloc>
            </Msg>
        );
      }

      return (
            <Msgm key={index}>
              <Blocm>
                <h3>{message.sender}</h3>
                <p>{message.content}</p>
              </Blocm>
            </Msgm>
      );

    }
/**
 * DEFINIS L'AFFICHAGE DU BLOC DE MESSAGE
 *
 * Si Le channel correspond au channel actuel, affiche messages
 * Sinon affiche le bouton pour se connecter au channel
 *
 * @type {[type]}
 */
let body;
if (!props.currentChat.isChannel || props.connectedRooms.includes(props.currentChat.chatName)) {
    body = (
      <Messages>
          {props.messages.map(afficheMessage)}
      </Messages>
    );
} else {
  body = (
        <Button onClick={() => props.rejoindreSalle(props.currentChat.chatName)} >Rejoindre {props.currentChat.chatName}</Button>
  )
}

/**
 * GERE ENVOIE MESSAGE
 *
 * Apres validation de la touche Entrer, Verifie si sa correspond a une commande
 * Si le resultat retourne vrai ,envoie le message
 * @param  { event } e
 * @return {[type]}
 */

  function handleKeyPress(e) {
    if (e.key === "Enter") {
      props.interpreteMessage().then((data) => {
        if (data) {
          props.sendMessage();
        }
      });
    }
  }

/**
 * MESSAGES DE BIENVENUE
 *
 * @param  {Object} info  liste des infos
 * @param  {int} index
 * @return {[type]}       [description]
 */

function renderInfos(info, index) {
        return (
            <Msgi key={index}>
              <BlocI>
                <p>{info}</p>
              </BlocI>
            </Msgi>
        );
}

  return (
    <Container>
        <SideBar>
        <h3>Channels</h3>
        {renderRooms()}
        <h3>Tout les utilisateurs</h3>
        {props.allUsers.map(renderUser)}
        <hr/>
        <h4>Nombre d'utilisateur sur le channel</h4>
        {props.nbr}
        </SideBar>
          <ChatPanel>
            <ChannelInfo>
                {props.currentChat.chatName}
            </ChannelInfo>

          <BodyContainer>
              {body}
          </BodyContainer>
          <Infos>
            {props.infos}
          </Infos>
          <TextBox
              value={props.message}
              onChange={props.handleMessageChange}
              onKeyPress={handleKeyPress}
              placeholder="Ecrire un super message 😎"
              autoFocus={true}
          />
          </ChatPanel>
          <RightBar>
            <h2>Edition</h2>
            <h4>Admin: {props.currentChat.author}</h4>
            {props.currentChat.author === props.pseudo ? <button onClick={props.suppression}>Supprimer ce channel</button> : ''}
          </RightBar>
    </Container>
  )
}
