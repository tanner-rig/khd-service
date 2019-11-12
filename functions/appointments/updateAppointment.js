import _ from "lodash";

import * as dynamoDbUtils from "../../utils/dynamo";
import * as constants from "../../constants";
import { success, serverFailure } from "../../utils/response";
import { getCurrentDatetime } from "../../utils/time";
import { getAppointment } from "../../models/appointment";
import { requireAuth } from "../../utils/auth";

export async function main(event) {
  return new Promise(async (resolve, reject) => {
    event.body = JSON.parse(event.body);

    const appointmentId = _.get(event, "pathParameters.appointmentId");

    if (!appointmentId) {
      console.error("Invalid Request: missing required params");
      return reject(failure(400, "Invalid Request: missing required params"));
    }

    await requireAuth(event, reject, constants.JWT.TYPES.APPOINTMENT);

    const datetime = getCurrentDatetime();
    const appointment = {
      ...getAppointment(event.body),
      updatedAt: datetime
    };

    if (appointment.appointmentId) {
      delete appointment.appointmentId;
    }

    const params = {
      TableName: constants.AWS.DYNAMO_APPOINTMENTS_TABLE,
      Key: { appointmentId },
      UpdateExpression: dynamoDbUtils.getUpdateExpression(appointment),
      ExpressionAttributeNames: dynamoDbUtils.getExpressionAttributeNames(
        appointment
      ),
      ExpressionAttributeValues: dynamoDbUtils.getExpressionAttributeValues(
        appointment
      ),
      ReturnValues: "ALL_NEW"
    };

    // console.info('appointment: ', appointment);
    // console.info('params: ', params);

    try {
      const result = await dynamoDbUtils.call("update", params);

      // console.info('result: ', result);

      resolve(
        success({
          status: "appointment updated successfully",
          appointment: { ...appointment, appointmentId }
        })
      );
    } catch (e) {
      console.error("server error updating the appointment: ", e);
      reject(serverFailure("Server error updating the appointment", e));
    }
  });
}
