export type RegisterForm = {
    firstName: string,
    lastName: string,
    email: string,
    username: string,
    phoneNumber: string,
    password: string
}

export type LoginForm = {
    email: string,
    password: string,
    rememberMe: boolean | null
}

export type ResetPasswordForm = {
    email: string,
    oldPassword: string,
    newPassword: string
}

export const phoneNumberRegex = /^[\+]?[0-9]{0,3}\W?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im
export const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^a-zA-Z0-9])(?=.{8,})/;
export const strongPasswordRegex = /^(?=(.*[a-z]){2,})(?=(.*[A-Z]){2,})(?=(.*[0-9]){2,})(?=(.*[^a-zA-Z0-9]){2,})(?=.{12,})(?!.*(1234|password|qwerty|abc)).*/
