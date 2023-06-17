# Messange
A project realize for a session exam </br>
  objective: discover MERN stack, non relationnal database, MVC, API REST, socket.io

<h3>front:</h3>
<ul>
  <li>create folder config </li>
  <li> create file env.js: </li>
</ul>
<pre>
  <code>
    const config = process.env.NODE_ENV === "development" ?
      {
        baseFetchUrl: "",
        socketUrl: ""
      }
    :
      {
        baseFetchUrl: "",
        socketUrl: ""
      }
    ;
    export default config;
  </code>
</pre>
      
<h3>back:</h3>
  file .env:
  <pre>
    <code>
      MONGODB_URI = "" </br>
      COOKIE_SECRET_KEY = ""
      JWT_SECRET_KEY = ""
      PORT_SOCKET = 0000
      TOKEN_SECRET = ""
      NODEMAILER_PORT = 0000
      NODEMAILER_USER = ""
      NODEMAILER_PASSWORD = ""
    </code>
  </pre>
