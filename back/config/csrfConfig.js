const Tokens =  require('csrf');

const tokens = new Tokens();

function createCsrfSecret() {                  // creates a new secret
    const secret = tokens.secretSync();
    return secret;
}

function createTokenFromSecret(secret) {           // creates a new token from the secret
  return tokens.create(secret);
}

function validateTokenWithSecret(secret, token) {      // validates the token against the secret
  return tokens.verify(secret, token);
}

exports.createCsrfSecret = createCsrfSecret;
exports.createTokenFromSecret = createTokenFromSecret;
exports.validateTokenWithSecret = validateTokenWithSecret;