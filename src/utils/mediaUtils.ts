export function cleanupMediaStreams() {
  document.querySelectorAll("video, audio").forEach((el) => {
    const mediaElement = el as HTMLMediaElement; // Explicitly cast to HTMLMediaElement
    if (mediaElement.srcObject) {
      (mediaElement.srcObject as MediaStream).getTracks().forEach((track: MediaStreamTrack) => {
        if (track.readyState === "live") {
          track.stop();
        }
      });
      mediaElement.srcObject = null;
    }
  });
}
