import imaps from 'imap-simple'

const sleep = (time) =>
    new Promise((res, rej) => setTimeout(() => res(null), time))

const zip = (...arrays) => {
    const length = Math.min(...arrays.map((arr) => arr.length))
    return Array.from({ length }, (value, index) =>
        arrays.map((array) => array[index])
    )
}

const extractEmail = (str: string) => {
    const match = /.*<(.+)>.*/.exec(str)
    return match ? match[1] : str
}

const getPastDate = (days) => {
    const delay = days * 24 * 3600 * 1000
    var yesterdayDate = new Date(Date.now() - delay)
    return yesterdayDate.toISOString()
}

export default ({
    email,
    password,
    lastNDays
}): Promise<{ body: string; subject: string; to: string }[]> => {
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
                            const data = results.map((res) => {
                                const heads =
                                    res.parts.find(
                                        (part) => part.which === 'HEADER'
                                    ) || ({} as any)
                                const text =
                                    res.parts.find(
                                        (part) => part.which === 'TEXT'
                                    ) || ({} as any)
                                return {
                                    body: (text.body as string) || '',
                                    subject:
                                        (heads.body.subject[0] as string) || '',
                                    to: extractEmail(heads.body.to.length ? heads.body.to[0] : '')
                                }
                            })
                            // console.log(zip(subjects, bodies))
                            connection.end()
                            res(data)
                        })
                })
            })
    )
}

// watch('ciao')
