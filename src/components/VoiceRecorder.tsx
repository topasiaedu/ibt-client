import React, { useState, useRef } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

interface VoiceRecorderProps {
  setFile: (file: File) => void;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ setFile }) => {
  const [recording, setRecording] = useState<boolean>(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [outputURL, setOutputURL] = useState<string | null>(null);
  // const [format, setFormat] = useState<string>('ogg');
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  // const ffmpeg = useRef(new FFmpeg());

  // const loadFFmpeg = async () => {
  //   const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.3/dist/umd';
  //   const ffmpeg2 = ffmpeg.current;
  //   await ffmpeg2.load({
  //     coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
  //     wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
  //   });
  // };

  const startRecording = async () => {
    await load();
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder.current = new MediaRecorder(stream);
    mediaRecorder.current.ondataavailable = (event: BlobEvent) => {
      audioChunks.current.push(event.data);
    };
    mediaRecorder.current.onstop = () => {
      const audioBlob = new Blob(audioChunks.current, { type: "audio/mp3" });
      const audioUrl = URL.createObjectURL(audioBlob);
      setAudioURL(audioUrl);

      const audioFile = new File([audioBlob], "voice-message.mp3", {
        type: "audio/mp3",
      });
      setFile(audioFile);
      transcode(audioFile);
      audioChunks.current = [];
    };
    mediaRecorder.current.start();
    setRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorder.current) {
      mediaRecorder.current.stop();
      setRecording(false);
    }
  };

  // const convertAudio = async (audioFile: File) => {
  //   const ffmpeg2 = ffmpeg.current;
  //   const inputFileName = 'input.mp3';
  //   const outputFileName = `output.${format}`;
  //   ffmpeg2.writeFile(inputFileName, await fetchFile(audioFile));
  //   await ffmpeg2.exec(['-i', inputFileName, outputFileName]);
  //   const data = ffmpeg2.readFile(outputFileName);

  //   const mimeTypes: { [key: string]: string } = {
  //     ogg: 'audio/ogg; codecs=opus',
  //     mp3: 'audio/mpeg',
  //     amr: 'audio/amr',
  //     mp4: 'audio/mp4',
  //     aac: 'audio/aac',
  //   };

  //   const mimeType = mimeTypes[format] || 'application/octet-stream';
  //   const blob = new Blob([(data as any).buffer], { type: mimeType });
  //   const url = URL.createObjectURL(blob);
  //   setOutputURL(url);
  //   setFile(new File([blob], `converted.${format}`, { type: mimeType }));
  // };

  const ffmpegRef = useRef(new FFmpeg());

  const load = async () => {
    const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
    const ffmpeg = ffmpegRef.current;
    ffmpeg.on("log", ({ message }) => {
      console.log(message);
    });
    // toBlobURL is used to bypass CORS issue, urls with the same
    // domain can be used directly.
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(
        `${baseURL}/ffmpeg-core.wasm`,
        "application/wasm"
      ),
    });
  };

  const transcode = async (audioFile: File) => {
    const ffmpeg = ffmpegRef.current;
    await ffmpeg.writeFile("input.mp3", await fetchFile(audioFile));
    await ffmpeg.exec(["-i", "input.mp3", "output.ogg"]);
    const data = await ffmpeg.readFile("output.ogg");
    const result = URL.createObjectURL(
      new Blob([(data as any).buffer], { type: "audio/ogg; codecs=opus" })
    );
    console.log(result);
    setFile(new File([(data as any).buffer], "output.ogg", { type: "audio/ogg; codecs=opus" }));
  };

  return (
    <div>
      <h2>Voice Recorder</h2>
      <button onClick={startRecording} disabled={recording}>
        Start Recording
      </button>
      <button onClick={stopRecording} disabled={!recording}>
        Stop Recording
      </button>
      {audioURL && <audio src={audioURL} controls />}
      {outputURL && (
        <div>
          <h3>Converted Audio</h3>
          <audio src={outputURL} controls />
        </div>
      )}
    </div>
  );
};

export default VoiceRecorder;
