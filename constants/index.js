export const AWS = {
  REGION: process.env.AWS_REGION || 'us-east-1',
  DYNAMO_USERS_TABLE: process.env.DYNAMO_USERS_TABLE || 'users-dev',
  DYNAMO_CLIENTS_TABLE: process.env.DYNAMO_CLIENTS_TABLE || 'clients-dev'
};

export const JWT = {
  SECRET: process.env.JWT_SECRET,
  TYPES: {
    USER: 'User',
    CLIENT: 'Client'
  }
};
