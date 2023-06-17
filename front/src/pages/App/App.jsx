import { Link } from 'react-router-dom'
import './App.css'

function App() {

  return (
    <div className="App">
      <div className='imageContent'>
        <img src='/assets/presentation.jpg' alt="shima enaga on a branch" className='image' />
      </div>
      <div className="textContent">
        <h1>Messange</h1>
        <p>
          Bienvenue sur notre application de messagerie dédiée aux amoureux des oiseaux ! 
          <br></br>
          Nous sommes ravis de vous présenter notre plateforme unique en son genre,
          conçue spécialement pour ceux qui souhaitent partager leur vie avec nos amis à plumes
          ou pour ceux qui souhaitent en apprendre davantage sur eux.
          <br></br>
          Avec notre application, vous pourrez échanger des messages, des photos, des vidéos et même des astuces
          avec d'autres propriétaires d'oiseaux et des experts en la matière.
          Découvrez de nouvelles espèces, partagez des histoires incroyables
          et apprenez comment prendre soin de vos oiseaux en toute sécurité.
          <br></br>
          Rejoignez notre communauté grandissante et faites partie d'une aventure passionnante ! </p>
        <Link className='callToActBtn' to="/signup">Je m'inscris</Link>
      </div>

    </div>
  )
}

export default App
