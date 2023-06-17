import { useContext, useState } from 'react';
import styles from './message.module.css';
import { UserData } from '../../context/UserContext';
import { MessageData } from '../../context/MessageContext';
import { ModalData } from '../../context/ModalContext';
import config from '../../../config/env';
import { useNavigate } from 'react-router-dom';


function Message(props) {

    const navigate = useNavigate();

    const { baseFetchUrl } = config;
    const { messageInfo, messagesDeleted, setMessagesDeleted, onView, noComment, isComment, token } = props;

    const { userAuthenticated, setUserAuthenticated } = useContext(UserData);
    const { message, setMessage } = useContext(MessageData)
    const { modal, setModal } = useContext(ModalData)
    const { value, setValue } = useContext(ModalData)

    const [edition, setEdition] = useState(false)
    const [newContent, setNewContent] = useState(messageInfo.content)
    const [reaction, setReaction] = useState({
        liked: messageInfo.liked.length,
        disliked: messageInfo.disliked.length
    })

    const goToUserProfile = () => {
        navigate(`/home/${messageInfo.author._id}`)
    }

    const handleDeleteMessage = () => {
        if (messageInfo.author._id === userAuthenticated._id) {
            if (!isComment) {

                fetch(`${baseFetchUrl}/message/delete/${messageInfo._id}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include',
                    body: JSON.stringify({ token })
                })
                    .then(res => res.json())
                    .then(data => {
                        setMessage(data.message)
                        if (!data.error) {
                            const newMessagesDeleted = messagesDeleted.push(messageInfo._id)
                            setMessagesDeleted(newMessagesDeleted)
                        }
                    })
            }
            else {

                console.log('je supprime le commentaire')

            }
        }
    }

    const handleEditMessage = () => {
        if (messageInfo.author._id === userAuthenticated._id) {
            setEdition(true)
        }
    }

    const handleValidateEdit = () => {
        setEdition(false)
        if (newContent !== messageInfo.content) {     //send request to update the message only if the user change it, if not just display like it was before
            if (!isComment) {
                fetch(`${baseFetchUrl}/message/edit/${messageInfo._id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ newContent, token }),
                    credentials: 'include'
                }).then(res => {
                    if (!res.ok) {        //if it work the user will know it cause the display message will change
                        res.json().then(data => setMessage(data.message))
                        setNewContent(messageInfo.content)      //the message change before the update, so if the update fail return the message to what it was before, with a toast error
                        messageInfo.content = newContent        //store the new content in messageInfo.content even if it not change the display. Just because we need this for the condition before continue to work
                    }
                })
                    .catch(err => setMessage('erreur lors de la modification du message'))
            }
            else {
                console.log("je valide l'édition de mon commentaire")
            }
        }
    }

    // console.log('les info que je recupère:', messageInfo)

    const handleReactMessage = (reaction) => {
        if (userAuthenticated._id === messageInfo.author._id) {
            return setMessage('Vous ne pouvez pas réagir à vos propre messages.')
        }

        if (!isComment) {
            fetch(`${baseFetchUrl}/message/${messageInfo._id}/${reaction}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            }).then(res => res.json()).then(data => setReaction({ liked: data.likes, disliked: data.dislikes }))
        }
        else {
            console.log('je réagis à un commentaire')
        }
    }

    const handleMessageView = () => {
        navigate(`/message/${messageInfo._id}`, { state: { messageInfo: messageInfo, token: token } })    //navigate to the view of the message with comment. Send all the info we need so we haven't to fetch to our new page
    }

    return (
        <div className={styles.message}>
            <div className={styles.infoMessage}>
                <div onClick={() => goToUserProfile()}>
                    <img src={`/assets/profile/${messageInfo.author.avatar}`} alt="user avatar" />
                    <span>{!isComment ? messageInfo.author.username : `${messageInfo.author.username} à commenté`}</span>
                </div>
                {!isComment &&
                    <div className={styles.edition}>
                        <span>{messageInfo.updatedAt.substring(0, 10).split('-').reverse().join('-')}</span>
                        {!onView && userAuthenticated && messageInfo.author._id === userAuthenticated._id &&
                            <div className={styles.editionAuthor}>
                                {edition ?
                                    <span className="material-symbols-outlined" style={{ cursor: 'pointer' }} onClick={() => handleValidateEdit()}>
                                        check_circle
                                    </span>
                                    :
                                    <span className="material-symbols-outlined" style={{ cursor: 'pointer' }} onClick={() => handleEditMessage()}>
                                        edit_note
                                    </span>
                                }
                                <span className="material-symbols-outlined" style={{ cursor: 'pointer' }} onClick={() => handleDeleteMessage()}>
                                    delete
                                </span>
                            </div>
                        }
                    </div>
                }
            </div>
            <div className={styles.content}>
                {messageInfo.file &&
                    <img src={`/assets/messageFiles/${messageInfo.file}`} alt="image uploadé par l'auteur" />
                }
                {messageInfo.content &&
                    edition ?
                    <textarea className={styles.changeContentValue} value={newContent} onInput={(e) => setNewContent(e.target.value)}></textarea>

                    :
                    <p>{newContent.replaceAll('\\', '')}</p>
                }
                {!messageInfo.content && edition &&
                    <textarea className={styles.changeContentValue} value={newContent} onInput={(e) => setNewContent(e.target.value)}></textarea>
                }
            </div>
            {!isComment &&
                <div className={styles.reactions}>
                    <div>
                        <p onClick={() => handleReactMessage('like')}>
                            <span className="material-symbols-outlined" style={{ cursor: 'pointer' }}>
                                heart_plus
                            </span>
                            {reaction.liked}
                        </p>
                        <p onClick={() => handleReactMessage('dislike')}>
                            <span className="material-symbols-outlined" style={{ cursor: 'pointer' }}>
                                heart_minus
                            </span>
                            {reaction.disliked}
                        </p>
                    </div>
                    {!noComment &&
                        <p style={{ cursor: 'pointer' }} onClick={() => { handleMessageView() }}>
                            <span className="material-symbols-outlined">
                                chat
                            </span>
                            {messageInfo.numberOfComments}
                        </p>
                    }
                </div>
            }
        </div>
    )
}

export default Message

// for l.126, first see if we are watching the commentaries of the message. We don't want to let the user edit his message on this page.
//then, see if we have an authenticated user, cause even if they are unauthenticated they can see the messages
//finally, compare the authenticated user id and the author id. If they are the same the user is the author of the message and can edit or delete it.