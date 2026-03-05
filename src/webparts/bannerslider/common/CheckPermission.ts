import { SPHttpClient } from "@microsoft/sp-http";
import { WebPartContext } from "@microsoft/sp-webpart-base";

export function checkUserPermissions(
  context: WebPartContext
): Promise<boolean> {
  return new Promise((resolve, reject) => {
    // Fetch the current user's information
    context.spHttpClient
      .get(
        `${context.pageContext.web.absoluteUrl}/_api/web/currentuser`,
        SPHttpClient.configurations.v1
      )
      .then((userResponse) => {
        return userResponse.json();
      })
      .then((userInfo) => {
        // Check if the user is a site collection administrator
        if (userInfo.IsSiteAdmin) {
          resolve(true); // User has full control (site collection admin)
          return;
        }

        // Fetch the user's group memberships
        context.spHttpClient
          .get(
            `${context.pageContext.web.absoluteUrl}/_api/web/associatedOwnerGroup/users`,
            SPHttpClient.configurations.v1
          )
          .then((ownersResponse) => {
            return ownersResponse.json();
          })
          .then((data) => {
            const owners = data.value || data.d.results;

            // Check if the user is in the 'Owners' group
            const isOwner = owners.some(
              (user: { Title: string }) =>
                user.Title === context.pageContext.user.displayName
            );

            if (isOwner) {
              resolve(true);
            } else {
              resolve(false);
            }
          })
          .catch((error) => {
            console.error("Failed to fetch owner group:", error);
            resolve(false); // Error or no owner permissions
          });
      })
      .catch((error) => {
        console.error("Failed to fetch current user:", error);
        resolve(false); // Error or no admin permissions
      });
  });
}
