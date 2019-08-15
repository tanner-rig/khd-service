import * as dynamoDbUtils from "../../utils/dynamo";
import * as constants from "../../constants";
import { success, serverFailure, failure } from "../../utils/response";
import { getClientKeys } from "../../models/client";
import { requireAuth } from "../../utils/auth";

export async function main(event) {
  return new Promise(async (resolve, reject) => {
    await requireAuth(event, reject, constants.JWT.TYPES.CLIENT);

    const params = {
      TableName: constants.AWS.DYNAMO_CLIENTS_TABLE,
      FilterExpression: "clientStatus = :active",
      ExpressionAttributeValues: { ":active": constants.USER_STATUS.ACTIVE },
    };

    // console.info("params: ", params);

    try {
      const result = await dynamoDbUtils.call("scan", params);
      const clients = result.Items;

      // console.info("result: ", result);

      if (!clients) {
        return resolve(
          success({
            status: "No clients found",
            clients: {},
          })
        );
      }

      return resolve(success({ clients }));
    } catch (err) {
      console.error("server error getting the clients: ", err);
      return reject(serverFailure("Server error getting the clients", err));
    }
  });
}
