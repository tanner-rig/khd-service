import uuid from "uuid";

import * as constants from "../../constants";
import * as dynamoDbUtils from "../../utils/dynamo";
import { failure, serverFailure, success } from "../../utils/response";
import { getCurrentDatetime } from "../../utils/time";
import { getAppointment } from "../../models/appointment";
import { requireAuth } from "../../utils/auth";

export async function main(event) {
  return new Promise(async (resolve, reject) => {
    event.body = JSON.parse(event.body);
    const datetime = getCurrentDatetime();

    // console.info("Event Received: ", event.body);

    // validate token
    await requireAuth(event, reject, constants.JWT.TYPES.APPOINTMENT);

    // Create a new appointment
    const appointment = getAppointment({
      appointmentId: uuid.v4(),
      ...event.body,
      createdAt: datetime,
      updatedAt: datetime
    });

    const putParams = {
      TableName: constants.AWS.DYNAMO_APPOINTMENTS_TABLE,
      Item: appointment
    };

    // console.info("putParams: ", putParams);

    // write the user to the database
    try {
      const response = await dynamoDbUtils.call("put", putParams);

      // console.info("putResponse: ", response);

      return resolve(success(appointment));
    } catch (err) {
      console.error("error saving the appointment in the database: ", err);
      return reject(
        serverFailure(
          "Server error creating the appointment in the database",
          err
        )
      );
    }
  });
}
