import imaps from 'imap-simple'

const sleep = (time) =>
    new Promise((res, rej) => setTimeout(() => res(null), time))

const zip = (...arrays) => {
    const length = Math.min(...arrays.map((arr) => arr.length))
    return Array.from({ length }, (value, index) =>
        arrays.map((array) => array[index])
    )
}

const getPastDate = (days) => {
    const delay = days * 24 * 3600 * 1000
    var yesterdayDate = new Date(Date.now() - delay)
    return yesterdayDate.toISOString()
}

export default ({
    email,
    password,
    regex,
    lastNDays
}): Promise<{ body: string; subject: string }> => {
    const config = {
        imap: {
            user: email, // process.env.GMAIL_EMAIL,
            password: password, // process.env.GMAIL_PASSWORD,
            host: 'imap.gmail.com',
            port: 993,
            tls: true,
            authTimeout: 3000
        }
    }
    return imaps.connect(config).then(
        (connection) =>
            new Promise((res, rej) => {
                // setTimeout(() => rej('timed out'), 3000)
                return connection.openBox('INBOX').then(async () => {
                    const fetchOptions = {
                        bodies: ['HEADER', 'TEXT'],
                        markSeen: false
                    }

                    connection
                        .search(
                            [['SINCE', getPastDate(lastNDays)]],
                            fetchOptions
                        )
                        .then((results) => {
                            // console.log(results)
                            const subjects = results.map((res) => {
                                return res.parts
                                    .filter((part) => part.which === 'HEADER')
                                    .map((x) => x.body.subject[0])[0]
                            })
                            // console.log('fetched emails ' + subjects)
                            const bodies = results.map((res) => {
                                return res.parts
                                    .filter((part) => part.which === 'TEXT')
                                    .map((x) => x.body || '')[0]
                            })
                            // console.log(zip(subjects, bodies))
                            const data = zip(subjects, bodies).map((v) => ({
                                subject: v[0],
                                body: v[1] || ''
                            }))
                            // connection.end()
                            const matched = data.filter((x) =>
                                x.subject.match(regex)
                            )
                            if (matched.length) {
                                connection.end()
                                res(matched[0])
                                return
                            } else {
                                rej(Error('not found'))
                                connection.end()
                            }
                        })
                })
            })
    )
}

// watch('ciao')
