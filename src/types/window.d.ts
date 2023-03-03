interface Window {
    clearkerApi: {
        get(data?:string): Promise<any>;
        post(data:string): Promise<any>;
    };
    streamApi: {
        stream(data:string | ArrayBuffer): boolean;
        voice(data:string | ArrayBuffer):  boolean;
    }
}
declare var window: Window