import { createContext, useEffect, useState } from "react";
import config from "../../config/env";
import { useNavigate } from "react-router-dom";

export const UserData = createContext(null);

function UserContext({ children }) {
    const [userAuthenticated, setUserAuthenticated] = useState();

    const { baseFetchUrl } = config;

    useEffect(() => {
        if (userAuthenticated) {
            return;
        }
        console.log('userContext 12 fetch authenticated')
        const verifyIfUserIsAuthenticate = async () => {
            const response = await fetch(`${baseFetchUrl}/user/isauthenticated`, {
                credentials: 'include'
            });
            const data = await response.json();
            if (data.isAuthenticated) {
                setUserAuthenticated(data.user)
                const local = window.location;
                if (window.location.href === `${local.protocol}//${local.host}/`) {
                    window.location.replace(`${local.protocol}//${local.host}/home`)
                }
            }
        }
        verifyIfUserIsAuthenticate()
    }, [setUserAuthenticated])           //when we render the page, just fetch if the user is connected or not

    return (
        <UserData.Provider value={{ userAuthenticated, setUserAuthenticated }}>
            {children}
        </UserData.Provider>
    )
}

export default UserContext

//store the connected user into a context