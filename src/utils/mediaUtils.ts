export function cleanupMediaStreams() {
  document.querySelectorAll("video, audio").forEach((el: any) => {
    if (el.srcObject) {
      (el.srcObject as MediaStream).getTracks().forEach((track: MediaStreamTrack) => {
        if (track.readyState === "live") {
          track.stop();
        }
      });
      el.srcObject = null;
    }
  });
}
