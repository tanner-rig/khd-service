import _ from "lodash";
// import axios from "axios";

import { JWT, USERNAMES } from "../constants";
import { failure } from "./response";
import { decode } from "./jwt";
// import { getOptions } from "./request";

function finishProcesses() {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(true);
    });
  });
}

async function deny(statusCode, reason, parentReject) {
  // console.info(`${reason}!`);
  parentReject(failure(statusCode, reason));

  const processesFinished = await finishProcesses();

  if (processesFinished) process.exit(0);
}

/*
 * event: object - lambda event
 * reject: func - reject function from lambda to responsd to request if it fails
 * type: string - type off of the JWT (required if JWT auth is allowed)
 * acceptedRoles: array - accepted user roles to be authenticated (required if JWT auth is allowed)
 */
export async function requireAuth(
  event,
  parentReject,
  type = "Invalid",
  acceptedRoles = ["admin"]
) {
  return new Promise(async resolve => {
    // console.info("event: ", event);
    // console.info("type: ", type);
    // console.info("acceptedRoles: ", acceptedRoles);

    const token = _.get(event, "headers.Authorization");

    if (token) {
      // JWT Check
      try {
        if (!token.includes("Bearer")) {
          deny(
            401,
            'Authorization header is missing "Bearer" before token',
            parentReject
          );
        }

        // Get decoded token and verify signature
        const decodedToken = decode(token.substring(7));

        if (decodedToken) {
          // console.info("decodedToken: ", decodedToken);

          // Check if token is expired
          if (decodedToken.exp <= Math.floor(Date.now() / 1000)) {
            deny(401, "Your JWT token has expired", parentReject);
          }

          // Check if user has necessary permissions
          if (
            decodedToken.role === JWT.TYPES.ADMIN &&
            decodedToken.type === JWT.TYPES.USER &&
            USERNAMES.includes(decodedToken.username)
          ) {
            // console.info('Is a valid admin!');
            return resolve();
          } else {
            deny(403, "Unknown JWT type", parentReject);
          }
          // else if (decodedToken.type === type && type === JWT.TYPES.CLIENT) {
          //   const requestUserId = decodeURIComponent(_.get(event, 'pathParameters.userId') || _.get(event, 'queryStringParameters.userId') || _.get(event, 'body.userId'));
          //   const requestEmail = decodeURIComponent(_.get(event, 'pathParameters.email') || _.get(event, 'queryStringParameters.email') || _.get(event, 'body.email'));

          //   if (requestUserId && requestUserId === decodedToken.sub) {
          //     // User making request is accessing/altering their own data
          //     return resolve();
          //   } else if (requestEmail && requestEmail === decodedToken.email) {
          //     // User making request is accessing/altering their own data
          //     return resolve();
          //   }

          //   deny(403, 'Insufficient permissions to access accounts other than your own', parentReject);
          // }
        } else {
          deny(401, "Invalid JWT", parentReject);
        }
      } catch (e) {
        console.error("error decoding token: ", e);
        deny(401, "JWT is not valid or has expired", parentReject);
      }
    } else {
      // No Authentication method found
      deny(401, "Unauthorized!", parentReject);
    }
  });
}
