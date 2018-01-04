import { formatError } from 'graphql';

module.exports = err => {
    const data = formatError(err);
    const { originalError } = err;

    data.field = originalError && originalError.field;
    return data;
}