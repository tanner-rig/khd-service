import _ from 'lodash';

const client = {
    clientId: '',
    firstName: '',
    lastName: '',
    waiver: '',
    phone: '',
    contactMethod: '',
    instagram: '',
    hairHistory: '',
    email: '',
    dob: '',
    allergies: '',
    venmo: '',
    notes: '',
    clientStatus: '',
    createdAt: '',
    updatedAt: '',
  };

  export function getClientKeys() {
    return Object.keys(client);
  }
  
  export function getClient(data) {
    const clientKeys = getClientKeys();
    const prunedData = _.cloneDeep(data);
  
    _.forIn(data, (value, key) => {
      // check if key exists on client object
      const index = _.indexOf(clientKeys, key);
  
      if (index < 0) {
        // It doesn't exist, don't allow it to be added to db
        delete prunedData[key];
      } else if (!value) {
        // No value, delete it
        delete prunedData[key];
      }
    });
  
    return prunedData;
  }