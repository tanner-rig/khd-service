import _ from 'lodash';

import * as dynamoDbUtils from '../../utils/dynamo';
import * as constants from '../../constants';
import { success, serverFailure } from '../../utils/response';
import { getCurrentDatetime } from '../../utils/time';
import { getClient } from '../../models/client';
import { requireAuth } from '../../utils/auth';

export async function main(event) {
  return new Promise(async (resolve, reject) => {
    event.body = JSON.parse(event.body);

    const clientId = _.get(event, 'pathParameters.clientId');

    if (!clientId) {
      console.error('Invalid Request: missing required params');
      return reject(failure(400, 'Invalid Request: missing required params'));
    }

    await requireAuth(event, reject, constants.JWT.TYPES.CLIENT);

    const datetime = getCurrentDatetime();
    const client = {
      ...getClient(event.body),
      updatedAt: datetime
    };
    const params = {
      TableName: constants.AWS.DYNAMO_CLIENTS_TABLE,
      Key: { clientId },
      UpdateExpression: dynamoDbUtils.getUpdateExpression(client),
      ExpressionAttributeNames: dynamoDbUtils.getExpressionAttributeNames(client),
      ExpressionAttributeValues: dynamoDbUtils.getExpressionAttributeValues(client),
      ReturnValues: 'ALL_NEW'
    };

    console.info('client: ', client);
    console.info('params: ', params);

    try {
      const result = await dynamoDbUtils.call('update', params);

      console.info('result: ', result);

      resolve(success({ status: 'client updated successfully', client }));
    } catch (e) {
      console.error('server error updating the client: ', e.response);
      reject(serverFailure('Server error updating the client', e.response));
    }
  });
}
