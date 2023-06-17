const checkUserUsername = async(user) =>{
    while (!user) {
        await new Promise((resolve) => setTimeout(resolve, 1500))       //wait the time userEffect of UserData fetch user
    }
    if (!user.username) {                                           //after the time, if no user connected
        setMessage("Vous ne pouvez accéder à cette page sans avoir défini un pseudo pour votre profil");
        return navigate('/home')
    }
};

export default checkUserUsername;