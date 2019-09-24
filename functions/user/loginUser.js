import bcrypt from 'bcryptjs';
import _ from 'lodash';

import * as constants from '../../constants';
import * as dynamoDbUtils from '../../utils/dynamo';
import { failure, serverFailure, success } from '../../utils/response';
import { getJWT } from '../../utils/jwt';
import { getUser } from '../../models/user';

export async function main(event) {
  return new Promise(async (resolve, reject) => {
    const data = JSON.parse(event.body);
    const username = _.get(data, 'username');
    const password = _.get(data, 'password');

    if (!username || !password) {
      console.error('Invalid Request: missing required params');
      return reject(failure(400, 'Invalid Request: missing required params'));
    }

    let params = {
      TableName: constants.AWS.DYNAMO_USERS_TABLE,
      Key: { username },
      AttributesToGet: getUser(),
    };

    try {
      const result = await dynamoDbUtils.call('get', params);
      const user = result.Item;

      // console.log('user: ', user)


      if (!user) {
        // username not found in our db
        return reject(failure(400, 'incorrect username/password combination'));
      }

      // Check if the password is correct
      bcrypt.compare(password, user.password || 'fail', (err, res) => {
        if (err) {
          // console.log('error: ', err)

          console.error("error comparing the user's passwords: ", err.response);
          return reject(
            serverFailure(
              "Server error verifying user's password in the database",
              err.response
            )
          );
        }

        if (res) {
          // Passwords match
          // Delete the hashed password from the user obj so it's not returned to client
          delete user.password;
          // console.log('match: ', res)
          return resolve(
            success({
              token: getJWT(user, constants.JWT.TYPES.USER),
              user,
            })
          );
        }

        // Passwords don't match
        return reject(failure(400, 'incorrect username/password combination'));
      });
    } catch (err) {
      console.error('server error getting the user: ', err);
      return reject(serverFailure('Server error getting the user', err));
    }
  });
}
