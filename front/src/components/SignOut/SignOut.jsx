import { useContext, useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import styles from './signOut.module.css';
import { MessageData } from '../../context/MessageContext';
import { UserData } from '../../context/UserContext';
import config from "../../../config/env";


function SignOut() {

    const navigate = useNavigate();

    const { baseFetchUrl } = config;

    const {userAuthenticated, setUserAuthenticated} = useContext(UserData)
    const {message, setMessage} = useContext(MessageData)

    useEffect(() =>{
                console.log('signout 19 fetch logout')
        fetch(`${baseFetchUrl}/user/disconnection`,{
            credentials: "include"
        })
        .then(res => res.json())
        .then(data =>{
            setMessage(data.message)
        })
        .catch(err =>{
            setMessage('Erreur lors de la déconnexion de votre compte.')
        })
        setUserAuthenticated()
        navigate('/')
    },[])

    return (
        <div className={styles.disconnect}>
            Déconnection en cours...
        </div>
    )
}

export default SignOut;
