import _ from 'lodash';

import * as dynamoDbUtils from '../../utils/dynamo';
import * as constants from "../../constants";
import { success, serverFailure, failure } from '../../utils/response';
import { requireAuth } from '../../utils/auth';

export async function main(event) {
  return new Promise(async (resolve, reject) => {
    const appointmentId = _.get(event, 'pathParameters.appointmentId');

    if (!appointmentId) {
      console.error('Invalid Request: missing required params');
      return reject(failure(400, 'Invalid Request: missing required params'));
    }

    await requireAuth(event, reject, constants.JWT.TYPES.APPOINTMENTS);

    const queryParams = {
      TableName: constants.AWS.DYNAMO_APPOINTMENTS_TABLE,
      Key: { appointmentId }
    };

    // console.info('data: ', data);
    // console.info('queryParams: ', queryParams);

    try {
      const queryResult = await dynamoDbUtils.call('delete', queryParams);

      resolve(success({ status: 'appointment deleted successfully' }));
    } catch (e) {
      console.error('server error setting appointment status to \'DELETED\': ', e);
      reject(serverFailure('Server error deleting the appointment', e.response));
    }
  });
}
