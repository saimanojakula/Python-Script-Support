import { WebPartContext } from "@microsoft/sp-webpart-base";
import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';
import { TList, TListItemParams} from '../common/Types';


/**
 * Retrieves SharePoint lists based on the specified parameters.
 *
 * @param context - The WebPartContext object providing context for the SharePoint web part.
 * @param properties - An object containing parameters for the query:
 *   - `select`: The fields to select in the query.
 *   - `expand`: The related entities to expand in the query.
 *   - `filter`: The filter criteria for the query.
 *   - `orderby`: The ordering criteria for the query.
 *   - `top`: The maximum number of items to retrieve.
 * @returns A promise that resolves with the retrieved list data or rejects with an error or HTTP status code.
 *
 * @throws Will reject the promise if the HTTP request fails or if the response status is not OK.
 */
export async function getLists<T extends TList>(context: WebPartContext, properties: TListItemParams): Promise<T[]> {
    return new Promise((resolve, reject) => {
        const url: string = `${context.pageContext.web.absoluteUrl}/_api/web/lists?$select=${properties.select.toString()}&$expand=${properties.expand}&$filter=${properties.filter}&$orderby=${properties.orderby}&$top=${properties.top}`;

        getRestClient(context, url)
            .then(async (restClient) => {
                const response: { value: T[] } = await restClient.json();
                if (restClient.ok) {
                    resolve(response?.value ? response.value : []);
                } else {
                    reject(restClient.status);
                }
            })
            .catch((error) => reject(error));
    })
}

/**
 * Retrieves list items from a SharePoint list using REST API.
 *
 * @param context - The WebPartContext instance providing the context of the current web part.
 * @param listId - The GUID of the SharePoint list to retrieve items from.
 * @param properties - An object containing query parameters for the request:
 *   - `select`: Specifies the fields to retrieve.
 *   - `expand`: Specifies related entities to include in the response.
 *   - `filter`: Specifies the filter criteria for the items.
 *   - `orderby`: Specifies the order in which items are returned.
 *   - `top`: Specifies the maximum number of items to retrieve.
 * @returns A promise that resolves with the retrieved list items or rejects with an error or HTTP status code.
 */
export async function getListItems<T>(context: WebPartContext, listId: string, properties: TListItemParams): Promise<T[]> {
    return new Promise((resolve, reject) => {
        const url: string = `${context.pageContext.web.absoluteUrl}/_api/web/lists(guid'${listId}')/items?$select=${properties.select}&$expand=${properties.expand}&$filter=${properties.filter}&$orderby=${properties.orderby}&$top=${properties.top}`;
        getRestClient(context, url)
            .then(async (restClient) => {
                const response: { value: T[] } = await restClient.json();
                if (restClient.ok) {
                    resolve(response?.value ? response.value : []);
                } else {
                    reject(restClient.status);
                }
            })
            .catch((error) => reject(error));
    })
}

/**
 * Sends a GET request to the specified URL using the SPHttpClient from the provided WebPartContext.
 *
 * @param context - The WebPartContext instance used to access the SPHttpClient.
 * @param url - The URL to which the GET request will be sent.
 * @returns A promise that resolves to an SPHttpClientResponse containing the response data.
 *
 * @remarks
 * Ensure that the URL provided is a valid endpoint within the SharePoint environment.
 * The headers specify the expected content type and accept type for the response.
 */
function getRestClient(context: WebPartContext, url: string): Promise<SPHttpClientResponse> {
    return context.spHttpClient.get(url, SPHttpClient.configurations.v1, {
        headers: {
            Accept: 'application/json'
        }
    });
}
