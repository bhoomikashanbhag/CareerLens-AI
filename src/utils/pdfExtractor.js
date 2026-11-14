
import * as pdfjsLib from "pdfjs-dist";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { createWorker } from "tesseract.js";

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

export async function extractPdfText(file) {
  if (!file || file.type !== "application/pdf") {
    throw new Error("Please upload a valid PDF file.");
  }

  let ocrWorker = null;
  const extractedPages = [];

  try {
    const arrayBuffer = await file.arrayBuffer();

    const pdf = await pdfjsLib.getDocument({
      data: new Uint8Array(arrayBuffer),
    }).promise;

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
      const page = await pdf.getPage(pageNumber);

      // First, try extracting normal PDF text
      const textContent = await page.getTextContent();

      let pageText = textContent.items
        .map((item) => item.str || "")
        .join(" ")
        .trim();

      // If the page is scanned or has very little text, use OCR
      if (pageText.length < 30) {
        if (!ocrWorker) {
          ocrWorker = await createWorker("eng");
        }

        const viewport = page.getViewport({ scale: 2 });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);

        await page.render({
          canvas,
          canvasContext: context,
          viewport,
        }).promise;

        const result = await ocrWorker.recognize(canvas);
        pageText = result.data.text.trim();

        canvas.width = 0;
        canvas.height = 0;
      }

      extractedPages.push(
        `\n--- Page ${pageNumber} ---\n${pageText}`
      );
    }

    const finalText = extractedPages.join("\n");

    if (!finalText.trim()) {
      throw new Error(
        "No readable text found. Please upload a clearer PDF."
      );
    }

    return finalText;

  } catch (error) {
    console.error("PDF extraction error:", error);
    throw new Error(
      error.message || "Unable to read this PDF."
    );
  } finally {
    if (ocrWorker) {
      await ocrWorker.terminate();
    }
  }
}
