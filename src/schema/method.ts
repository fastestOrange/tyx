// tslint:disable-next-line:import-name
import Lo = require('lodash');
import { Metadata } from '../decorators/schema';
import { Field } from '../decorators/type';
import { ResolverArgs, SchemaResolvers } from '../graphql/types';
import { IApiMetadata } from '../metadata/api';
// tslint:disable-next-line:max-line-length
import { DesignMetadata, EventRouteMetadata, HttpAdapter, HttpBinder, HttpBindingMetadata, HttpBindingType, HttpRouteMetadata, IMethodMetadata } from '../metadata/method';
import { IInputMetadata, IResultMetadata, Select } from '../metadata/type';
import { Class } from '../types/core';
import { EventAdapter } from '../types/event';
import { HttpCode } from '../types/http';
import { Roles } from '../types/security';
import { Utils } from '../utils';
import { ApiMetadataSchema } from './api';
import { InputMetadataSchema, ResultMetadataSchema } from './type';

@Metadata()
export class HttpBindingMetadataSchema implements HttpBindingMetadata {
  @Field(String) type: HttpBindingType;
  @Field() path: string;
  @Field(String) binder: HttpBinder;

  public static binder(obj: HttpBindingMetadata): string {
    return obj.binder && `[function: ${obj.binder.toString()}]`;
  }
}

@Metadata()
export class HttpRouteMetadataSchema implements HttpRouteMetadata {
  @Field(String) target: Class;
  @Field(ref => ApiMetadataSchema) api: IApiMetadata;
  @Field(ref => MethodMetadataSchema) method: IMethodMetadata;

  @Field() route: string;
  @Field() alias: string;
  @Field() handler: string;
  @Field() verb: string;
  @Field() resource: string;
  @Field() model: string;
  @Field([String]) params: string[];
  @Field(0) code: HttpCode;
  @Field(String) adapter: HttpAdapter;
  // Relations
  // api: ApiMetadata;
  // method: MethodMetadata;

  public static target(obj: HttpRouteMetadata, args: ResolverArgs): string {
    return obj.target && `[class: ${obj.target.name}]`;
  }

  public static adapter(obj: HttpRouteMetadata): string {
    return obj.adapter && `[function: ${obj.adapter.toString()}]`;
  }
}

@Metadata()
export class EventRouteMetadataSchema implements EventRouteMetadata {
  @Field(String) target: Class;
  @Field(ref => ApiMetadataSchema) api: IApiMetadata;
  @Field(ref => MethodMetadataSchema) method: IMethodMetadata;

  @Field() route: string;
  @Field() alias: string;
  @Field() handler: string;
  @Field() source: string;
  @Field() resource: string;
  @Field() objectFilter: string;
  @Field() actionFilter: string;
  @Field(String) adapter: EventAdapter;

  public static target(obj: EventRouteMetadata, args: ResolverArgs): string {
    return obj.target && `[class: ${obj.target.name}]`;
  }

  public static adapter(obj: EventRouteMetadata): string {
    return obj.adapter && `[function: ${obj.adapter.toString()}]`;
  }
}

@Metadata()
export class MethodMetadataSchema implements IMethodMetadata {
  @Field() target: Class;
  @Field(ref => ApiMetadataSchema) api: IApiMetadata;
  @Field(String) host: Class;

  @Field() alias: string;
  @Field() name: string;
  @Field(Object) design: DesignMetadata[];

  @Field() auth: string;
  @Field(Object) roles: Roles;

  @Field() query: boolean;
  @Field() mutation: boolean;
  @Field() resolver: boolean;
  @Field(ref => InputMetadataSchema) input: IInputMetadata;
  @Field(ref => ResultMetadataSchema) result: IResultMetadata;
  @Field(Object) select: Select;

  @Field() contentType: string;
  @Field(list => [HttpBindingMetadataSchema]) bindings: HttpBindingMetadata[];
  @Field(list => [HttpRouteMetadataSchema]) http: Record<string, HttpRouteMetadata>;
  @Field(list => [EventRouteMetadataSchema]) events: Record<string, EventRouteMetadata>;

  @Field() source: string;

  public static RESOLVERS: SchemaResolvers<IMethodMetadata> = {
    target: obj => Utils.value(obj.target),
    host: obj => Utils.value(obj.host),
    http: (obj, args) => Lo.filter(Object.values(obj.http || {}), args),
    events: (obj, args) => Lo.filter(Object.values(obj.events || {}), args),
    source: obj => obj.target.prototype[obj.name].toString(),
  };
}
