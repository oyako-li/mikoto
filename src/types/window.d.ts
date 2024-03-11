interface Window extends Window {
  micotoApi?: {
    get(data?: string): Promise<any>;
    post(data: string): Promise<any>;
    voice(data: any): Promise<any>;
    stream(data: any): Promise<any>;
    command(data: string): Promise<any>;
    speak(callback: any): any;
    embody(callback: any): any;
  };
  webkitSpeechRecognition: any;
  SpeechRecognition: any;
}
declare var window: Window;
