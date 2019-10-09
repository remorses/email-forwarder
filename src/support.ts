export const getCode = (body) => {
    const regex = /[0-9]+[ ]?[0-9]+/
    const codeEx = regex.exec(body)
    if (codeEx && codeEx.length) {
        const code = codeEx[0]
        return code.replace(/ /g, '')
    }
}



export const sleep = (time) =>
    new Promise((res, rej) => setTimeout(() => res(true), time))

export const zip = (...arrays) => {
    const length = Math.min(...arrays.map((arr) => arr.length))
    return Array.from({ length }, (value, index) =>
        arrays.map((array) => array[index])
    )
}
