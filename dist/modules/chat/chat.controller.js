"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authentication_middleware_1 = require("../../middleware/authentication.middleware");
const chat_service_1 = require("./chat.service");
const chatRouter = (0, express_1.Router)({ mergeParams: true });
const chatService = new chat_service_1.CahtService();
chatRouter.get("/", (0, authentication_middleware_1.authentication)(), chatService.getChat);
exports.default = chatRouter;
