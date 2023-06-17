import { useState } from 'react';
import styles from './commentEdition.module.css';


// import { io } from 'socket.io-client';

// const { baseFetchUrl, socketUrl } = config;
// const socket = (io(`${socketUrl}`));


function CommentEdition(props) {

    const { url, user, setMessage, id, token, socket } = props;

    const [content, setContent] = useState('')

    const handleSubmitComment = (e) => {
        e.preventDefault();
        if (!user || !user.username) {
            return setMessage("Veuillez compléter votre profil avant d'envoyer un message")
        }
        if (!token) {
            return setMessage('Vous ne pouvez pas exécuter cette action.')
        }
        //an user is connected and define his username. Also, a token is submit with the form so everything is ok to submit a comment

        fetch(`${url}/message/edit_comment/${id}`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ content, token }),
            credentials: 'include'
        })
            .then(res => {
                if (res.ok) {
                    res.json().then(data => {
                        socket.emit('newComment', data.comment)
                        setContent('')
                    })
                        .catch(err => {
                            setMessage("Votre message n'a pas pu être envoyé.")
                        })
                }
            })
            .catch(err => {
                console.log(err)
                setMessage("Erreur lors de l'enregistrement de votre commentaire")
            })

    }

    return (
        <form className={styles.addComment} onSubmit={(e) => handleSubmitComment(e)}>
            <textarea name="content" value={content} onInput={(e) => setContent(e.target.value)}></textarea>
            <div className={styles.buttonWrapper}>
                <button className={styles.btn} type="submit">
                    Envoyer
                </button>
            </div>
        </form>
    )
}

export default CommentEdition;