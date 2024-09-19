import useSpeechRecognition from "../hooks/useSpeechRecognition";

function VoiceChat2() {
  const {
    text,
    startListening,
    stopListening,
    isListening,
    hasRecognitionSupport,
  } = useSpeechRecognition();
  return (
    <div>
      {hasRecognitionSupport ? (
        <>
          <div>
            <button onClick={startListening}>Start Listening</button>
            <button onClick={stopListening}>Stop Listening</button>
          </div>
          {isListening ? <div> Your browser is currently listening</div> : null}
          {text}
        </>
      ) : (
        <h1>Your Browser doesn&apos;t have speech recognition support</h1>
      )}
    </div>
  );
}

export default VoiceChat2;
