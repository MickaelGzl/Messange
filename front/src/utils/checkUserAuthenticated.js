const checkUserIsAuthenticated = async(user) =>{
    while (!user) {
        await new Promise((resolve) => setTimeout(resolve, 1500))       //wait the time userEffect of UserData fetch user
    }
    if (!user) {                                           //after the time, if no user connected
        setMessage("Vous devez être connecté pour accéder à cette partie de l'application.");
        return navigate('/signin')
    }
};

export default checkUserIsAuthenticated;