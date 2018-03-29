import ExtendableError from 'es6-error';


export class UTVIError extends ExtendableError {
    static domain = 'UTVIError';

    constructor(message = '') {
        super(message);

        const domains = [];
        let prototype = Object.getPrototypeOf(this);

        do {
            domains.unshift(prototype.constructor.domain);
            prototype = Object.getPrototypeOf(prototype);
        } while (prototype.constructor !== ExtendableError);

        this.message = domains.join('.') + (message ? `: ${message}` : '');
    }

    get domain() {
        return this.constructor.domain;
    }
}

export class InvalidParamsError extends UTVIError {
    static domain = 'InvalidParams';
}
