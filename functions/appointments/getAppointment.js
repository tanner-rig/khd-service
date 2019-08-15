import _ from 'lodash';

import * as dynamoDbUtils from '../../utils/dynamo';
import * as constants from "../../constants";
import { success, serverFailure, failure } from '../../utils/response';
import { getAppointmentKeys } from '../../models/appointment';
import { requireAuth } from '../../utils/auth';

export async function main(event) {
  return new Promise(async (resolve, reject) => {
    let params;
    const appointmentId = _.get(event, 'pathParameters.appointmentId');

    if (!appointmentId) {
      console.error('Invalid Request: missing required params');
      return reject(failure(400, 'Invalid Request: missing required params'));
    }
    
    await requireAuth(event, reject, constants.JWT.TYPES.APPOINTMENT);

    if (appointmentId) {
      params = {
        TableName: constants.AWS.DYNAMO_APPOINTMENTS_TABLE,
        Key: { appointmentId },
        AttributesToGet: getAppointmentKeys()
      };

      // console.info('params: ', params);

      try {
        const result = await dynamoDbUtils.call('get', params);
        const appointment = result.Item;

        // console.info('result: ', result);

        if (!appointment) {
          return resolve(success({
            status: 'No appointment found',
            appointment: {}
          }));
        }

        return resolve(success({ appointment }));
      } catch (err) {
        console.error('server error getting the appointment: ', err);
        return reject(serverFailure('Server error getting the appointment', err));
      }
    }

    // console.info('params: ', params);

    try {
      const result = await dynamoDbUtils.call('query', params);
      const appointment = result.Items[0];

      // console.info('result: ', result);

      if (!appointment) {
        return resolve(success({
          status: 'No appointment found',
          appointment: {}
        }));
      }

      return resolve(success({ appointment }));
    } catch (err) {
      console.error('server error getting the appointment: ', err);
      return reject(serverFailure('Server error getting the appointment', err));
    }
  });
}
