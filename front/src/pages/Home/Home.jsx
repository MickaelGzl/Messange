import { useContext, useEffect, useState } from 'react';
import Profile from '../../components/Profile/Profile';
import styles from './home.module.css';
import MessageList from '../../components/MessageList/MessageList';
import config from "../../../config/env";
import { ModalData } from "../../context/ModalContext";
import { MessageData } from "../../context/MessageContext";
import { useNavigate, useParams } from 'react-router-dom';
import { UserData } from '../../context/UserContext';

function Home() {

  const { id } = useParams();
  const navigate = useNavigate();
  const { baseFetchUrl } = config;

  const { modal, setModal } = useContext(ModalData);
  const { value, setValue } = useContext(ModalData);
  const { message, setMessage } = useContext(MessageData);
  const { userAuthenticated, setUserAuthenticated } = useContext(UserData);   //contain the user authenticated

  const [userMessages, setUserMessages] = useState([]);
  const [user, setUser] = useState();                                       //this is user send by Back
  const [display, setDisplay] = useState(true);
  const [token, setToken] = useState('');

  useEffect(() => {
    console.log('home 27 je fetch user & message')
    const initializeDatas = async () => {
      //the logged user is redirected here, to his own profile page.
      //we need to fetch his informations and the message he or the users he follow wrote.
      //in the same time, we set in the cookie a csrf token, we will need it to valide the operations the user will make.
      try {
        const [userResponse, tokenResponse] = await Promise.all([
          fetch(`${baseFetchUrl}/message/${id || ''}`, {
            credentials: 'include'        //need this to send cookies, now back can watch if we have jwt cookie
          }),
          fetch(`${baseFetchUrl}/auth/csrf-token`, {
            credentials: 'include'
          })
        ])

        if(userResponse.status === 404){
          return navigate('/notFound')
        }

        if (!userResponse.ok && userResponse.status !== 503 || !tokenResponse.ok) {
          setUserAuthenticated();
          navigate('/signin');
          return setMessage('Le serveur rencontre actuellement une erreur. Merci de réessayer plus tard');
        }

        const [userData, tokenData] = await Promise.all([
          userResponse.json(),
          tokenResponse.json()
        ])

        setToken(tokenData.token)

        if (!userData.auth) {         //contain the authenticated user. If nothing found redirect to the signin form
          setUserAuthenticated();
          navigate('/signin');
          return setMessage("Vous devez être connecté pour accéder à cette page");
        }

        setUser(userData.user);
        setUserMessages(userData.messages);
        if (id === userData.auth.id && !userData.auth.username) {   //if user come to his page, and haven't username, ask him to set one
          setTimeout(() => {
            setModal("setUsername")
          }, 1000)
        }
        
      } catch (error) {
        setUserAuthenticated();
        setMessage("Erreur serveur");
        navigate('/signin');
      }

    }
    initializeDatas()
  }, [id])          //actualize page when id change, to render a new display based on the user's id informations

  useEffect(() => {
    if (user) {   //only if user exist, cause to send an user with only username null to profile so the modal pop for change it
      setUser({ ...user, username: value || user.username })
    }
    if (userAuthenticated) {
      setUserAuthenticated({ ...userAuthenticated, username: value || userAuthenticated.username })
    }
    // console.log("l'user du profil:", user)
    // console.log("l'user authenticated:", userAuthenticated)
    // console.log("les messages:", userMessages)
  }, [value])

  const handleDisplayProfile = () => {
    setDisplay(!display)        //true = "flex", false = "none". For messages, if profile is hidden, message take all width, else 1fr 2fr
  }

  return (
    <>
      <div className={styles.home}>
        {userAuthenticated &&
          <>
            <span className={styles.displayProfil} onClick={handleDisplayProfile}>{display ? "Masquer le profil" : "Afficher le profil"}</span>
            < Profile
              user={user}                             //the user for the profile
              setUser={setUser}
              userAuthenticated={userAuthenticated}   //the user actually connected
              display={display}                       //hide or not profile (when max width screen is < 768px)
              modal={modal}
              setModal={setModal}
              userMessages={userMessages}
            />
          </>
        }
        <div className={styles.messagesList}>
          {userMessages &&
            <MessageList userMessages={userMessages} display={!display} token={token} />
          }
        </div>
      </div>
    </>
  )
}

export default Home


/*                                                                                                
recherche anglais: multer send info error, token csrf
*/


/*
le 10mai
reste editer messages, supprimer fichier quand supprimer message                        6h    //2h    reste modifier image  4h
commenter messages, voir nombre de commentaires                                         20h   //OK
style affichage recherche utilisateur mobile                                            4h    //OK
style affichage onglets navbar sur mobile                                               4h    //OK
style profil crée le tout en bas de la div profil                                       2h    //0h10  OK
navbar hide onglet de recherche quand change de page                                    2h
s'abonner, se désabonner à un utilisateur et voir ses messages sur son propre mur       6h    //1h30  OK
faire un email de reset de password                                                     20h   //6h    OK
proteger les routes avec req.isAuthenticated                                            10h   //1h    OK
supprimer comm et console.log inutiles                                                  2h
créer une route 404 coté front                                                          2h    //0h10  OK
                                                                                      78h, reste 42h, fait 36h en 6h50
réaliser un test unitaire                                                               10h   //OK
mettre des tags à des messages, et rechercher par tags                                  12h
créer une description utilisateur, possibilité modifier, avec default description       12h
                                                                                      34h
                                                                                    112h, reste 78h
14:         9h
15+16+17:   10h   19
18          9h    28
19          3h    31
20+21:      18h   49
22+23+24    10h   59
25+26       6h    65  //fini ici
27+28       18h   83  
29          9     92
30+31       8     100

+dossier pro 12p + dossier perso 35p + presentation canvas 45min + maquette + mcd/mld
*/
