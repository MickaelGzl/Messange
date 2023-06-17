import styles from "./toast.module.css";
import { MessageData } from "../../context/MessageContext";
import { useContext } from "react";

export default function Toast() {

    const {message, setMessage} = useContext(MessageData)       //use our context for the messages

    if(message != undefined){                                   //create a function that clear the message 3s after receive it
        setTimeout(()=>{setMessage()}, 3000)
    }

    return (
        <>
            {message != undefined &&
                <div className={styles.toast}>
                    <div>
                        {message}
                    </div>
                </div>
            }
        </>
    );
}