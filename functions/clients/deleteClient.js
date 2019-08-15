import _ from 'lodash';

import * as dynamoDbUtils from '../../utils/dynamo';
import * as constants from '../../constants';
import { success, serverFailure, failure } from '../../utils/response';
import { getCurrentDatetime } from '../../utils/time';
import { getClientKeys } from '../../models/client';
import { requireAuth } from '../../utils/auth';

export async function main(event) {
  return new Promise(async (resolve, reject) => {
    const clientId = _.get(event, 'pathParameters.clientId');

    if (!clientId) {
      console.error('Invalid Request: missing required params');
      return reject(failure(400, 'Invalid Request: missing required params'));
    }

    await requireAuth(event, reject, constants.JWT.TYPES.CLIENT);

    const datetime = getCurrentDatetime();
    const data = { clientStatus: constants.USER_STATUS.DELETED, updatedAt: datetime };
    const queryParams = {
      TableName: constants.AWS.DYNAMO_CLIENTS_TABLE,
      Key: { clientId },
      AttributesToGet: getClientKeys()
    };
    const updateParams = {
      TableName: constants.AWS.DYNAMO_CLIENTS_TABLE,
      Key: { clientId },
      UpdateExpression: dynamoDbUtils.getUpdateExpression(data),
      ExpressionAttributeNames: dynamoDbUtils.getExpressionAttributeNames(data),
      ExpressionAttributeValues: dynamoDbUtils.getExpressionAttributeValues(data),
      ReturnValues: 'ALL_NEW'
    };

    // console.info('data: ', data);
    // console.info('queryParams: ', queryParams);
    // console.info('updateParams: ', updateParams);

    try {
      const queryResult = await dynamoDbUtils.call('get', queryParams);
      // console.info('queryResult: ', queryResult);

      if (!queryResult.Item) {
        return reject(failure(404, { error: 'No client found with this id to be able to delete' }));
      }

      const result = await dynamoDbUtils.call('update', updateParams);
      delete result.Attributes.password;
      // console.info('result: ', result);
      resolve(success({ status: 'client deleted successfully' }));
    } catch (e) {
      console.error('server error setting client status to \'DELETED\': ', e.response);
      reject(serverFailure('Server error deleting the client', e.response));
    }
  });
}
