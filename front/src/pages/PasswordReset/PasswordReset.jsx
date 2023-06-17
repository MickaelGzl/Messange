import { useNavigate, useParams } from "react-router-dom";
import { MessageData } from "../../context/MessageContext";
import { UserData } from "../../context/UserContext";
import { useContext, useEffect, useState } from "react";
import Logo from "../../components/Logo/Logo";
import styles from "./passwordReset.module.css";
import config from "../../../config/env";

export default function PasswordReset() {

    const { baseFetchUrl } = config;
    const {userId, token, serverToken} = useParams();

    const navigate = useNavigate()
  
    const { message, setMessage } = useContext(MessageData);
    const { userAuthenticated, setUserAuthenticated } = useContext(UserData);

    const [passwordError, setPasswordError] = useState('');
    const [visibility, setVisibility] = useState(false);
    const [newPassword, setnewPassword] = useState('');


    if (userAuthenticated) {
        return navigate('/home')
    };

    useEffect(()=>{
        async function verifyToken(serverToken){
            console.log('launch function')
            const response =  await fetch(`${baseFetchUrl}/auth/verify-token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({serverToken})
            })
            console.log('la réponse', response)
            if(!response.ok){
                return navigate('/notFound')
            }
        }
        verifyToken(serverToken)
    })

    const handleChangeVisibility = () => {
        setVisibility(!visibility)
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (newPassword.length < 8) {
            return setPasswordError('Votre mot de passe doit faire 8 caractères au minimum');
        }
        else if (!/[a-z]/.test(newPassword)) {
            return setPasswordError('Votre mot de passe doit contenir au moins une minuscule')
        }
        else if (!/[A-Z]/.test(newPassword)) {
            return setPasswordError('Votre mot de passe doit contenir au moins une majuscule')
        }
        else if (!/[\d]/.test(newPassword)) {
            return setPasswordError('Votre mot de passe doit contenir au moins un caractère numérique')
        }
        else if (!/[^a-zA-Z\d\s]/.test(newPassword)) {
            return setPasswordError('Votre mot de passe doit contenir au moins un caractère non alphanumérique')
        }
        else {
            setPasswordError('')
        };
        //no error with password, so try to modify the password of the user with the new one
        console.log('reset 57 fetch reset password')
        const response = await fetch(`${baseFetchUrl}/user/reset-password/${userId}/${token}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({newPassword})
        })
        const data = await response.json();
        setMessage(data.message)
        navigate('/signin')
    };


    return (
        <div className={styles.container}>
            <Logo />
            <form className={styles.form} onSubmit={(e) => handleSubmit(e)}>
                <div>
                    <input
                        id="password"
                        type={visibility ? 'text' : 'password'}
                        name="password"
                        value={newPassword}
                        placeholder=" "
                        autoComplete="new-Password"
                        required
                        onInput={(e) => setnewPassword(e.target.value)}
                    />
                    <label htmlFor="password">Mot de passe</label>
                    <button type="button" onClick={handleChangeVisibility} className={styles.visibilityBtn}>
                        {visibility ?
                            <span className="material-symbols-outlined" style={{ color: '#808080' }}>
                                visibility_off
                            </span>
                            :
                            <span className="material-symbols-outlined" style={{ color: '#808080' }}>
                                visibility
                            </span>
                        }
                    </button>
                    <div className={styles.errorMessage}>{passwordError}</div>
                </div>
                <div className={styles.buttonWrapper}>
                    <button className={styles.btn} type="submit">
                        Valider
                    </button>
                </div>
            </form>
        </div>
    );
}
