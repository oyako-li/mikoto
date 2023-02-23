interface Window {
    clearkerApi: {
        getStream(): Promise<any>;
        sendGCode(data:string): Promise<any>;
    }
}
declare var window: Window