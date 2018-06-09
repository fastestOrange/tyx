import Lo from "lodash";
import { Field, Metadata } from "../decorators/type";
import { SchemaResolvers } from "../graphql/types";
import { IProxyMetadata } from "../metadata/proxy";
import { HandlerMetadata, InjectMetadata } from "../metadata/service";
import { Class } from "../types/core";
import { Utils } from "../utils";
import { HandlerMetadataSchema, InjectMetadataSchema } from "./service";

@Metadata()
export class ProxyMetadataSchema implements IProxyMetadata {
    @Field(String) target: Class;
    @Field(String) name: string;
    @Field(String) alias: string;
    @Field(String) application: string = undefined;
    @Field(String) functionName: string = undefined;

    @Field(list => [InjectMetadataSchema]) dependencies: Record<string, InjectMetadata>;
    @Field(item => [HandlerMetadataSchema]) handlers: Record<string, HandlerMetadata>;

    @Field(ref => HandlerMetadataSchema) initializer: HandlerMetadata;
    @Field(ref => HandlerMetadataSchema) selector: HandlerMetadata;
    @Field(ref => HandlerMetadataSchema) activator: HandlerMetadata;
    @Field(ref => HandlerMetadataSchema) releasor: HandlerMetadata;

    @Field(String) source: string;

    public static RESOLVERS: SchemaResolvers<IProxyMetadata> = {
        target: (obj) => Utils.value(obj.target),
        dependencies: (obj, args) => Lo.filter(Object.values(obj.dependencies), args),
        handlers: (obj, args) => Lo.filter(Object.values(obj.handlers), args),

        source: (obj) => obj.target.toString()
    };
}