import _ from 'lodash';

import * as dynamoDbUtils from '../../utils/dynamo';
import * as constants from '../../constants';
import { success, serverFailure, failure } from '../../utils/response';
import { getClientKeys } from '../../models/client';
import { requireAuth } from '../../utils/auth';

export async function main(event) {
  return new Promise(async (resolve, reject) => {
    let params;
    const clientId = _.get(event, 'pathParameters.clientId');

    if (!clientId) {
      console.error('Invalid Request: missing required params');
      return reject(failure(400, 'Invalid Request: missing required params'));
    }

    await requireAuth(event, reject, constants.JWT.TYPES.CLIENT);

    if (clientId) {
      params = {
        TableName: constants.AWS.DYNAMO_CLIENTS_TABLE,
        Key: { clientId },
        AttributesToGet: getClientKeys()
      };

      // console.info('params: ', params);

      try {
        const result = await dynamoDbUtils.call('get', params);
        const client = result.Item;

        // console.info('result: ', result);

        if (!client) {
          return resolve(success({
            status: 'No client found',
            client: {}
          }));
        }

        return resolve(success({ client }));
      } catch (err) {
        console.error('server error getting the client: ', err);
        return reject(serverFailure('Server error getting the client', err));
      }
    }
  });
}
