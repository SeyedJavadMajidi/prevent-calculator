# PREVENT Calculator — React JSX + Tailwind

A responsive Persian RTL application built with React, JSX, Vite and Tailwind CSS. It runs calculations in the browser and does not send patient data to a server.

## Run locally

```bash
npm install
npm run dev
```

Build and test:

```bash
npm test
npm run build
```

## Implemented

- 10-year and (for ages 30–59) 30-year estimates.
- Five outcomes: total CVD, ASCVD, heart failure, coronary heart disease, and stroke.
- Female/male coefficients and validation for required inputs.
- Base simplified equations when no optional predictors are supplied; enhanced simplified equations when any UACR, HbA1c, or SDI value is entered.
- Missing-predictor indicators for enhanced-model inputs that are not available.
- Responsive RTL UI, CSV export, and client-side-only calculation.
- GitHub Actions workflow for tests and production build.

## Important clinical limitation

The coefficient tables are transcribed from the supplementary workbook supplied for this project (Tables S12E and S12J). The app's outputs are checked against the example values in that workbook, but have **not** been independently validated against the official AHA PREVENT calculator or its licensed source implementation. Do not use this app as the sole basis for clinical decisions or deploy it for patient care without independent clinical/statistical validation.

Official information: https://professional.heart.org/en/guidelines-and-statements/about-prevent-calculator
