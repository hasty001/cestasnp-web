import React, { Fragment } from 'react'

export default ({ email }) => (
    <Fragment>
        <h1>Registrácia prebehla úspešne</h1>
        <p>Prosím potvrď svoju registráciu kliknutím na link, ktorý sme ti zaslali na {email} a môžeš sa prihlásiť.</p>
    </Fragment>
)
