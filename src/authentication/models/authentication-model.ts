interface LoginParams {
    email: string;
    password: string;
}

interface SignupParams {
    fullName: string;
    email: string;
    password: string;
}

export class LoginModel {
    email: string;
    password: string;
    constructor({email, password} : LoginParams) {
        this.email = email;
        this.password = password;
    }
}

export class SignupModel {
    fullName: string;
    email: string;
    password: string;
    constructor({fullName, email, password} : SignupParams) {
        this.fullName = fullName;
        this.email = email;
        this.password = password;
    }
}