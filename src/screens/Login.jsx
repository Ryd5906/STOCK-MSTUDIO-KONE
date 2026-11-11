import { useState } from 'react'
import { Field } from '../ui'
import { DEMO_EMAIL, DEMO_PASSWORD } from '../config'

export default function Login({ onEnter }) {
  const [email, setEmail] = useState(DEMO_EMAIL)
  const [password, setPassword] = useState(DEMO_PASSWORD)

  function submit(event) {
    event.preventDefault()
    onEnter()
  }

  return (
    <div className="login">
      <header className="login__head">
        <span className="logotype logotype--light">KONÉ TISSUS</span>
        <span className="monogram monogram--light" aria-hidden="true">
          MK
        </span>
      </header>

      <div className="login__intro">
        <p className="label label--light">Abidjan · Carnet de boutique</p>
        <h1 className="login__title">
          Le carnet
          <br />
          de la <em>boutique.</em>
        </h1>
        <p className="login__text">
          Tissus, quantités, seuils et marges — consignés au même endroit, même quand le réseau
          manque.
        </p>
      </div>

      <form className="login__card" onSubmit={submit}>
        <Field label="Adresse e-mail">
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="username"
            inputMode="email"
            required
          />
        </Field>
        <Field label="Mot de passe">
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
          />
        </Field>
        <button type="submit" className="btn btn--primary btn--block">
          Se connecter
        </button>
      </form>

      <div className="demo">
        <span className="demo__label">Accès démonstration</span>
        <span className="demo__creds">
          {DEMO_EMAIL} · {DEMO_PASSWORD}
        </span>
        <button type="button" className="link-btn" onClick={onEnter}>
          Entrer dans la boutique démo
        </button>
      </div>

      <p className="login__note">
        Démonstration locale : vos données restent sur cet appareil.
      </p>
    </div>
  )
}
