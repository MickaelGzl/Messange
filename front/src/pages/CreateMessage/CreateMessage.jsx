import { useContext, useEffect, useState } from 'react'
import styles from './createMessage.module.css'
import { useNavigate } from 'react-router-dom';
import { UserData } from '../../context/UserContext';
import { MessageData } from '../../context/MessageContext';
import config from '../../../config/env';
import FormData from 'form-data';
import checkUserIsAuthenticated from '../../utils/checkUserAuthenticated';
import checkUserUsername from '../../utils/checkUserUsername';
// import FileResizer from 'react-image-file-resizer';

function CreateMessage() {

    // const resizeFile = (file) => new Promise(resolve =>{
    //     FileResizer.imageFileResizer(file, 320, 320, 'PNG', 100, 0,
    //         uri =>{
    //             resolve(uri) 
    //         }
    //     )
    // })
    const {baseFetchUrl} = config;

    const navigate = useNavigate();
    const { userAuthenticated, setUserAuthenticated } = useContext(UserData);
    const { message, setMessage } = useContext(MessageData)

    const [token, setToken] = useState('')


    useEffect(() => {
        fetch(`${baseFetchUrl}/auth/csrf-token`, {credentials: 'include'}).then(res => {
            if(res.status === 401){
                setUserAuthenticated();
                res.json().then(data => setMessage(data.message))
                return navigate('/signin')
            }
            else if( res.status === 500){
                setUserAuthenticated();
                res.json().then(data => setMessage(data.message))
                return navigate('/home')
            }
            else if( res.ok){
                res.json().then(data => setToken(data.token))       //send a 401 http response if no user authenticated
            }
        })  
    }, [])

    const [contentError, setContentError] = useState('');
    const [newMessage, setNewMessage] = useState({
        content: "",
        imageName: "",
        image: ''
    });

    const handleMessage = (e) => {
        if (e.target.name === "imageName") {
            setNewMessage({ ...newMessage, image: e.target.files[0], [e.target.name]: e.target.value })
        }
        else {
            setNewMessage({ ...newMessage, [e.target.name]: e.target.value })
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        setContentError('');                                               //if there was an error before, erase it
        if(!newMessage.image && !newMessage.content){
            return setContentError('Votre message ne comporte aucun contenu')
        }
        if(newMessage.image && newMessage.image.type.split('/')[0] !== "image"){                //verify that the user send an image, if not block it
            return setContentError('Le type de fichier est invalide.')
        }
        const formData = new FormData()
        formData.append('content', newMessage.content)
        formData.append('image', newMessage.image)
        formData.append('token', token)
        fetch(`${baseFetchUrl}/message/create`,{
            method: 'POST',
            body: formData,
            credentials: 'include'
        })
        .then(res => res.json())
        .then(data => {
            setMessage(data.message)        //informe the user what happened
            if(!data.error){                //if we didn't send an error, the message is correctly save and we can redirect the user to his profile
                navigate('/home')     
            }
        })
    };

    checkUserIsAuthenticated(userAuthenticated);
    checkUserUsername(userAuthenticated);

    return (
        <div className={styles.container}>
            <form className={styles.message} method="POST" encType='multipart/form-data' onSubmit={(e) => handleSubmit(e)}>
                <p>Ecrire un nouveau message</p>
                <textarea
                    name="content"
                    onInput={(e) => handleMessage(e)}
                    className={styles.contentEdit}
                    value={newMessage.content}
                    placeholder='Nouveau message...'
                >
                </textarea>
                <input type="file" name="imageName" onChange={(e) => handleMessage(e)} className='input fichier avec handleChange' />
                <div className={styles.errorMessage}>{contentError}</div>
                <input type='hidden' value={token}/>
                <div className={styles.buttonWrapper}>
                    <button className={styles.btn} type="submit">
                        Envoyer
                    </button>
                </div>
                <small className={styles.cancelEdition} onClick={() => navigate('/home')}>Retour</small>
            </form>
        </div>
    )
}

export default CreateMessage