require('dotenv').config()
import { strict as assert } from 'assert'
import searchEmail from '../src/searchEmail'


it('reads my emails', async () => {
    const x = await searchEmail({
        email: process.env.EMAIL,
        password: process.env.PASSWORD,
        regex: /.*homyatol.*/,
        lastNDays: 5,
    })
    console.log('\n', JSON.stringify(x.subject, null, '    '))
})