# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Health Report OCR Application designed to digitize paper-based health examination results submitted by employees to companies. The system extracts "notable findings" efficiently for automated reporting to government offices.

## Architecture

The application consists of three main components:

1. **Mobile Application (Client)**: Provides UI for camera capture, session management, data editing, and file generation
2. **Backend Server (BFF)**: Acts as intermediary between client and LLM API, manages API keys securely
3. **LLM API**: External service (Chat GPT-5 thinking API) for OCR and structured data extraction

## Data Flow

1. Mobile app captures health report images (multiple pages per session)
2. Images sent to backend server via `/process-health-report` endpoint
3. Backend forwards images with prompt to LLM API
4. LLM returns structured JSON data
5. User confirms/edits data in mobile app
6. Final data saved as Excel/CSV on device

## Output Format

- **File Format**: Excel (.xlsx) or CSV (.csv)
- **Structure**: Vertical format - one row per examination item
- **Filename Pattern**: `健康診断結果_{氏名}_{受診日}.xlsx`
- **Columns**: 氏名, 受診日, 検査項目, 値, 単位, 判定

## API Specifications

### Backend API
- **Endpoint**: `/process-health-report`
- **Method**: POST
- **Request**: multipart/form-data with image files
- **Response**: JSON from LLM processing

### LLM Response Structure
```json
{
  "受診者情報": {
    "氏名": "string",
    "受診日": "YYYY-MM-DD"
  },
  "検査結果": [
    {
      "項目名": "string",
      "値": "string",
      "単位": "string | null",
      "判定": "string | null"
    }
  ],
  "総合所見": {
    "総合判定": "string | null",
    "医師の所見": "string | null"
  }
}
```

## Key Requirements

- Maintain original order of examination items from source documents
- Extract all examination items without omission
- Use item names as they appear in the original documents
- Handle missing values with null
- Support multi-page health reports in single session

## Suppliment Requirements
- Please explain codes and setting files you generate before you require my admit.