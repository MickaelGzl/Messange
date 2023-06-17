import { useContext, useEffect, useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import styles from './chatComment.module.css';
import config from "../../../config/env";
import { MessageData } from "../../context/MessageContext";
import { UserData } from '../../context/UserContext';
import Message from '../../components/Message/Message';

import { io } from 'socket.io-client';
import CommentEdition from '../../components/CommentEdition/CommentEdition';
import MessageList from '../../components/MessageList/MessageList';
import checkUserIsAuthenticated from '../../utils/checkUserAuthenticated';

function ChatComments() {

    const navigate = useNavigate();

    const { id } = useParams();
    const { state } = useLocation();
    const { messageInfo } = state;        //retrieve the state we send from Message

    const { baseFetchUrl, socketUrl } = config;
    const { userAuthenticated, setUserAuthenticated } = useContext(UserData);
    const { message, setMessage } = useContext(MessageData)

    const [socket, setSocket] = useState();
    const [token, setToken] = useState('');
    const [commentaries, setCommentaries] = useState([])

    async function getToken() {
        const [tokenResponse, commentResponse] = await Promise.all([        //get a token for comment édition
            fetch(`${baseFetchUrl}/auth/csrf-token`, {
                credentials: 'include'
            }),
            fetch(`${baseFetchUrl}/message/view/${id}`)                     //in the same time get the commentaries of the message
        ])

        if (!tokenResponse.ok || !commentResponse.ok) {
            navigate('/home');
            return setMessage('Le serveur rencontre actuellement une erreur. Merci de réessayer plus tard');
        }
        const [tokenData, commentData] = await Promise.all([
            tokenResponse.json(),
            commentResponse.json()
        ])
        setToken(tokenData.token);
        setCommentaries(commentData.comments)
    }

    useEffect(() => {
        getToken();

        const newSocket = io(`${socketUrl}`)
        setSocket(newSocket)

        return () => {
            newSocket.close()
        }
    }, [setSocket])

    checkUserIsAuthenticated(userAuthenticated)

    // console.log('les commentaires:', commentaries)

    if (socket) {
        socket.on('renderComment', (newComment) => {
            setCommentaries([...commentaries, newComment])
        })

        socket.on('ping', ()=>{
            console.log('receive ping')
            socket.emit('pong')
        })
    }

    return (
        <div className={styles.container}>
            {messageInfo && socket && token && userAuthenticated &&
                <>
                    <div className={styles.messages}>
                        <Message messageInfo={messageInfo} onView={true} noComment={true} />
                        <div className={styles.commentaries}>
                            <MessageList userMessages={commentaries} token={token} isComment={true} />
                        </div>
                    </div>
                    {userAuthenticated.username ?
                        <CommentEdition 
                            url={baseFetchUrl} 
                            user={userAuthenticated} 
                            setMessage={setMessage} 
                            id={messageInfo._id} 
                            token={token} 
                            socket={socket}
                        />
                        :
                        <div>Vous Pourrez commenter un message une fois votre username défini.</div>
                    }
                </>
            }
        </div>

    )
}

export default ChatComments