import "../env";

import {
    Context,
    IssueRequest,
    RestCall,
    RestResult,
    RemoteCall,
    EventCall,
    EventResult,
    HttpCode
} from "../types";

import {
    ApiError
} from "../errors";

import {
    ContainerMetadata
} from "../metadata";

import {
    Service,
    Proxy
} from "../decorators";

export type ObjectType<T> = {
    new(): T;
} | Function;

export type Constructor<T> = T & {
    new(): T
};

export interface RemoteHandler {
    (ctx: Context, call: RemoteCall): Promise<any>;
}

export interface RestHandler {
    (ctx: Context, call: RestCall): Promise<[number, any, string]>;
}

export interface EventHandler {
    (ctx: Context, call: EventCall): Promise<any>;
}

export enum ContainerState {
    Pending = -1,
    Ready = 0,
    Reserved = 1,
    Busy = 2
}

export interface Container {
    register(resource: Object, name?: string): this;
    register(service: Service): this;
    register(proxy: Proxy): this;
    register(type: Function, ...args: any[]): this;

    publish(service: Function, ...args: any[]): this;
    publish(service: Service): this;

    state(): ContainerState;
    prepare(): Container;

    metadata(): ContainerMetadata;
    issueToken(req: IssueRequest): string;

    remoteCall(call: RemoteCall): Promise<any>;
    eventCall(call: EventCall): Promise<EventResult>;
    restCall(call: RestCall): Promise<RestResult>;
}

export interface HttpResponse {
    statusCode: HttpCode;
    headers: Record<string, string>;
    body: string;
}

export namespace HttpResponse {

    export function create(code: HttpCode, body: any, json?: boolean) {
        json = (json === undefined) ? true : json;
        if (typeof body !== "string") body = JSON.stringify(body);

        let response: HttpResponse = {
            statusCode: code,
            headers: {
                "access-control-allow-origin": "*",
                "access-control-allow-methods": "GET, POST, PUT, DELETE, PATCH",
                "content-type": json ? "application/json; charset=utf-8" : "text/plain; charset=utf-8"
            },
            body
        };
        if (!body) delete response.headers["content-type"];

        return response;
    }

    export function result(rest: RestResult): HttpResponse {
        let res = create(rest.statusCode, rest.body, true);
        Object.assign(res.headers, rest.headers || {});
        if (rest.contentType) res.headers["content-type"] = `${rest.contentType}; charset=utf-8`;
        return res;
    }

    export function error(error: Error): HttpResponse {
        let res: HttpResponse;
        if (error instanceof ApiError) {
            res = create(error.code, ApiError.serialize(error), true);
        } else {
            // TODO: Always json
            res = create(501, error.message || "Internal Server Error", false);
        }
        return res;
    }
}