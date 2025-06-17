declare module "agora-rtm-sdk" {
  export interface RtmMessage {
    text: string;
  }

  export interface RtmChannel {
    join(): Promise<void>;
    leave(): Promise<void>;
    sendMessage(message: RtmMessage): Promise<void>;
    on(event: "ChannelMessage", callback: (message: RtmMessage, senderId: string) => void): void;
  }

  export interface RTMClient {
    login(options: { uid: string }): Promise<void>;
    logout(): Promise<void>;
    createChannel(channelName: string): RtmChannel;
  }

  interface AgoraRTMStatic {
    createInstance(appId: string): RTMClient;
  }

  const AgoraRTM: AgoraRTMStatic;
  export default AgoraRTM;
}