import { InternalServerError } from "../errors";
import { Logger } from "../logger";
import { Class, Configuration, ContainerState, CoreInstance, EventRequest, EventResult, HttpRequest, HttpResponse, RemoteRequest, Security } from "../types";
import { Core } from "./core";

export class CorePool implements CoreInstance {
    protected log: Logger;

    private application: string;
    private name: string;

    private cstate: ContainerState;

    private registers: { target: any, args: any[] }[];
    private publishes: { service: any, args: any[] }[];

    private head: Core;
    private pool: Core[];

    private static count = 0;

    constructor(application: string, name?: string) {
        this.application = application;
        this.name = name || CorePool.name;
        this.log = Logger.get(application, this.name);
        this.cstate = ContainerState.Pending;
        this.registers = [];
        this.publishes = [];
        this.pool = [];
    }

    public get state(): ContainerState {
        return this.cstate;
    }

    public get config(): Configuration {
        if (this.cstate !== ContainerState.Ready) return undefined;
        return this.head.get<Configuration>(Configuration);
    }

    public get security(): Security {
        if (this.cstate !== ContainerState.Ready) return undefined;
        return this.head.get<Security>(Security);
    }

    public register(target: Object | Class, ...args: any[]): this {
        if (this.cstate !== ContainerState.Pending) throw new InternalServerError("Invalid container state");
        this.registers.push({ target, args });
        return this;
    }

    public publish(service: Object | Class, ...args: any[]): this {
        if (this.cstate !== ContainerState.Pending) throw new InternalServerError("Invalid container state");
        this.publishes.push({ service, args });
        return this;
    }

    public async prepare(): Promise<CoreInstance> {
        let instance = this.pool.find(x => x.state === ContainerState.Ready);
        if (!instance) {
            instance = new Core(this.application, "" + CorePool.count++);
            // TODO: Identity

            this.registers.forEach(u => instance.register(u.target));
            this.publishes.forEach(p => instance.publish(p.service));
            await instance.prepare();

            this.pool.push(instance);
            this.head = this.head || instance;
        }
        if (this.cstate === ContainerState.Pending)
            this.cstate = ContainerState.Ready;
        return instance;
    }

    public dispose(): void {
        if (this.cstate !== ContainerState.Ready) throw new InternalServerError("Invalid container state");
        this.pool = [this.head];
    }

    public async remoteRequest(req: RemoteRequest): Promise<any> {
        if (this.cstate !== ContainerState.Ready) throw new InternalServerError("Invalid container state");
        let instance = await this.prepare();
        return instance.remoteRequest(req);
    }

    public async eventRequest(req: EventRequest): Promise<EventResult> {
        if (this.cstate !== ContainerState.Ready) throw new InternalServerError("Invalid container state");
        let instance = await this.prepare();
        return instance.eventRequest(req);
    }

    public async httpRequest(req: HttpRequest): Promise<HttpResponse> {
        if (this.cstate !== ContainerState.Ready) throw new InternalServerError("Invalid container state");
        let instance = await this.prepare();
        return instance.httpRequest(req);
    }
}

