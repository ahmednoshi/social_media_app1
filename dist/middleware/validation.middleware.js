"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validation = void 0;
const validation = (schema) => {
    return (req, res, next) => {
        const validationErrors = [];
        for (const key of Object.keys(schema)) {
            {
                if (!schema[key])
                    continue;
                if (req.file) {
                    req.body.attechment = req.file;
                }
                if (req.files) {
                    req.body.attechment = req.files;
                }
                const validationResult = schema[key].safeParse(req[key]);
                if (!validationResult.success) {
                    const errors = validationResult.error;
                    validationErrors.push({
                        key,
                        issues: errors.issues.map((issues) => {
                            return { message: issues.message, path: issues.path[0] };
                        })
                    });
                }
            }
        }
        if (validationErrors.length) {
            res.status(400).json({ message: "validation error", error: validationErrors, });
        }
        return next();
    };
};
exports.validation = validation;
