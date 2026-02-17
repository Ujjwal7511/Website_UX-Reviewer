# AI Notes

## LLM and Provider

This application uses **Groq** as the LLM provider with the **llama-3.3-70b-versatile** model (or `llama-3.1-70b-versatile` as fallback).

### Why Groq?

- **Fast inference**: Groq provides extremely fast LLM inference speeds, making real-time UX analysis possible
- **Competitive pricing**: Cost-effective for the use case
- **Easy integration**: Simple API via the `groq-sdk` npm package

## What AI Was Used For

1. **UX Analysis**: The core feature uses AI to analyze website HTML and provide:
   - Overall UX score (1-10)
   - Categorized issues (clarity, layout, navigation, accessibility, trust)
   - Evidence for each issue
   - Before/after recommendations for top 3 issues

2. **Prompt Engineering**: Custom prompt designed to output structured JSON with:
   - 8-12 issues across categories
   - Specific evidence from the HTML
   - Actionable improvement suggestions

## What Was Checked Manually

1. **API Key Configuration**: Verified GROQ_API_KEY is properly loaded from environment
2. **Model Availability**: Checked that the default model is not decommissioned
3. **Error Handling**: Verified proper error messages for:
   - Invalid URLs
   - Network failures
   - API errors
   - Rate limiting
4. **Fallback Behavior**: Confirmed app handles missing optional features (like Puppeteer screenshots)
5. **Input Validation**: Both client-side (URLInput.jsx) and server-side validation for URLs
6. **Status Endpoint**: Verified /api/status correctly reports backend, database, and LLM health

## Technical Details

- **API Endpoint**: `https://api.groq.com/openai/v1/chat/completions`
- **Max Tokens**: 2048
- **Temperature**: 0.3 (for consistent, deterministic outputs)
- **Context**: HTML excerpt (first 10,000 characters) stripped of scripts and styles
