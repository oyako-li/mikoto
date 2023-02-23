interface Window {
    clearkerApi: {
        get(data?:string): Promise<any>;
        post(data:string): Promise<any>;
    }
}
declare var window: Window