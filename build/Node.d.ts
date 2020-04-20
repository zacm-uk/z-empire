import { StorageDriverType } from './Storage';
import { IStorage } from './storage-drivers';
export declare enum NodeType {
    STORAGE = "STORAGE",
    CLIENT = "CLIENT"
}
export declare type NodeOpts = {
    type: NodeType;
    storageDriver: StorageDriverType;
    port?: number;
    nodeList?: string[];
    publicAddress?: string;
    hidden?: boolean;
};
export declare class Node {
    readonly type: NodeType;
    readonly started: string;
    nodeList: Set<string>;
    storage: IStorage;
    publicAddress: string;
    hidden: boolean;
    lastUpdate: string;
    constructor({ type, storageDriver, port, nodeList, publicAddress, hidden }: NodeOpts);
    getInfo(): Promise<{
        publicAddress: string;
        started: string;
        version: any;
        type: NodeType;
    }>;
    getData(storageKey: string): Promise<import("./storage-drivers").StorageItem>;
    removeData(storageKey: string, awaitReplicate?: boolean): Promise<void>;
    setData(key: string, value: string, awaitReplicate?: boolean): Promise<{
        storageKey: string;
    }>;
    updateData(storageKey: string, value: string, awaitReplicate?: boolean): Promise<{
        storageKey: string;
    }>;
    createReplicateRequest({ storageKey }?: {
        storageKey?: string | null;
    }): Promise<{
        lastUpdate: string;
        data: import("./storage-drivers").StorageItem[];
    }>;
    makeNodeRequest({ request, body, ip, query }: {
        request: string;
        body?: string;
        ip: string;
        query?: string;
    }): Promise<unknown>;
    requestUpdates({ storageKey }?: {
        storageKey?: string;
    }): Promise<void>;
    updateNodes(): Promise<void>;
    receiveUpdate({ data }: {
        data: any[];
    }): Promise<void>;
    static TYPES: {
        [key: string]: NodeType;
    };
}
//# sourceMappingURL=Node.d.ts.map