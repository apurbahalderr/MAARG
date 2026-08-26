# Natural Language Processing (NLP) Module

## Purpose
This module handles the extraction of structured data from messy, unstructured text reports submitted by field workers, and generates multilingual alerts for drivers.

## How it Works
1. **Parser (`parser.py`)**: Uses keyword dictionaries and Regex to identify:
   * **Cause**: Flood, Landslide, Blockage, etc.
   * **Severity**: Critical, High, Moderate.
   * **Location**: Extracts clues like "km 42" or "near Shillong".
2. **Translator (`translator.py`)**: Converts the generated English alert into local NER languages (Hindi, Assamese) to ensure drivers understand the warnings.

## Files
* `parser.py`: Offline text extraction logic.
* `translator.py`: Multilingual translation integration.
