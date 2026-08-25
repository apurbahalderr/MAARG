# Computer Vision (CV) Module

## Purpose
This module verifies field-reported incident images to prevent fake or irrelevant reports. It utilizes **Gemini 1.5 Flash (Vision-Language Model)**.

## How it Works
1. Accepts an image (e.g., a photo taken by a driver) and the text they submitted.
2. Sends both to the Gemini VLM with a structured prompt.
3. Classifies the image into predefined categories (Landslide, Flooded Road, Damaged Bridge, Clear Road).
4. Returns a JSON object with a `VERIFIED` or `REJECTED` status, the detected disaster type, and a confidence score.

## Files
* `verify.py`: Main execution script containing the Gemini API call and fallback mechanisms.
