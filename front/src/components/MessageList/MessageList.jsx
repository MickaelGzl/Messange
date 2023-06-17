import { useContext, useState } from 'react';
import Message from '../Message/Message';
import styles from './messageList.module.css';


function MessageList(props) {

    const [messagesDeleted, setmessagesDeleted] = useState([])      //stock all the id of suppressed messages, like this we can manage display messages until the user refresh the page

    const { userMessages, display, token, isComment } = props;


    return (
        <>
            {userMessages && userMessages.map(message => {
                if (!messagesDeleted.includes(message._id.toString())) {
                    return <Message key={message._id} messageInfo={message} userMessages={userMessages} messagesDeleted={messagesDeleted} setmessagesDeleted={setmessagesDeleted} onView={false} token={token} isComment={isComment} />
                }
            })}
        </>
    )
}

export default MessageList