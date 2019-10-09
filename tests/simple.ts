require('dotenv').config()
import { strict as assert } from 'assert'
import getEmails from '../src/getEmails'


it('reads my emails', async () => {
    const emails = await getEmails({
        email: process.env.email,
        password: process.env.password,
        lastNDays: 5,
    })
    console.log('\n', JSON.stringify(emails.map(({to}) => to), null, '    '))
})