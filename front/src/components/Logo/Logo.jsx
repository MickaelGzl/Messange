import styles from './logo.module.css';

function Logo(props) {

    return (
        <img src="/assets/logoMessange320.png" alt="logo" className={props.onNav ? styles.logoNav : styles.logoForm} />
    )
}

export default Logo;