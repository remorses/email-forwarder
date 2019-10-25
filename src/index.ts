/*
every hour:
get the emails from last 2 hours,
search them for the subject regex
send the call to the webhook that handles the chrome and cookies,

can also be my chrome instance, 
*/
import sqlite from 'sqlite'
import fetch from 'node-fetch'
import getEmails from './getEmails'
import sql from 'sql-template-strings'
import * as fs from 'fs'
import md5 from 'md5'
import { sleep } from './support'

const CHECK_INTERVAL = Number(process.env.check_interval || 60 * 60)

const hasAlreadySentEmail = (db: sqlite.Database, key) => {
    return db.get(sql`SELECT * FROM emails WHERE hash = ${key}`)
}

const now = () => Math.round(new Date().getTime() / 1000)

const insertEmail = async (db, { subject, body }) => {
    const hash = md5(body)
    const query = sql`INSERT INTO emails (hash, subject, timestamp) VALUES (${hash}, ${subject}, ${now()})`
    await db.run(query)
}

const deleteOldEmails = (db) => {
    const weekAgo = now() - 7 * 24 * 60 * 60
    return db.run(sql`DELETE FROM emails WHERE timestamp < ${weekAgo}`)
}

const waitForHost = async (url) => {
    while (true) {
        await sleep(1000)
        try {
            const res = await fetch(url, {
                method: 'OPTIONS',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
            })
            if (!res.ok) {
                throw Error('bad response for head req')
            }
            return
        } catch (e) {
            console.log('hook ' + url + ' still not reachable')
        }
    }
}

const dbPath = 'var/lib/data'

const main = async () => {
    if (!fs.existsSync(dbPath)) {
        fs.mkdirSync(dbPath, { recursive: true })
    }
    const db = await sqlite.open(dbPath + '/db.sqlite')
    await db.migrate({})
    const { email, password, subject_regex, webhook } = process.env
    if (!email || !password || !subject_regex || !webhook) {
        throw Error('incomplete env')
    }
    await waitForHost(webhook)
    while (true) {
        await deleteOldEmails(db)
        const emails = await getEmails({ email, password, lastNDays: 0.1 })
        const matches = emails.filter((email) => {
            return email.subject.search(RegExp(subject_regex)) !== -1
        })
        for (let data of matches) {
            if (await hasAlreadySentEmail(db, md5(data.body))) {
                console.log('email already propagated, ' + data.subject)
                continue
            }
            console.log('propagating email ' + data.subject)
            try {
                await fetch(webhook, {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
                })
                await insertEmail(db, data)
            } catch (e) {
                console.log('cannot send to hook + ' + e)
            }
        }
        await sleep(1000 * CHECK_INTERVAL)
    }
}

main()
