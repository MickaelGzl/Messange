import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom';
import './main.css';
import MessageContext from './context/MessageContext'
import ModalContext from './context/ModalContext';
import Toast from './components/Toast/Toast'
import App from './pages/App/App';
import Home from './pages/Home/Home';
import SignForm from './pages/userForm/SignForm';
import NavBar from './components/NavBar/NavBar';
import Modal from './components/Modal/Modal';
import UserContext from './context/UserContext';
import SignOut from './components/SignOut/SignOut';
import CreateMessage from './pages/CreateMessage/CreateMessage';
import Page404 from './pages/Page404/Page404';
import PasswordReset from './pages/passwordReset/PasswordReset';
import MessageView from './pages/MessageView/MessageView';
import ChatComments from './pages/Chat-Comment/Chat-Comments';

import ZZ from './pages/ZZZ/ZZ';
import { QueryClient, QueryClientProvider } from 'react-query';


const queryClient = new QueryClient();


const AppLayout = () => (
  <>
    <NavBar />
    <Outlet />
  </>
)

const signUp = "S'inscrire";
const signIn = "Se connecter";

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        path: '/',
        element: <App />
      },
      {
        path: '/home',
        element: <Home />
      },
      {
        path: '/home/:id',
        element: <Home />
      },
      {
        path: '/message/new',
        element: <CreateMessage />
      },
      {
        path: '/message/:id',
        element: <ChatComments />
      },
      {
        path: '/signin',
        element: <SignForm for={signIn} />
      },
      {
        path: '/signup',
        element: <SignForm for={signUp} />
      },
      {
        path: '/signout',
        element: <SignOut />
      },
      {
        path: '/user/reset-password/:userId/:token/:serverToken',
        element: <PasswordReset />
      },
      {
        path: '/test',
        element: <ZZ />
      },
      {
        path: '*',
        element: <Page404 />
      }

    ]
  }
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <UserContext>
        <ModalContext>
          <MessageContext>
            <Modal />
            <RouterProvider router={router} />
            <Toast />
          </MessageContext>
        </ModalContext>
      </UserContext>
    </QueryClientProvider>
  </React.StrictMode>,
)