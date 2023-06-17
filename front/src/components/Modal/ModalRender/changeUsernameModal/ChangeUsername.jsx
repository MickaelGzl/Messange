import styles from './changeUsername.module.css'

export function ChangeUsernameModal(){

    return (
        <div className={`${styles.hideOnTop} ${modal && styles.modal }`}>
            <img src="/assets/cannab.jpg" alt="oiseau triste" />
            <div>
                <div className={styles.usernameInput}>
                    <label htmlFor='username'>Choisis ton nouveau pseudo</label>
                    <input id="username" type='text' name="username" value={username} onInput={(e) => setUsername(e.target.value)} />
                    <span className="material-symbols-outlined" onClick={()=>handleSubmitUsername()}>
                        check_circle
                    </span>
                </div>
                <span onClick={() => handleCloseModal()}><small>Plus tard</small></span>
            </div>
        </div>
    )
}