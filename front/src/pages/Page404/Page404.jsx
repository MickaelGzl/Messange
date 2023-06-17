import Logo from '../../components/Logo/Logo';
import styles from './page404.module.css'

function Page404(){
    return (
        <div className={styles.container}>
            <Logo />
            <h3>
                Oups, vous avez atterri trop loin.
            </h3>
            <p>L'adresse que vous recherchez n'existe pas.</p>       
        </div>
    );
}

export default Page404