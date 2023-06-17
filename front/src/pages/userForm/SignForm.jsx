import { Link, useNavigate } from "react-router-dom";
import { MessageData } from "../../context/MessageContext";
import { UserData } from "../../context/UserContext";
import { useContext, useEffect, useState } from "react";
import Logo from "../../components/Logo/Logo";
import styles from "./signForm.module.css";
import config from "../../../config/env";
import { ModalData } from "../../context/ModalContext";

export default function SignForm(props) {

    const { baseFetchUrl } = config;

    const navigate = useNavigate()
    const {message, setMessage} = useContext(MessageData);
    const {modal, setModal} = useContext(ModalData);
    const {userAuthenticated, setUserAuthenticated} = useContext(UserData);

    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [visibility, setVisibility] = useState(false);
    const [user, setUser] = useState({
        email: '',
        password: ''
    });

    useEffect(()=>{         //reset email and password errors if user change page (inscription to connection / reverse), but keep input entries
        if(userAuthenticated){
            return navigate('/home')
        }
        setPasswordError('')
        setEmailError('')
    }, [props.for]);

    // if(userAuthenticated){
    //     return navigate('/home')
    // };


    const handleInput = (e) =>{
        setUser({...user, [e.target.name]: e.target.value })
    };

    const handleChangeVisibility = () =>{
        setVisibility(!visibility)
    };

    const handleSubmit = async(e) =>{
        e.preventDefault()
        if(props.for === "S'inscrire"){
            console.log('User:', user)
            if(user.password.length < 8){
                return setPasswordError('Votre mot de passe doit faire 8 caractères au minimum');
            }
            else if(!/[a-z]/.test(user.password)){
                return setPasswordError('Votre mot de passe doit contenir au moins une minuscule')
            }
            else if(!/[A-Z]/.test(user.password)){
                return setPasswordError('Votre mot de passe doit contenir au moins une majuscule')
            }
            else if(!/[\d]/.test(user.password)){
                return setPasswordError('Votre mot de passe doit contenir au moins un caractère numérique')
            }
            else if(!/[^a-zA-Z\d\s]/.test(user.password)){
                return setPasswordError('Votre mot de passe doit contenir au moins un caractère non alphanumérique')
            }
            else{
                setPasswordError('')
            }
            //no error with password, so try to sign user
                            console.log('form 62 fetch inscription')
            const response = await fetch(`${baseFetchUrl}/user/inscription`,{  
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({...user})
            })
            const data = await response.json();
            console.log(data)
            if(data.underInput){
                return setEmailError(data.message)
            }
            setMessage(data.message)
        }
        if(passwordError === "" && emailError === ""){      //if we used .then before, if the user have an email already use and a good password, the code continue here the first time
                        console.log('form 78 fetch connection')
            const response = await fetch(`${baseFetchUrl}/user/connection`,{
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({...user})
            })
            const data = await response.json()
            console.log(data)
            if(response.ok){
                setUserAuthenticated(data.user)      //say to our app an user is connected
                setMessage(data.message)
                return navigate('/home')
            }
            setMessage(data.message)
        }
    };

    const handleForgotPassword = () =>{
        setModal('forgotPassword')
    };

    return (
        <div className={styles.container}>
            <Logo />
            <form className={styles.form} onSubmit={(e) => handleSubmit(e)}>
                <div>
                    <input
                        id="email"
                        type="email"
                        name="email"
                        value={user.email}
                        placeholder=" "
                        autoComplete="new-Email"
                        required
                        onInput={(e) => handleInput(e)}
                    />
                    <label htmlFor="email">Email</label>
                    <div className={styles.errorMessage}>{emailError}</div>
                </div>
                <div>
                    <input
                        id="password"
                        type={visibility ? 'text' : 'password'}
                        name="password"
                        value={user.password}
                        placeholder=" "
                        autoComplete="new-Password"
                        required
                        onInput={(e) => handleInput(e)}
                    />
                    <label htmlFor="password">Mot de passe</label>
                    <button type="button" onClick={handleChangeVisibility} className={styles.visibilityBtn}>
                        {visibility?
                            <span className="material-symbols-outlined" style={{color:'#808080'}}>
                                visibility_off
                            </span>
                            :
                            <span className="material-symbols-outlined" style={{color:'#808080'}}>
                                visibility
                            </span>
                        }
                    </button>
                    <div className={styles.errorMessage}>{passwordError}</div>
                </div>
                <div className={styles.buttonWrapper}>
                    <button className={styles.btn} type="submit">
                        {props.for}
                    </button>
                </div>
            </form>
            {props.for === "S'inscrire" &&
                <small>
                    Déjà un compte ? 
                    <Link to="/signin" className={styles.redirectSignIn}> Se connecter</Link>
                </small>
            }
            {props.for === "Se connecter" &&
                <small>
                    <Link to="/signin" className={styles.redirectSignIn} onClick={() => handleForgotPassword()}>À l'aide, j'ai oublié mon mot de passe!</Link>
                </small>
            }
        </div>
    );
}
