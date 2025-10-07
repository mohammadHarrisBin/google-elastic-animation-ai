import { NextResponse } from "next/server";
import vision from "@google-cloud/vision";
import textToSpeech from "@google-cloud/text-to-speech";
import { getGCPCredentials } from "@/app/services/google";

export async function POST(req) {
  try {
    const { imageBase64 } = await req.json();

    // Initialize the Vision API client
    const client = new vision.ImageAnnotatorClient(getGCPCredentials());

    // Remove the data URI prefix if present (data:image/jpeg;base64,...)
    const base64Image = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    // Create the request with proper format
    const request = {
      image: {
        content: base64Image,
      },
    };

    // Perform text detection
    const [result] = await client.textDetection(request);

    // Check if text was found

    const detections = result.textAnnotations;
    // const text = detections && detections.length > 0
    //   ? detections[0].description
    //   : '';

    const text = result.fullTextAnnotation
      ? result.fullTextAnnotation.text
      : "";

    // get the bubble per-bubble sentence  coordinates
    // sample
    // "ocr_bubbles": [
    // {
    //   "text": "Where are you going?",
    //   "bbox": { "x": 0.2, "y": 0.3, "width": 0.4, "height": 0.05 }
    // },
    // {
    //   "text": "I'm going home.",
    //   "bbox": { "x": 0.25, "y": 0.45, "width": 0.35, "height": 0.05 }
    // }
    //]

    // per bubble not per word
    // each bubble is a sentence
    // each sentence has a bbox
    // bbox is the normalized coordinates of the sentence in the image

    const ocr_bubbles = [];
    if (result.fullTextAnnotation && result.fullTextAnnotation.pages) {
      const page = result.fullTextAnnotation.pages[0];

      for (const block of page.blocks) {
        for (const paragraph of block.paragraphs) {
          const paragraphText = paragraph.words
            .map((word) => word.symbols.map((s) => s.text).join(""))
            .join(" "); // join words into sentence

          const paragraphVertices = paragraph.boundingBox.vertices;
          const normalizedBBox = normalizeBBox(
            paragraphVertices,
            page.width,
            page.height
          );

          ocr_bubbles.push({
            text: paragraphText,
            bbox: normalizedBBox,
          });
        }
      }
    }

    console.log(ocr_bubbles);

    // const ocr_bubbles = detections && detections.length > 0
    //   ? detections.slice(1).map(det => ({
    //       text: det.description,
    //       bbox: normalizeBBox(det.boundingPoly.vertices, result.fullTextAnnotation.pages[0].width, result.fullTextAnnotation.pages[0].height)
    //     }))
    //   : [];

    // tts text to speech
    if (text) {
      const clientTTS = new textToSpeech.TextToSpeechClient(getGCPCredentials());
      const requestTTS = {
        input: { text },
        voice: { languageCode: "en-US", ssmlGender: "NEUTRAL" },
        audioConfig: { audioEncoding: "MP3" },
      };
      const [responseTTS] = await clientTTS.synthesizeSpeech(requestTTS);
      const audioContent = responseTTS.audioContent.toString("base64");

      // // comic panel Metadata
      // const panelMetadata = {
      //     comic_title: "Manhwa",
      //     panel_number: 1,
      // };

      // // save panel to elasticsearch
      // await savePanel({
      //     text,
      //     audioContent,
      // });

      return NextResponse.json({
        text,
        imageBase64,
        audioContent,
        ocr_bubbles,
      }); // audiocontent is send as "data:audio/mp3;base64,..." on frontend
    }

    return NextResponse.json({ text });
  } catch (error) {
    console.error("Google Vision API Error:", error);
    return NextResponse.json(
      { error: "Failed to process image", details: error.message },
      { status: 500 }
    );
  }
}

// normalize bubble coords to 0-1 range
function normalizeBBox(vertices, imageWidth, imageHeight) {
  const xs = vertices.map((v) => v.x || 0);
  const ys = vertices.map((v) => v.y || 0);

  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const maxX = Math.max(...xs);
  const maxY = Math.max(...ys);

  return {
    x: minX / imageWidth,
    y: minY / imageHeight,
    width: (maxX - minX) / imageWidth,
    height: (maxY - minY) / imageHeight,
  };
}
