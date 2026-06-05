import { useEffect, useState } from "react";
import turnersLogo from "../images/a83b5e3f-a33d-4090-a891-a54286e1fa49.png";
import "./App.css";

// backend lives on port 3001 while vite runs on port 5173
const PREDICTION_API_URL = "http://localhost:3001/api/predict";

const premiumInfo = {
  hatchback: {
    title: "Hatchback",
    range: "$900 - $1,150",
    reason:
      "Hatchbacks usually have lower values, smaller engines, and cheaper repair costs, so they are normally more budget friendly."
  },
  sedan: {
    title: "Sedan",
    range: "$1,000 - $1,400",
    reason:
      "Sedans are usually around the middle because they balance size and safety, but fancy or fast ones can cost more."
  },
  suv: {
    title: "SUV",
    range: "$1,200 - $1,600",
    reason:
      "SUVs can cost a bit more because they are bigger vehicles, but they usually have good safety and popular parts."
  },
  van: {
    title: "Van",
    range: "$1,200 - $1,700",
    reason:
      "Vans can have higher premiums because they carry more people and some parts can be more expensive to replace."
  },
  truck: {
    title: "Truck / Ute",
    range: "$1,600 - $2,000+",
    reason:
      "Trucks and utes are often more expensive because they can have higher repair costs and are stolen more often."
  }
};

const vehicleOptions = ["Hatchback", "Sedan", "SUV", "Van", "Truck / Ute"];

// turns Azure's confidence number into a nicer percent to read
function formatConfidence(value) {
  if (typeof value !== "number") {
    return "0%";
  }

  return `${value.toFixed(1)}%`;
}

function getVehicleKey(vehicleType) {
  const type = vehicleType.toLowerCase();

  if (type.includes("hatchback")) {
    return "hatchback";
  }

  if (type.includes("sedan")) {
    return "sedan";
  }

  if (type.includes("suv")) {
    return "suv";
  }

  if (type.includes("van")) {
    return "van";
  }

  if (type.includes("truck") || type.includes("ute")) {
    return "truck";
  }

  return "";
}

function getPremiumInfo(vehicleType) {
  const vehicleKey = getVehicleKey(vehicleType);

  if (premiumInfo[vehicleKey]) {
    return premiumInfo[vehicleKey];
  }

  return {
    title: vehicleType,
    range: "Not sure yet",
    reason: "I do not have a premium note for this vehicle type yet."
  };
}

