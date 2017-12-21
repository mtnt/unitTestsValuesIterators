import ExtendableError from 'es6-error';


export class THError extends ExtendableError {
    static domain = 'THError';

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

export class InvalidParamsError extends RMCError {
    static domain = 'InvalidParams';
}
