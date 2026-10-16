# PREVENT Calculator — React JSX + Tailwind

A responsive Persian RTL interface built with React, JSX, Vite and Tailwind CSS.

## Run locally
```bash
npm install
npm run dev
```

Build with `npm run build`.

## Current implementation scope
- Simplified base PREVENT equations from the user-provided supplemental workbook: 10-year CVD, ASCVD and heart-failure estimates.
- 30-year base estimates for ages 30–59.
- Female/male coefficient selection, input validation, responsive RTL UI, and CSV export.
- Calculations run locally in the browser; no patient data is sent to a server.

## Important limitations
This is **not yet a complete official AHA PREVENT calculator**. Optional UACR, HbA1c and SDI model variants are not implemented, and official-source validation against reference test cases is still required. Do not use as the sole basis for clinical decisions. The official AHA page says access to the official PREVENT source code is subject to accepting its license terms: https://professional.heart.org/en/guidelines-and-statements/about-prevent-calculator

The equations and coefficients in `src/prevent.js` are from the simplified base tables S12A and S12F in the supplied supplementary workbook. Verify all results independently before clinical deployment.