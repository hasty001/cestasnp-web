import React, { Fragment } from 'react'

export default ({ email }) => (
    <Fragment>
        <h2 style={{
            textAlign: 'center',
        }}>Registrácia prebehla úspešne</h2>
        <p style={{
            margin: '20px auto',
            fontSize: '18px',
            textAlign: 'justify',
            padding: '0 50px',
        }}>Prosím potvrď svoju registráciu kliknutím na link, ktorý sme ti zaslali na {email}
        a môžeš sa prihlásiť. Mysli na to, že email mohol skončiť aj v tvojom spame.</p>
    </Fragment>
)
