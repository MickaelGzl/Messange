import { createContext, useState } from "react";

export const MessageData = createContext(null);     

function MessageContext({children}){
    const [message, setMessage] = useState();

    return(
        <MessageData.Provider value={{message, setMessage}}>        
            {children}
        </MessageData.Provider>
    )
}

export default MessageContext

//Here we create a context for all the message receive from our api.
//this values will be contain in a state and englobe our app as children