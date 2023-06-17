import { createContext, useState } from "react";

export const ModalData = createContext(null);     

function ModalContext({children}){
    const [modal, setModal] = useState();
    const [value, setValue] = useState();

    return(
        <ModalData.Provider value={{modal, setModal, value, setValue}}>        
            {children}
        </ModalData.Provider>
    )
}

export default ModalContext;

//Here we create a context for create a pop up modal that will be present on all the app
//same as messageContext