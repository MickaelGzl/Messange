import { useContext, useEffect, useState } from 'react';
import styles from './messageView.module.css';
import config from "../../../config/env";
import { MessageData } from "../../context/MessageContext";
import { useLocation, useParams } from 'react-router-dom';
import { UserData } from '../../context/UserContext';
import Message from '../../components/Message/Message';

import { io } from 'socket.io-client';

const { baseFetchUrl, socketUrl } = config;
const socket = (io(`${socketUrl}`));


function MessageView() {

    const { state } = useLocation();
    const { messageInfo } = state;        //retrieve the state we send from Message
    // console.log("j'ai récupéré les informations de mon message:", messageInfo)

    const { id } = useParams();
    // const { baseFetchUrl, baseSocketUrl } = config;

    const { userAuthenticated, setUserAuthenticated } = useContext(UserData);   //contain the user authenticated
    const { message, setMessage } = useContext(MessageData)


    const [commentaries, setCommentaries] = useState([])
    const [commentsDeleted, setCommentsDeleted] = useState([])
    const [content, setContent] = useState('')

    useEffect(()=>{
        socket.on("connect", () => {
            console.log('socket connecté. id:', socket.id);
        })

        return ()=>{
            socket.off('connect')
        }
    }, [])

    useEffect(() => {
        fetch(`${baseFetchUrl}/message/view/${id}`)
            .then(res => res.json())
            .then(data => {
                setCommentaries(data.comments)
            })
            .catch(err => console.log(err))
    }, [id])

    const handleSubmitComment = (e) => {
        e.preventDefault();
        // const socket = (io(`${baseSocketUrl}`));
        socket.on("connect", () => {
            console.log('socket connecté. id:', socket.id);
            socket.emit('newComment', { content, url: baseFetchUrl, id: messageInfo._id })
            socket.on('commentAdded', (res) => {
                console.log('une réponse', res)
                fetch(`${baseFetchUrl}/message/view/${id}`)
                    .then(res => res.json())
                    .then(data => {
                        setCommentaries(data.comments)
                    })
                    .catch(err => console.log(err))
            })
        });

        if (!userAuthenticated) {
            setMessage('Vous devez être connecté pour écrire un message')
        }
        if (!userAuthenticated.username) {
            setMessage('Vous pourrez commenter un message après avoir défini un pseudo sur votre profil')
        }
        //an user is connected and define his username, so everything is ok to submit a comment

        fetch(`${baseFetchUrl}/message/edit_comment/${messageInfo._id}`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ content }),
            credentials: 'include'
        })
            .then(res => res.json())
            .then(data => {
                console.log(data)
            })
            .catch(err => setMessage("Erreur lors de l'enregistrement de votre commentaire"))
    }

    return (
        <>
            {messageInfo &&
                <div className={styles.container}>
                    <div>
                        <Message messageInfo={messageInfo} onView={true} noComment={true} />
                        <div className={styles.commentaries}>
                            {commentaries && commentaries.map(comment => {
                                if (!commentsDeleted.includes(comment._id.toString())) {
                                    return <Message key={comment._id} messageInfo={comment} messagesDeleted={commentsDeleted} setmessagesDeleted={setCommentsDeleted} noComment={true} isComment={true} />
                                }
                            })}

                        </div>
                    </div>
                    <form className={styles.addComment} onSubmit={(e) => handleSubmitComment(e)}>
                        <textarea name="content" value={content} onInput={(e) => setContent(e.target.value)}></textarea>
                        <div className={styles.buttonWrapper}>
                            <button className={styles.btn} type="submit">
                                Envoyer
                            </button>
                        </div>
                    </form>
                </div>
            }
        </>
    )
}

export default MessageView