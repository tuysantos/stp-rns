import { DynamoDB } from "aws-sdk";
import {APIGatewayProxyEvent, Callback, Context} from "aws-lambda";

import {ApiResponse} from "../core/model/ApiResponse";
import {UuidGenerator} from "../core/uuid/UuidGenerator";
import {IUser} from "../core/model/interfaces";
import { DataStore } from "../core/Datastore/Datastore-lambda";

export class UsersApi {

    private apiResponse: ApiResponse;
    private uuiD: UuidGenerator;
    private tableName: string = "sls-stp-rns-dev-user";
    private record: IUser;
    private params: DynamoDB.DocumentClient.PutItemInput;
    private updateParams: DynamoDB.DocumentClient.UpdateItemInput;
    private lambdaApi: DataStore;
    private dynamoDb: DynamoDB;

    constructor() {
        this.uuiD = new UuidGenerator();
        this.apiResponse = new ApiResponse();
        this.lambdaApi = new DataStore(this.tableName, this.dynamoDb);
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
        this.record = { id: this.uuiD.generateUUID(), fName: data.fName, lName: data.lName, userName : data.userName, 
            password: data.password, 
            token: data.token, phone : data.phone,
            email: data.email, createdDate : data.createdDate };
        this.params = { TableName: this.tableName, Item: DynamoDB.Converter.marshall(this.record) };

        this.lambdaApi.create(this.record, this.params)
            .then(response => {
                callback(undefined, response);
            })
            .catch(err => {
                callback(undefined, err);
            });
    }

    public onHttpGet(event: APIGatewayProxyEvent, context: Context, callback: Callback): void {
        //Check the http request method 
        if (event.httpMethod !== "GET") {
            callback(undefined, this.apiResponse.getApiErrorResponse(`${event.httpMethod} is an invalid http request method`, "400", "*", "application/json"));
            return;
        }

        //check if any parameter was passed
        if (!event.pathParameters || !event.pathParameters.id) {
            callback(undefined, this.apiResponse.getApiErrorResponse("parameter {id} not specified", "400", "*", "application/json"));
            return;
        }

        this.lambdaApi.get(event.pathParameters.id)
            .then(response => {
                callback(undefined, response);
            })
            .catch(err => {
                callback(undefined, err);
            });
    }

    public onHttpPut(event: APIGatewayProxyEvent, context: Context, callback: Callback): void {
        //Check the http request method 
        if (event.httpMethod !== "PUT") {
            callback(undefined, this.apiResponse.getApiErrorResponse(`${event.httpMethod} is an invalid http request method`, "400", "*", "application/json"));
            return;
        }

        //check if any parameter was passed
        if (!event.pathParameters || !event.pathParameters.id) {
            callback(undefined, this.apiResponse.getApiErrorResponse("parameter {id} not specified", "400", "*", "application/json"));
            return;
        }

        //check if any parameter was passed
        if (!event.body || event.body.length === 0) {
            callback(undefined, this.apiResponse.getApiErrorResponse("body not specified", "400", "*", "application/json"));
            return;
        }

        const data = JSON.parse(event.body);
        this.record = { id: event.pathParameters.id, fName: data.fName, lName: data.lName, userName : data.userName, 
            password: data.password, 
            token: data.token, phone : data.phone,
            email: data.email, createdDate : data.createdDate };

        this.updateParams = {
            TableName: this.tableName,
            Key: {
              id: this.record.id,
            },
            ExpressionAttributeValues: {
              ':fName': this.record.fName,
              ':lName': this.record.lName,
              ':userName': this.record.userName,
              ':password': this.record.password,
              ':token': this.record.token,
              ':phone': this.record.phone,
              ':email': this.record.email,
              ':createdDate': this.record.createdDate
            },
            UpdateExpression: 'SET fName = :fName, lName = :lName, userName :userName, password :password, token :token, phone :phone, email :email, createdDate :createdDate',
            ReturnValues: 'ALL_NEW',
          };

        this.lambdaApi.update(this.record, this.updateParams)
            .then(response => {
                callback(undefined, response);
            })
            .catch(err => {
                callback(undefined, err);
            });
    }

    public onHttpList(event: APIGatewayProxyEvent, context: Context, callback: Callback): void {
        //Check the http request method 
        if (event.httpMethod !== "GET") {
            callback(undefined, this.apiResponse.getApiErrorResponse(`${event.httpMethod} is an invalid http request method`, "400", "*", "application/json"));
            return;
        }

        this.lambdaApi.list()
            .then(response => {
                callback(undefined, response);
            })
            .catch(err => {
                callback(undefined, err);
            });
    }

}

