import {APIGatewayProxyEvent, Callback, Context, Handler} from "aws-lambda";

import {EntitiesApi} from "./Api";

const api = new EntitiesApi();

export const onHttpPost: Handler = (event: APIGatewayProxyEvent, context: Context, callback: Callback) => {
    api.onHttpPost(event, context, callback);
};

export const onHttpGet: Handler = (event: APIGatewayProxyEvent, context: Context, callback: Callback) => {
    api.onHttpGet(event, context, callback);
};

export const onHttpPut: Handler = (event: APIGatewayProxyEvent, context: Context, callback: Callback) => {
    api.onHttpPut(event, context, callback);
};

export const onHttpList: Handler = (event: APIGatewayProxyEvent, context: Context, callback: Callback) => {
    api.onHttpList(event, context, callback);
};

