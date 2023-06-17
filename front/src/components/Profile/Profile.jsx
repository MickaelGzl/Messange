import { useContext, useEffect, useRef, useState } from 'react';
import styles from './profile.module.css';
import { ModalData } from '../../context/ModalContext';
import FormData from 'form-data';
import config from '../../../config/env';
import Resizer from 'react-image-file-resizer';


function Profile(props) {

    const resizeFile = (file) => {          //to resize the image the user set to avatar
        return new Promise((resolve) => {
            Resizer.imageFileResizer(
                file,       //name of file
                320,        //max width
                320,        //max height
                "JPEG",     //less data than png
                100,        //quality
                0,          //rotation
                (uri) => {
                    console.log('l uri:', uri)
                    resolve(uri);
                },
                "file"        //output type
            );
        })
    }

    const { baseFetchUrl } = config;

    const { user, setUser, userAuthenticated, display, modal, setModal, userMessages } = props;
    const inputAvatar = useRef();

    const [followings, setFollowings] = useState(userAuthenticated.followings)      //store id of followed user into a state to update the render directly
    const [usersthatFollowThisOne, setUsersThatFollowThisOne] = useState(0)

    const ownMessages = userMessages.filter(message => message.author._id === user._id)

    useEffect(() => {     //know how many user follow this one
        setUsersThatFollowThisOne(0)

        fetch(`${baseFetchUrl}/user`)
            .then(res => res.json())
            .then(data => {
                if(user){
                    const numberOfUsersThanFollow = data.users.filter(account => account.followings.includes(user._id))
                    setUsersThatFollowThisOne(numberOfUsersThanFollow.length)
                }
            })
    }, [user])

    // console.log("l'user du profil", user)
    // console.log("l'auth", userAuthenticated)

    const handleAvatarChange = () => {
        if (user._id === userAuthenticated._id) {
            inputAvatar.current.click()
        }
    }

    const handleChangeAvatar = async () => {
        if (user._id === userAuthenticated._id) {
            const image = inputAvatar.current.files[0]
            if (!image) {
                return;
            }
            const avatar = await resizeFile(image);

            const formData = new FormData();
            formData.append('avatar', avatar);
            fetch(`${baseFetchUrl}/user/avatar`, {
                method: 'PUT',
                body: formData,
                credentials: 'include'
            })
                .then(res => res.json())
                .then(data => setUser({ ...user, avatar: data.filename }))        //update the user avatar with his new image
        }
    }

    const handleUsername = () => {
        if (user._id === userAuthenticated._id) {
            setModal('changeUsername')
        }
    }

    const handleFollowUser = (value) => {

        fetch(`${baseFetchUrl}/user/followings`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId: user._id, value }),
            credentials: 'include'
        })
            .then(res => res.json())
            .then(data => {
                if (value === 'follow') {
                    if (!followings.includes(user._id)) {
                        setFollowings([...followings, user._id])                //update the list of followings and the display button
                        setUsersThatFollowThisOne(usersthatFollowThisOne + 1)       //update the number of users that follow this profile for the moment
                    }
                }
                else if (value === "unfollow") {
                    setFollowings(followings.filter(followid => followid !== user._id))
                    setUsersThatFollowThisOne(usersthatFollowThisOne - 1)
                }
            })

    }


    const createdAt = user ? user.createdAt.substring(0, 10).split('-').reverse().join('-') : null

    return (
        <>
            {user &&
                <div className={display ? styles.profile : styles.maskProfile}>
                    <form encType="multipart/form-data">
                        <input
                            type="file"
                            name="avatar"
                            accept='.jpg, .jpeg, .png, .svg, .jfif'
                            className={styles.avatarInput}
                            ref={inputAvatar}
                            onChange={handleChangeAvatar}
                        />
                        <img src={`/assets/profile/${user.avatar}`} alt="avatar" onClick={() => handleAvatarChange()} />
                    </form>
                    <span className={styles.pseudo} onClick={handleUsername}>{user.username || 'Invité'}
                        {user._id === userAuthenticated._id &&
                            <span className="material-symbols-outlined">
                                stylus
                            </span>
                        }
                    </span>
                    {/* <p className={styles.userDescription}>{user?.description || "Il n'y a pas de description pour le moment."}</p> */}
                    <div className={styles.info}>
                        <div>
                            <span>Messages</span>
                            <hr />
                            <span>{ownMessages.length}</span>
                        </div>
                        <div>
                            <span>Followings</span>
                            <hr />
                            <span>{user.followings.length}</span>
                        </div>
                        <div>
                            <span>Followers</span>
                            <hr />
                            <span>{usersthatFollowThisOne}</span>
                        </div>
                    </div>
                    {user._id !== userAuthenticated._id &&
                        <div>
                            {followings.includes(user._id) ?
                                <button type='button' className={`${styles.removeOf} ${styles.follow}`} onClick={() => handleFollowUser('unfollow')}>Ne plus suivre</button>
                                :
                                <button type='button' className={`${styles.addTo} ${styles.follow}`} onClick={() => handleFollowUser('follow')}>Suivre</button>
                            }
                        </div>
                    }
                    <span className={styles.createdAt}>Pofil crée le {createdAt}</span>
                </div>
            }
        </>
    )
}

export default Profile


