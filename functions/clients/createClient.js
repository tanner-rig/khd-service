import { v4 as uuidv4 } from "uuid";

import * as constants from "../../constants";
import * as dynamoDbUtils from "../../utils/dynamo";
import { failure, serverFailure, success } from "../../utils/response";
import { getCurrentDatetime } from "../../utils/time";
import { getClient } from "../../models/client";
import { requireAuth } from "../../utils/auth";

export async function main(event) {
  return new Promise(async (resolve, reject) => {
    event.body = JSON.parse(event.body);
    const datetime = getCurrentDatetime();

    // console.info("Event Received: ", event);

    // validate token
    await requireAuth(event, reject, constants.JWT.TYPES.CLIENT);

    // Create a new client
    const client = getClient({
      clientId: uuidv4(),
      clientStatus: constants.USER_STATUS.ACTIVE,
      ...event.body,
      createdAt: datetime,
      updatedAt: datetime
    });

    const putParams = {
      TableName: constants.AWS.DYNAMO_CLIENTS_TABLE,
      Item: client
    };

    // console.info("putParams: ", putParams);

    // write the user to the database
    try {
      const response = await dynamoDbUtils.call("put", putParams);

      // console.info("putResponse: ", response);

      return resolve(success(client));
    } catch (err) {
      // console.error("error saving the client in the database: ", err);
      return reject(
        serverFailure("Server error creating the client in the database", err)
      );
    }
  });
}
