import _ from "lodash";
import bcrypt from "bcryptjs";

import * as constants from "../../constants";
import * as dynamoDbUtils from "../../utils/dynamo";
import { failure, serverFailure, success } from "../../utils/response";
import { getCurrentDatetime } from "../../utils/time";
import { getUser } from "../../models/user";
import { getJWT } from "../../utils/jwt";

export async function main(event) {
  return new Promise(async (resolve, reject) => {
    const data = JSON.parse(event.body);
    const datetime = getCurrentDatetime();

    console.info("Event Received: ", data);

    if (!data.username || !data.password) {
      console.error("Invalid Request: missing required params");
      return reject(failure(400, "Invalid Request: missing required params"));
    }

    // validate token
    // comment for local user creation
    await requireAuth(event, reject, constants.JWT.TYPES.USER);

    // Hash the password
    bcrypt.hash(data.password, 11, async (err, hashedPassword) => {
      if (err) {
        console.error("error hashing the user's password: ", err);
        return reject(
          serverFailure("error hashing the user's password: ", err.response)
        );
      }

      // Create a new user
      const user = getUser({
        username: data.username,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        createdAt: datetime,
        updatedAt: datetime,
      });

      const putParams = {
        TableName: constants.AWS.DYNAMO_USERS_TABLE,
        Item: user,
      };

      console.info("putParams: ", putParams);

      // write the user to the database
      try {
        const response = await dynamoDbUtils.call("put", putParams);

        console.info("putResponse: ", response);

        const responseBody = {
          user: {
            username: user.username,
            firstName: user.firstName || "",
            lastName: user.lastName || "",
            role: user.role,
          },
          token: getJWT(user, constants.JWT.TYPES.USER),
        };

        return resolve(success(responseBody));
      } catch (err) {
        console.error("error saving the user in the database: ", err);
        return reject(
          serverFailure(
            "Server error creating the user in the database",
            err.response
          )
        );
      }
    });
  });
}
