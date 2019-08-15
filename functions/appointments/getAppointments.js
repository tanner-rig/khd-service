import _ from 'lodash';

import * as dynamoDbUtils from '../../utils/dynamo';
import * as constants from "../../constants";
import { success, serverFailure, failure } from '../../utils/response';
import { getAppointmentKeys } from "../../models/appointment";
import { requireAuth } from "../../utils/auth";

export async function main(event) {
  return new Promise(async (resolve, reject) => {
    const clientId = _.get(event, "queryStringParameters.clientId");

    if (!clientId) {
      console.error("Invalid Request: missing required params");
      return reject(failure(400, "Invalid Request: missing required params"));
    }

    await requireAuth(event, reject, constants.JWT.TYPES.APPOINTMENT);

    const params = {
      TableName: constants.AWS.DYNAMO_APPOINTMENTS_TABLE,
      IndexName: "clientId-index",
      KeyConditionExpression: "clientId = :clientId",
      ExpressionAttributeValues: dynamoDbUtils.getExpressionAttributeValues({
        clientId,
      }),
    };

    // console.info("params: ", params);

    try {
      const result = await dynamoDbUtils.call("query", params);
      const appointments = result.Items;

      // console.info("result: ", result);

      if (!appointments) {
        return resolve(
          success({
            status: "No appointments found",
            appointments: {},
          })
        );
      }

      return resolve(success({ appointments }));
    } catch (err) {
      console.error("server error getting the appointments: ", err);
      return reject(serverFailure("Server error getting the appointments", err));
    }
  });
}
