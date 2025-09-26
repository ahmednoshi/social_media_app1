"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signUp = void 0;
const zod_1 = require("zod");
exports.signUp = {
    body: zod_1.z.object({
        firstName: zod_1.z.string({ error: "first name is required" }).min(3, { error: "first name must be at least 3 characters" }).max(30),
        lastName: zod_1.z.string({ error: "last name is required" }),
        email: zod_1.z.string().email({ error: "valid email is required" }),
        password: zod_1.z.string({ error: "password is required" }).min(6, { error: "password must be at least 6 characters" }).max(20),
        confirmPassword: zod_1.z.string({ error: "confirm password is required" }).min(6, { error: "password must be at least 6 characters" }).max(20),
    }).refine((data) => {
        return data.password === data.confirmPassword;
    }, {
        error: "passwords do not match",
        path: ["confirmPassword"]
    })
};
