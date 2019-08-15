export const AWS = {
  REGION: process.env.AWS_REGION || 'us-east-1',
  DYNAMO_USERS_TABLE: process.env.DYNAMO_USERS_TABLE || 'users-dev',
  DYNAMO_CLIENTS_TABLE: process.env.DYNAMO_CLIENTS_TABLE || 'clients-dev',
  DYNAMO_APPOINTMENTS_TABLE: process.env.DYNAMO_APPOINTMENTS_TABLE || 'appointments-dev'
};

export const USER_STATUS = {
  DELETED: 'DELETED',
  ACTIVE: 'ACTIVE'
}

export const JWT = {
  SECRET: process.env.JWT_SECRET,
  TYPES: {
    ADMIN: 'admin',
    USER: 'user',
    CLIENT: 'client',
    APPOINTMENT: 'appointment'
  }
};

export const USERNAMES = JSON.parse(process.env.USERNAMES) || [];
