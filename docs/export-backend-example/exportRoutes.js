import express from "express";
import { buildMongoFilter, streamExcelExport, streamPdfExport } from "./exportService.js";
import { requireAuth, requirePermission } from "./middleware.js";
import { User } from "./models/User.js";

const router = express.Router();

const EXPORT_CONFIG = {
  users: {
    model: User,
    moduleName: "User Management",
    searchableFields: ["name", "email", "center", "role"],
    allowedFilters: ["role", "status", "center"],
    columns: [
      { key: "name", header: "Name" },
      { key: "role", header: "Role" },
      { key: "center", header: "Center" },
      { key: "status", header: "Status" },
      { key: "email", header: "Email" },
      { key: "createdAt", header: "Joined", type: "date", excelFormat: "dd mmm yyyy" },
    ],
  },
};

router.get(
  "/:module/:format",
  requireAuth,
  requirePermission("export:data"),
  async (req, res, next) => {
    try {
      const config = EXPORT_CONFIG[req.params.module];
      const format = req.params.format;

      if (!config || !["pdf", "excel"].includes(format)) {
        return res.status(404).json({ message: "Unsupported export request." });
      }

      const safeFilters = {};
      config.allowedFilters.forEach((key) => {
        if (req.query[key]) safeFilters[key] = req.query[key];
      });

      const mongoFilter = buildMongoFilter({
        search: req.query.search,
        filters: safeFilters,
        searchableFields: config.searchableFields,
      });

      const selectedIds = String(req.query.ids || "")
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean);

      if (selectedIds.length) {
        mongoFilter._id = { $in: selectedIds };
      }

      const cursor = config.model
        .find(mongoFilter)
        .select(config.columns.map((column) => column.key).join(" "))
        .lean()
        .cursor();

      const fileName = `${req.params.module}_${new Date().toISOString().slice(0, 10)}`;

      if (format === "excel") {
        return streamExcelExport({
          res,
          rows: cursor,
          columns: config.columns,
          moduleName: config.moduleName,
          fileName,
        });
      }

      return streamPdfExport({
        res,
        rows: cursor,
        columns: config.columns,
        moduleName: config.moduleName,
        fileName,
      });
    } catch (error) {
      return next(error);
    }
  }
);

export default router;
