// Basic DOM media cleanup (browser-native)
export function cleanupMediaStreams() {
  document.querySelectorAll("video, audio").forEach((el) => {
    const mediaElement = el as HTMLMediaElement;
    const stream = mediaElement.srcObject as MediaStream | null;

    if (stream) {
      stream.getTracks().forEach((track) => {
        if (track.readyState === "live") {
          track.stop(); // Stop browser media tracks
        }
      });
      mediaElement.srcObject = null;
    }
  });
}

// Unified robust media cleanup utility
export async function fullMediaCleanup({
  client,
  localTracks,
  localCameraTrack,
  localMicrophoneTrack,
}: {
  client?: any;
  localTracks?: Array<any>;
  localCameraTrack?: any;
  localMicrophoneTrack?: any;
} = {}) {
  try {
    if (client && typeof client.leave === 'function') {
      await client.leave();
    }
    // Clean up all tracks in localTracks
    if (localTracks && Array.isArray(localTracks)) {
      localTracks.forEach((track) => {
        if (track) {
          if (typeof track.close === 'function') track.close();
          if (typeof track.stop === 'function') track.stop();
          if (track.track && typeof track.track.stop === 'function') track.track.stop();
        }
      });
    }
    // Clean up camera/mic tracks if provided
    if (localCameraTrack) {
      if (typeof localCameraTrack.close === 'function') localCameraTrack.close();
      if (typeof localCameraTrack.stop === 'function') localCameraTrack.stop();
    }
    if (localMicrophoneTrack) {
      if (typeof localMicrophoneTrack.close === 'function') localMicrophoneTrack.close();
      if (typeof localMicrophoneTrack.stop === 'function') localMicrophoneTrack.stop();
    }
    // Remove global reference if used
    if (typeof window !== 'undefined' && window._agora) {
      window._agora = undefined;
    }
  } catch (err) {
    console.warn('Error during full media cleanup:', err);
  }
  cleanupMediaStreams();
}

declare global {
  interface Window {
    _agora?: {
      client?: any;
      localTracks?: Array<any>;
      localCameraTrack?: any;
      localMicrophoneTrack?: any;
    };
  }
}
