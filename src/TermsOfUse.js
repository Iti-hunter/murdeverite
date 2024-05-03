import React from 'react';
import { Link } from 'react-router-dom';
import './TermsOfUse.css';


function TermsOfUse() {
  return (
    <div className="terms-of-use">
      <Link to="/" className="home-link">Mur de vérités</Link>
      <h1>Conditions d'Utilisation</h1>
      <p>Veuillez lire attentivement ces conditions d'utilisation avant d'utiliser notre site...</p>
      
      <section>
        <h2>Conduite des Utilisateurs</h2>
        <p>
          En accédant au site "Mur de vérités", vous vous engagez à respecter les règles suivantes :
        </p>
        <ul>
          <li>Ne publiez pas de contenu illégal, diffamatoire, abusif, harcelant, haineux, raciste, sexiste, discriminatoire ou menaçant envers quiconque.</li>
          <li>Respectez la vie privée des autres et ne divulgez pas d'informations personnelles sans consentement.</li>
          <li>Évitez de publier des contenus faux, trompeurs ou qui induisent en erreur.</li>
          <li>N'usurpez pas l'identité d'autres personnes ou entités.</li>
          <li>Ne vous engagez pas dans des activités frauduleuses ou des pratiques de spam.</li>
          <li>Ne publiez pas de contenu contenant des virus informatiques ou tout autre code malveillant conçu pour interrompre, détruire ou limiter la fonctionnalité de tout logiciel, matériel ou équipements de télécommunication.</li>
          <li>N'incitez pas à la violence ou à la commission d'actes illégaux.</li>
        </ul>
        <p>
          Le non-respect de ces règles peut entraîner une suppression de contenu, une suspension ou une interdiction définitive d'utilisation du site.
        </p>
      </section>

      <section>
        <h2>Responsabilité du Contenu</h2>
        <p>
          "Mur de vérités" est une plateforme qui permet la publication anonyme. Cependant, l'anonymat ne vous exempte pas de responsabilité. Vous êtes responsable du contenu que vous publiez. Les opinions et les messages publiés par les utilisateurs n'engagent que leurs auteurs et ne reflètent pas nécessairement les opinions de "Mur de vérités" ou de ses affiliés.
        </p>
      </section>

      <section>
        <h2>Modification des Conditions</h2>
        <p>
          "Mur de vérités" se réserve le droit de modifier les présentes conditions à tout moment. Les changements prendront effet immédiatement après leur publication sur le site. En continuant à utiliser le site après ces changements, vous acceptez les conditions révisées.
        </p>
      </section>

      {/* Incluez d'autres sections selon vos besoins. */}
    </div>
  );
}

export default TermsOfUse;
