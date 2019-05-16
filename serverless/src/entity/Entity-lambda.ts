import AWS from "aws-sdk";
import {APIGatewayProxyEvent, Callback, Context} from "aws-lambda";

import {ApiResponse} from "../core/model/ApiResponse";
import {UuidGenerator} from "../core/uuid/UuidGenerator";
import {IEntity} from "../core/model/interfaces";
import { DataStore } from "../core/Datastore/Datastore-lambda";

export class EntitiesApi {

    private apiResponse: ApiResponse;
    private uuiD: UuidGenerator;
    private tableName: string = "";
    private record: IEntity;
    private params: AWS.DynamoDB.DocumentClient.PutItemInput;
    private lambdaApi: DataStore;

    constructor() {
        this.uuiD = new UuidGenerator();
        this.apiResponse = new ApiResponse();
        this.lambdaApi = new DataStore("xxxx");
    }

    public onHttpPost(event: APIGatewayProxyEvent, context: Context, callback: Callback) : void {
        //Check the http request method 
        if (event.httpMethod !== "POST" && event.httpMethod !== "PUT") {
            callback(undefined, this.apiResponse.getApiErrorResponse(`${event.httpMethod} is an invalid http request method`, "400", "*", "application/json"));
            return;
        }

        //check if any parameter was passed
        if (!event.body || event.body.length === 0) {
            callback(undefined, this.apiResponse.getApiErrorResponse("parameter {id} not specified", "400", "*", "application/json"));
            return;
        }

        const data = JSON.parse(event.body);
        this.record = { id: this.uuiD.generateUUID(), entityName: data.entityName };
        this.params = { TableName: this.tableName, Item: AWS.DynamoDB.Converter.marshall(this.record) };

        this.lambdaApi.create(this.record, this.params)
            .then(response => {
                callback(undefined, response);
            })
            .catch(err => {
                callback(undefined, err);
            });
    }

}


