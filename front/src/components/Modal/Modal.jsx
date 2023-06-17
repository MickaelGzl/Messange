import styles from "./modal.module.css";
import { ModalData } from "../../context/ModalContext";
import { useContext, useEffect, useState } from "react";
import config from "../../../config/env";
import { UserData } from "../../context/UserContext";
import { MessageData } from "../../context/MessageContext";

export default function Modal() {

    const { baseFetchUrl } = config;

    const { modal, setModal } = useContext(ModalData);       //use our context for the modal
    const { value, setValue } = useContext(ModalData);
    const { message, setMessage } = useContext(MessageData);
    const { userAuthenticated, setUserAuthenticated } = useContext(UserData);
    const [chooseUsername, setChooseUsername] = useState(false);
    const [username, setUsername] = useState('');
    const [mail, setMail] = useState('');
    const [errorMessage, setErrorMessage] = useState('');


    const handleChooseUsername = () => {
        setChooseUsername(true)
    };

    const handleCloseModal = () => {
        setChooseUsername(false)
        setModal()
    };

    const handleSubmitUsername = async () => {
        setErrorMessage('')
        if(username.length === 0){
            return setErrorMessage('Votre username ne peut être vide')
        }
        else if(username === userAuthenticated.username){
            return setModal()
        }
        else if(username.replace(/[.*+?^${}()|[\]<>/]/g, '') !== username){
            return setErrorMessage('Vous username contient des caractères interdits. Liste des caractères interdits: . * + ? ^ $ { } ( ) | [ ] < > / ')
        }
        console.log(username.length)
        console.log('Modal 24fetch username')
        try {
            const response = await fetch(`${baseFetchUrl}/user/username`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ username, id: userAuthenticated._id })
            })
            const data = await response.json();
            if (response.ok) {
                setValue(data.username)
            }
            setModal()
        } catch (error) {
            setModal()
            setMessage("Erreur lors de la modification de votre nom d'utilisateur")
        }
    };

    const handleSubmitForgotPassword = async(e) =>{
        setErrorMessage('')
        if(!mail || !mail.includes('@')){
            return setErrorMessage("l'adresse mail renseignée est invalide")
        }
        
        const response = await fetch(`${baseFetchUrl}/user/forgot_password`,{
            method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({mail})
        })
        if(!response.ok){
            setErrorMessage("Nous avons rencontré un problème lors du traitement. Merci de réessayer ultérieurement.")
        }
        else{
            setMessage('Un message de réinitialisation de mot de passe va bientôt arriver sur votre boîte mail.')
            setModal()
        }
    }

    // const handleDeleteMessage = () =>{
    //     setValue('Continue');
    //     setModal()
    // }

    //username, utiliser valeur modal pour modifier rendu

    if (modal === "setUsername") {
        return (
            <div className={`${styles.hideOnTop} ${modal && styles.modal}`}>
                <img src="/assets/logoMessange320.png" alt="logo de l'application" />
                <div>
                    <p>
                        Oups, il semblerait que tu n'aies pas encore de pseudo. <br />
                        Choisis en un maintenant !
                    </p>
                    {!chooseUsername ?
                        <button className={styles.btn} type="button" onClick={() => handleChooseUsername()}>Choisir mon pseudo</button>
                        :
                        <div className={styles.usernameInput}>
                            <input type='text' name="username" value={username} onInput={(e) => setUsername(e.target.value)} />
                            <span className="material-symbols-outlined" onClick={() => handleSubmitUsername()}>
                                check_circle
                            </span>
                        </div>
                    }
                    <div className={styles.errorMessage}>{errorMessage}</div>
                    <span onClick={() => handleCloseModal()}><small>Plus tard</small></span>
                </div>
            </div>
        );
    }
    else if (modal === "changeUsername") {
        return (
            <div className={`${styles.hideOnTop} ${modal && styles.modal}`}>
                <img src="/assets/logoMessange320.png" alt="logo de l'application" />
                <div>
                    <div className={styles.usernameInputChange}>
                        <label htmlFor='username'>Choisis ton nouveau pseudo</label>
                        <input id="username" type='text' name="username" value={username} onInput={(e) => setUsername(e.target.value)} />
                        <span className="material-symbols-outlined" onClick={() => handleSubmitUsername()}>
                            check_circle
                        </span>
                    </div>
                    <div className={styles.errorMessage}>{errorMessage}</div>
                    <span onClick={() => handleCloseModal()}><small>Plus tard</small></span>
                </div>
            </div>
        )
    }
    else if (modal === "forgotPassword") {
        return (
            <div className={`${styles.hideOnTop} ${modal && styles.modal}`}>
                <img src="/assets/logoMessange320.png" alt="logo de l'application" />
                <div>
                    <div className={styles.usernameInputChange}>
                        <label htmlFor='username'>Nous avons besoin de ton adresse email afin de t'envoyer un message de réinitialisation de mot de passe</label>
                        <input id="username" type='mail' name="username" value={mail} onInput={(e) => setMail(e.target.value)} />
                        <span className="material-symbols-outlined" onClick={(e) => handleSubmitForgotPassword(e)}>
                            check_circle
                        </span>
                    </div>
                    <div className={styles.errorMessage}>{errorMessage}</div>
                    <span onClick={() => handleCloseModal()}><small>Annuler</small></span>
                </div>
            </div>
        )
    }
    // else if(modal === "deleteMessage"){
    //     return (
    //         <div className={`${styles.hideOnTop} ${modal && styles.modal}`}>
    //             <img src="/assets/logoMessange320.png" alt="logo de l'application" />
    //             <div>
    //                 <p>
    //                     Vous allez supprimer un message, <br />
    //                     Continuer ?
    //                 </p>
    //                 <div>
    //                     <button className={styles.btn} type="button" onClick={() => handleDeleteMessage()}>Confirmer</button>
    //                     <button className={styles.btn} type="button" onClick={() => handleCloseModal()}>Annuler</button>
    //                 </div>  
    //                 <span onClick={() => handleCloseModal()}><small>Retour</small></span>
    //             </div>
    //         </div>
    //     );
    // }
}