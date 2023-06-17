import styles from './setUsername.module.css'

export function SetUsernameModal(){

    return (
        <div className={`${styles.hideOnTop} ${modal && styles.modal }`}>
            <img src="/assets/cannab.jpg" alt="oiseau triste" />
            <div>
                <p>
                    Oups, il semblerait que tu n'aies pas encore de pseudo. <br/>
                    Choisis en un maintenant !
                </p>
                {!chooseUsername ?
                    <button className={styles.btn} type="button" onClick={() => handleChooseUsername()}>Choisir mon pseudo</button>
                    :
                    <div className={styles.usernameInput}>
                        <input type='text' name="username" value={username} onInput={(e) => setUsername(e.target.value)} />
                        <span className="material-symbols-outlined" onClick={()=>handleSubmitUsername()}>
                            check_circle
                        </span>
                    </div>
                }
                <span onClick={() => handleCloseModal()}><small>Plus tard</small></span>
            </div>
        </div>
    )
}