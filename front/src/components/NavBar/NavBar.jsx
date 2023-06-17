import { useContext, useState } from 'react';
import { Link } from "react-router-dom";
import styles from './navBar.module.css';
import Logo from '../Logo/Logo';
import { UserData } from '../../context/UserContext';
import config from '../../../config/env';
import { MessageData } from '../../context/MessageContext';


function NavBar() {

    const { baseFetchUrl } = config;

    const { userAuthenticated } = useContext(UserData)
    const { message, setMessage } = useContext(MessageData)

    const [checked, setChecked] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [timeOut, setTimeOut] = useState();
    const [correspondingUsers, setCorrespondingUsers] = useState([]);

    const handleCheck = () => {
        setChecked(!checked)
        console.log(`je suis actuellement ${!checked}`)
    }

    const handleSearchInput = (e) => {
        if (timeOut) {                    //if a timeout is present, delete it
            clearTimeout(timeOut)
        }

        const value = e.target.value.replace("/", "");
        console.log(value)
        setSearchValue(value); //just prevent / for now, let back suppress other characters

        setTimeOut(                     //when an user stop writing for 1sec, ask back for ressource (prevent for abusive requests)
            setTimeout(() => {
                if (value) {
                    fetch(`${baseFetchUrl}/user?search=${value}`)
                        .then(res => res.json())
                        .then(data => setCorrespondingUsers(data.users))
                        .catch(err => setMessage('Impossible de rechercher un utilisateur pour le moment.'))
                }
                else if (!value && correspondingUsers.length > 1) {
                    setCorrespondingUsers([])
                }
            }, 1000)
        )
    }

    const handleClickOnUser = () =>{
        setSearchValue('');
        setCorrespondingUsers([])
    }

    return (
        <>
            <nav className={styles.navbar}>
                {userAuthenticated ?
                    <Link to="/home" className={styles.navLinkLogo}>
                        <Logo onNav={true} />
                    </Link>
                    :
                    <Link to="/" className={styles.navLinkLogo}>
                        <Logo onNav={true} />
                    </Link>
                }
                <div className={styles.navbarContent}>
                    <div className={styles.navMobile}>
                        <input id="menu-toggle" className={styles.menuToggle} type="checkbox" checked={checked} onChange={handleCheck} />
                        <label className={styles.menuButtonContainer} htmlFor="menu-toggle">
                            <div className={styles.menuButton}></div>
                        </label>

                        <div className={styles.popNavMobile}>
                            <div>
                                <input
                                    type="text"
                                    name="searchUser"
                                    className={styles.searchInput}
                                    placeholder='Rechercher...'
                                    value={searchValue}
                                    onInput={(e) => handleSearchInput(e)}
                                />
                                {correspondingUsers.length > 0 &&
                                    <ul className={styles.userList}>
                                        {correspondingUsers.map(user => (
                                            <li key={user._id} onClick={() => handleClickOnUser()}>
                                                <Link to={`/home/${user._id}`} className={styles.linkToUser} >
                                                    <img src={`/assets/profile/${user.avatar}`} alt="user avatar" />
                                                    <span>{user.username}</span>
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                }
                            </div>

                            <ul className={styles.navMobileListItem}>
                                <li><Link to="/discovery" onClick={handleCheck}>Découverte</Link></li>
                                {userAuthenticated ?
                                    <>
                                        <li><Link to="/message/new" onClick={handleCheck}>Ecrire un message</Link></li>
                                        <li><Link to="/signout" onClick={handleCheck}>Se déconnecter</Link></li>
                                    </>
                                    :
                                    <>
                                        <li><Link to="/signup" onClick={handleCheck}>Inscription</Link></li>
                                        <li><Link to="/signin" onClick={handleCheck}>Connection</Link></li>
                                    </>
                                }
                            </ul>

                        </div>
                    </div>

                    <ul className={styles.navDesktop}>
                        <li>
                            <input
                                type="text"
                                name="searchUser"
                                className={styles.searchInput}
                                placeholder='Rechercher...'
                                value={searchValue}
                                onInput={(e) => handleSearchInput(e)}
                            />
                        </li>
                        <li><Link to="/discovery">Découverte</Link></li>
                        {userAuthenticated ?
                            <>
                                <li><Link to="/message/new">Ecrire un message</Link></li>
                                <li><Link to="/signout">Se déconnecter</Link></li>
                            </>
                            :
                            <>
                                <li><Link to="/signup">Inscription</Link></li>
                                <li><Link to="/signin">Connection</Link></li>
                            </>
                        }

                    </ul>
                </div>
            </nav>

            {correspondingUsers.length > 0 &&
                <ul className={`${styles.userList} ${styles.listDesktop}`}>
                    {correspondingUsers.map(user => (
                        <li key={user._id} onClick={() => handleClickOnUser()}>
                            <Link to={`/home/${user._id}`} className={styles.linkToUser}>
                                <img src={`/assets/profile/${user.avatar}`} alt="user avatar" />
                                <span>{user.username}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            }
        </>
    )
}

export default NavBar
