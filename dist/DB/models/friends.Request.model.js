"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.friendsRequestModel = exports.friendsRequestSchema = exports.statusEnum = void 0;
const mongoose_1 = require("mongoose");
var statusEnum;
(function (statusEnum) {
    statusEnum["pending"] = "pending";
    statusEnum["accepted"] = "accepted";
    statusEnum["rejected"] = "rejected";
})(statusEnum || (exports.statusEnum = statusEnum = {}));
exports.friendsRequestSchema = new mongoose_1.Schema({
    senderTo: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    createBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    accepted: { type: Date },
    createAt: Date,
    updateAt: { type: Date },
    status: { type: String, enum: statusEnum, default: statusEnum.pending }
}, { timestamps: true });
exports.friendsRequestModel = mongoose_1.models.Comment || (0, mongoose_1.model)("FriendsRequest", exports.friendsRequestSchema);
