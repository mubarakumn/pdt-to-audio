import { useState } from "react";
import "./App.css";

function App() {
  const [file, setFile] = useState(null);
  const [audioUrl, setAudioUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a PDF file");
      return;
    }

    const formData = new FormData();
    formData.append("pdf", file);

    try {
      setLoading(true);

      const res = await fetch("https://pdt-to-audio-8hzu.vercel.app/convert", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.audio) {
        setAudioUrl(data.audio);
      } else {
        alert(data.error || "Error occurred");
      }
    } catch (err) {
      console.error(err);
      alert("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h1 className="title">PDF to Audio</h1>
        <p className="subtitle">
          Convert your PDF documents into audio instantly
        </p>

        <div className="upload-box">
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files[0])}
          />
        </div>

        <button className="btn" onClick={handleUpload}>
          {loading ? "Processing..." : "Convert to Audio"}
        </button>

        {audioUrl && (
          <div className="result">
            <h3>Audio Output</h3>

            <audio controls src={audioUrl}></audio>

            <a href={audioUrl} download>
              <button className="download-btn">Download Audio</button>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;