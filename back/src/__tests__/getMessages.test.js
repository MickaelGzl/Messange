/* Test for the function that is getting the messages
first, we need to be sure an user is authenticated, to have a profile or visit other users profile
then, we have to get the id in req.params and verify that an user is corresponding to this id
if we have an user, we have to compare the id we get in params and the id of the user authenticated
If they are the same, the user is going to his profile. He will see his own messages, 
    and also the messages of all the users he follow
Else, the user going to visit a profile. So he will see only the message of the user's profile.
     Useless for him to see the messages of the people the user follow.
*/

const { getUserandFollowingsMessages } = require("../controller/messageController");
const { User, Message } = require("../db/models");

jest.mock('../db/models')

//first create the request and the response the function need for work
//request will need an id in params, a function isAuthenticated and an user

const res = {
    status: jest.fn(function (x) {
        x;
        return this
    }),
    json: jest.fn()
}

test('should sent a status 401 unauthorized cause no user is authenticated', () => {
    const req = {
        isAuthenticated: () => !!req.user,
        params: { id: 2 }
    }
    getUserandFollowingsMessages(req, res, undefined);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledTimes(1);
})

test('should sent a status 404 cause no user corresponding to id in params', async() => {
    const req = {
        user: { id: 1, username: 'Toto', local: { mail: 'mail', password: 'hash' } },
        isAuthenticated: () => !!req.user,
        params: { id: 2 }
    }
    User.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(undefined)
    });
    await getUserandFollowingsMessages(req, res, undefined);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledTimes(1);
})

test('should send messages and status 200 cause all condition is fulfill', async()=> {
    const req = {
        user: { id: 1, username: 'Toto', local: { mail: 'mail', password: 'hash' } },
        isAuthenticated: () => !!req.user,
        params: { id: 1 }
    }
    User.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ id: 1, username: 'Toto', local: { mail: 'mail', password: 'hash' } })
    });
    Message.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(['message', 'message2', 'message3'])
    })
    await getUserandFollowingsMessages(req, res, undefined);
    expect(res.status).not.toHaveBeenCalled();              
    expect(res.json).toHaveBeenCalledTimes(1);      
    //req.status isn't called, cause default status in express is 200
    //like other test, we want res.json only called 1time, so don't satisfy other conditions that called res      
})



