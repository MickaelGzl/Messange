//To be sure every user that register have a unique email, we can test our function that create an User with the received form
//we need to test: an user try to sign up with an email an user already using / an new email, we have to save it with a hashed password
const { userCreate, userLogIn } = require("../controller/userController");
const { User } = require("../db/models");

jest.mock('../db/models')           //use to mock the module for test,to control the value and not ask really the bdd

const request = {                   //the funciton we test need as arguments request and response. So create them
    body: {
        email: 'userMail',
        password: 'userPassword'
    },
    login: jest.fn(x => x)
}

const response = {
    status: jest.fn(function (x) {
        x;
        return this
    }),
    json: jest.fn()
}

test('should send a status 400 if email already exist', async () => {
    //with mongoose, when we call User.findOne, we call the method exec() to return a promise
    //here we want that exec return a resolve promise with a defined value.
    User.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ id: 1, email: 'userMail', password: 'password' })
    });
    await userCreate(request, response);
    expect(response.status).toHaveBeenCalledWith(400);          //an user already exist with this email. So we want to receive a http status 400
    expect(response.json).toHaveBeenCalledTimes(1);             //we also want that the response only be call 1 time
})

test('should send a status 200 and correctly hash password if email is unique, then clear user.local', async () => {
    //we can continue testing the function to see if everything is correct when create the user
    //so here we want to return undefined, like no user is registered with this email yet.
    User.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(undefined)
    });
    User.hashPassword.mockReturnValueOnce('hash')                           //simulate hashPassword to take the password and return hash
    const expectedUser = { local: { email: 'userMail', password: 'hash' } };  //the registered user should be equal to this

    const mockUserConstructor = jest.fn();              //use a mocked function when we call the constructor of User
    User.mockImplementation(mockUserConstructor);

    await userCreate(request, response);

    expect(User.hashPassword).toHaveBeenCalledWith('userPassword');     //the function hashPassword have to be called with the initial password
    expect(mockUserConstructor).toHaveBeenCalledWith(expectedUser);     //and the user registered have to be equal to the value declared earlier, with the password return by hashPassword


    User.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({_doc: {...expectedUser}, comparePasswords: jest.fn().mockResolvedValue(true)})
    });

    const findUserByMail = jest.fn().mockResolvedValue({
        _doc: { ...expectedUser }, // Simule _doc property avec with our user
    });

    const res = await userLogIn(request, response)

    expect(response.status).not.toHaveBeenCalled()
    expect(response.json).toHaveBeenCalledWith({
        message: "Bonjour, ",
        user: expect.objectContaining({ local: {} })
    });
})