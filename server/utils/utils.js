const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

function genToken(length = 20) {
    let token = '';

    // generate a random shorten url
    for (let i = 0; i < length; i++) {
        const index = parseInt(Math.random() * ALPHABET.length, 10);

        token += ALPHABET[index];
    }

    return token;
}

export default { genToken };
