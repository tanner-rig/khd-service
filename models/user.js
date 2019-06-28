import _ from 'lodash';

const user = {
    username: '',
    password: '',
    firstName: '',
    lastName: '',
    role: '',
    createdAt: '',
    updatedAt: '',
  };

  function getUserKeys() {
    return Object.keys(user);
  }
  
  export function getUserKeysWithoutSecrets() {
    const userKeys = getUserKeys();
  
    return _.remove(userKeys, value => {
      return (
        value !== 'password'
      );
    });
  }
  
  export function getUser(data) {
    const userKeys = getUserKeys();
    const prunedData = _.cloneDeep(data);
  
    _.forIn(data, (value, key) => {
      // check if key exists on User object
      const index = _.indexOf(userKeys, key);
  
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