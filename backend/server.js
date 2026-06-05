import http from "node:http";
import { existsSync, readFileSync } from "node:fs";

function loadEnvFile() {
  const envFileUrl = new URL(".env", import.meta.url);

  if (!existsSync(envFileUrl)) {
    return {};
  }

  const envValues = {};
  const envLines = readFileSync(envFileUrl, "utf8").split(/\r?\n/);

  for (const line of envLines) {
    const trimmedLine = line.trim();

    if (!trimmedLine || trimmedLine.startsWith("#") || !trimmedLine.includes("=")) {
      continue;
    }

    const equalsIndex = trimmedLine.indexOf("=");
    const key = trimmedLine.slice(0, equalsIndex).trim();
    let value = trimmedLine.slice(equalsIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    envValues[key] = value;
  }

  return envValues;
}

const envValues = loadEnvFile();
const PORT = Number(process.env.PORT || envValues.PORT || 3001);
const PREDICTION_URL = process.env.PREDICTION_URL || envValues.PREDICTION_URL || "";
const PREDICTION_KEY = process.env.PREDICTION_KEY || envValues.PREDICTION_KEY || "";

const ALLOWED_FRONTEND_URLS = [
  "http://localhost:5173",
  "http://127.0.0.1:5173"
];
const MAX_UPLOAD_SIZE = 6 * 1024 * 1024; // 6MB limit for uploaded images

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

function setCorsHeaders(req, res) {
  const origin = req.headers.origin;
  const allowedOrigin = ALLOWED_FRONTEND_URLS.includes(origin)
    ? origin
    : ALLOWED_FRONTEND_URLS[0];

  res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function missingAzureConfig() {
  // quick check so fake config values do not get sent to Azure
  return (
    !PREDICTION_URL ||
    !PREDICTION_KEY ||
    PREDICTION_URL.includes("PASTE_YOUR") ||
    PREDICTION_KEY.includes("PASTE_YOUR")
  );
}

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let totalSize = 0;

    // this reads the uploaded image as raw bytes because we are not using express
    req.on("data", (chunk) => {
      totalSize += chunk.length;

      if (totalSize > MAX_UPLOAD_SIZE) {
        reject(new Error("Image is too large. Please upload an image under 6MB."));
        return;
      }

      chunks.push(chunk);
    });

    req.on("end", () => {
      resolve(Buffer.concat(chunks));
    });

    req.on("error", reject);
  });
}

const server = http.createServer(async (req, res) => {
  setCorsHeaders(req, res);
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/health") {
    sendJson(res, 200, { status: "Backend is running" });
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/predict") {
    try {
      if (missingAzureConfig()) {
        sendJson(res, 500, {
          error: "Azure Custom Vision details are missing in backend/.env."
        });
        return;
      }

      const imageBuffer = await readRequestBody(req);

      if (!imageBuffer.length) {
        sendJson(res, 400, { error: "No image was uploaded." });
        return;
      }

      // sends the same image bytes to Azure Custom Vision
      const azureResponse = await fetch(PREDICTION_URL, {
        method: "POST",
        headers: {
          "Prediction-Key": PREDICTION_KEY,
          "Content-Type": "application/octet-stream"
        },
        body: imageBuffer
      });

      const responseText = await azureResponse.text();

      if (!azureResponse.ok) {
        sendJson(res, 500, {
          error: "Azure prediction failed.",
          details: responseText
        });
        return;
      }

      const data = JSON.parse(responseText);
      const azurePredictions = Array.isArray(data.predictions)
        ? data.predictions
        : [];

      const predictions = azurePredictions
        .map((item) => ({
          tagName: item.tagName,
          probability: Math.round(item.probability * 1000) / 10
        }))
        .sort((a, b) => b.probability - a.probability);

      sendJson(res, 200, {
        bestPrediction: predictions[0] || null,
        predictions
      });
    } catch (error) {
      sendJson(res, 500, {
        error: error.message || "Something went wrong."
      });
    }

    return;
  }

  sendJson(res, 404, { error: "Route not found." });
});

server.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
