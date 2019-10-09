export const getCode = (body) => {
    const regex = /[0-9]+[ ]?[0-9]+/
    const codeEx = regex.exec(body)
    if (codeEx && codeEx.length) {
        const code = codeEx[0]
        return code.replace(/ /g, '')
    }
}
