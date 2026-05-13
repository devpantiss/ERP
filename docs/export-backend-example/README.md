# Backend Export Example

Use this pattern when the filtered result can be thousands of rows, when the export must include fields not sent to the UI, or when audit/security rules require server-side generation.

Recommended backend libraries:

- `exceljs` for streamed Excel generation.
- `pdfkit` for streamed PDF generation.
- MongoDB/Mongoose cursors for memory-safe row iteration.

Install in the backend package:

```bash
npm install exceljs pdfkit
```

Mount the route:

```js
import exportRoutes from "./exportRoutes.js";

app.use("/api/exports", exportRoutes);
```

Frontend download call:

```js
async function downloadServerExport({ module, format, params, token }) {
  const query = new URLSearchParams(params).toString();
  const response = await fetch(`/api/exports/${module}/${format}?${query}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) throw new Error("Export failed");

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${module}.${format === "excel" ? "xlsx" : "pdf"}`;
  link.click();
  URL.revokeObjectURL(url);
}
```

Keep `EXPORT_CONFIG` server-owned. Do not accept arbitrary MongoDB filters, model names, field paths, or column lists from the browser.