function App() {
  // these keep track of the image, the preview, and whatever Azure sends back
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [bestPrediction, setBestPrediction] = useState(null);
  const [predictionList, setPredictionList] = useState([]);
  const [showPremium, setShowPremium] = useState(false);
  const [showCorrectionOptions, setShowCorrectionOptions] = useState(false);
  const [finalVehicleType, setFinalVehicleType] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const predictedVehicleKey = bestPrediction
    ? getVehicleKey(bestPrediction.tagName)
    : "";
  const premiumResult = finalVehicleType
    ? getPremiumInfo(finalVehicleType)
    : null;

  useEffect(() => {
    return () => {
      // cleans up the preview link when React is done with it
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function handleImageChange(event) { 
    const file = event.target.files[0];

    // clears the old result because this is a new image now
    setBestPrediction(null);
    setPredictionList([]);
    setShowPremium(false);
    setShowCorrectionOptions(false);
    setFinalVehicleType("");
    setErrorMessage("");

    if (!file) { // if the user cancels the file picker, just clear the preview and do nothing else
      setSelectedFile(null);
      setPreviewUrl("");
      return;
    }

    if (!file.type.startsWith("image/")) { // quick check to make sure it's an image file
      setSelectedFile(null);
      setPreviewUrl("");
      setErrorMessage("Please upload an image file.");
      return;
    }

    //// this makes the quick preview before the image gets sent to the backend
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!selectedFile) {
      setErrorMessage("Please choose a car image first.");
      return;
    }

    setIsLoading(true);
    setBestPrediction(null);
    setPredictionList([]);
    setShowPremium(false);
    setShowCorrectionOptions(false);
    setFinalVehicleType("");
    setErrorMessage("");

    try {
      // sending the file itself keeps the backend nice and simple
      const response = await fetch(PREDICTION_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": selectedFile.type || "application/octet-stream"
        },
        body: selectedFile
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "The image could not be checked.");
      }

      setBestPrediction(data.bestPrediction);
      setPredictionList(data.predictions || []);
    } catch (error) {
      setErrorMessage(error.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  }

  function handlePredictionCorrect() {
    // if Azure got it right, use that vehicle type for the premium bit
    setFinalVehicleType(bestPrediction.tagName);
    setShowCorrectionOptions(false);
    setShowPremium(false);
  }

  function handlePredictionWrong() {
    // lets the user choose a different type if Azure guessed wrong
    setFinalVehicleType("");
    setShowCorrectionOptions(true);
    setShowPremium(false);
  }

  function handleVehicleCorrection(vehicleType) {
    // this becomes the vehicle type used for the premium estimate
    setFinalVehicleType(vehicleType);
    setShowCorrectionOptions(false);
    setShowPremium(false);
  }

  return (
    <>
      <header className="site-nav">
        <a className="brand-logo" href="#top" aria-label="Turners Cars home">
          <img src={turnersLogo} alt="Turners Cars" />
        </a>

      </header>

      <main className="app-shell" id="top">
      <section className="intro-section">
        <h1>Car Checker 2000</h1>
        <p className="intro-copy">
          Upload a car image and the app will ask a person behind a computer what type
          of vehicle it sees.
        </p>
      </section>

      <section
        className={`workspace ${showPremium ? "show-premium-panel" : ""}`}
        id="checker"
      >
        <form className="upload-panel" onSubmit={handleSubmit}>
          <label className="upload-label" htmlFor="car-image">
            Car image
          </label>
          <input
            id="car-image"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
          />

          {previewUrl ? (
            <div className="preview-box">
              <img src={previewUrl} alt="Selected car preview" />
            </div>
          ) : (
            <div className="empty-preview">No image selected yet</div>
          )}

          <button type="submit" disabled={isLoading}>
            {isLoading ? "Calculating..." : "Check vehicle type"}
          </button>
        </form>

        <div className="result-panel" id="result">
          <h2>Prediction result</h2>

          {isLoading && <p className="status-message">Calculating... BRRR... BEEP...BOOP...</p>}

          {errorMessage && <p className="error-message">{errorMessage}</p>}

          {!isLoading && !errorMessage && bestPrediction && (
            <div className="prediction-result">
              <p className="result-label">Best match</p>
              <p className="vehicle-type">{bestPrediction.tagName}</p>
              <p className="confidence">
                Confidence: {formatConfidence(bestPrediction.probability)}
              </p>

              <div className="prediction-check">
                <p>Is this prediction correct?</p>
                <div className="prediction-actions">
                  <button type="button" onClick={handlePredictionCorrect}>
                    Yes
                  </button>
                  <button type="button" onClick={handlePredictionWrong}>
                    No
                  </button>
                </div>
              </div>

              {showCorrectionOptions && (
                <div className="correction-options">
                  <p>Pick the correct vehicle type:</p>
                  <div className="correction-buttons">
                    {vehicleOptions
                      .filter((option) => getVehicleKey(option) !== predictedVehicleKey)
                      .map((option) => (
                        <button
                          type="button"
                          key={option}
                          onClick={() => handleVehicleCorrection(option)}
                        >
                          {option}
                        </button>
                      ))}
                  </div>
                </div>
              )}

              {finalVehicleType && (
                <div className="final-vehicle">
                  <p>
                    Using <strong>{finalVehicleType}</strong> for the premium estimate.
                  </p>

                  {/* this opens the practice premium panel */}
                  <button
                    type="button"
                    className="premium-button"
                    onClick={() => setShowPremium(true)}
                  >
                    Calculate insurance premium
                  </button>
                </div>
              )}
            </div>
          )}

          {!isLoading && !errorMessage && !bestPrediction && (
            <p className="status-message">Your result will show here.</p>
          )}

          {predictionList.length > 0 && (
            <div className="prediction-list">
              <h3>All predictions</h3>
              <ul>
                {predictionList.map((prediction) => (
                  <li key={prediction.tagName}>
                    <span>{prediction.tagName}</span>
                    <strong>{formatConfidence(prediction.probability)}</strong>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {showPremium && premiumResult && (
          <div className="premium-panel">
            <p className="result-label">Premium estimate</p>
            <h2>{premiumResult.title}</h2>
            <p className="premium-range">{premiumResult.range}</p>
            <p className="premium-reason">{premiumResult.reason}</p>
            <p className="premium-note">
              This is only a practice estimate, not a real insurance quote.
            </p>
          </div>
        )}
      </section>
      </main>
    </>
  );
}

export default App;
