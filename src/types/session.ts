export type Session = {
  token: string;
  user: User;
  loggedAt?: Date
};

export type User = {
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  birthDate: Date;
  phoneNumber: string
};
