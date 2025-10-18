"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = exports.userSchema = exports.RoleEnum = exports.GenderEnum = void 0;
const mongoose_1 = require("mongoose");
const email_event_1 = __importDefault(require("../../utils/event/email.event"));
const hash_security_1 = require("../../utils/security/hash.security");
var GenderEnum;
(function (GenderEnum) {
    GenderEnum["male"] = "male";
    GenderEnum["female"] = "female";
})(GenderEnum || (exports.GenderEnum = GenderEnum = {}));
var RoleEnum;
(function (RoleEnum) {
    RoleEnum["user"] = "user";
    RoleEnum["admin"] = "admin";
    RoleEnum["superAdmin"] = "superAdmin";
})(RoleEnum || (exports.RoleEnum = RoleEnum = {}));
exports.userSchema = new mongoose_1.Schema({
    firstName: { type: String, required: true, minlength: 3, maxlength: 30 },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    confirmEmailOtp: { type: String },
    confirmAT: { type: String },
    password: { type: String, required: true },
    confirmPassword: { type: String },
    resetPasswordOtp: { type: String },
    changeCredentialTime: { type: Date },
    phonne: { type: String },
    adress: { type: String },
    friends: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "User" }],
    gender: { type: String, enum: GenderEnum, default: GenderEnum.male },
    role: { type: String, enum: RoleEnum, default: RoleEnum.user },
    age: { type: Number },
    createdAt: { type: Date },
    updatedAt: { type: Date },
    reStoreAt: { type: Date },
    reStoreBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
    freezeAT: { type: Boolean },
    freezeBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
    twoStepVerification: { type: Boolean, default: false },
    twoStepVerificationCode: { type: String },
    blockedUsers: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "User" }],
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    strictQuery: true
});
exports.userSchema.virtual("username").set(function (value) {
    const [firstName, lastName] = value.split(" ") || [];
    this.set({ firstName, lastName, });
}).get(function () {
    return this.firstName + " " + this.lastName;
});
exports.userSchema.pre("save", async function (next) {
    this.wasNew = this.isNew;
    if (this.isModified("password")) {
        this.password = await (0, hash_security_1.generateHash)(this.password);
    }
    if (this.isModified("confirmEmailOtp")) {
        console.log(this.confirmEmailOtpForHook);
        this.confirmEmailOtpForHook = this.confirmEmailOtp;
        console.log(this.confirmEmailOtpForHook);
        this.confirmEmailOtp = await (0, hash_security_1.generateHash)(this.confirmEmailOtp);
    }
    next();
});
exports.userSchema.post("save", async function (doc, next) {
    const that = this;
    if (that.wasNew && that.confirmEmailOtpForHook) {
        email_event_1.default.emit("confirmEmail", { to: this.email, otp: that.confirmEmailOtpForHook });
    }
    next();
});
exports.userSchema.pre("findOneAndUpdate", async function (next) {
    const update = this.getUpdate();
    if (update.twoStepVerificationCode) {
        this._twoStepVerificationCodeHook = update.twoStepVerificationCode;
        update.twoStepVerificationCode = await (0, hash_security_1.generateHash)(update.twoStepVerificationCode);
        this.setUpdate(update);
    }
    next();
});
exports.userSchema.post("findOneAndUpdate", async function (doc, next) {
    const otp = this._twoStepVerificationCodeHook;
    if (doc && otp) {
        email_event_1.default.emit("ahmednoshy", { to: doc.email, otp });
    }
    next();
});
exports.userSchema.pre(["find", "findOne"], function (next) {
    const query = this.getQuery();
    if (query.paranoid === false) {
        this.setQuery({ ...query });
    }
    else {
        this.setQuery({ ...query, freezeAT: { $exists: false } });
    }
    next();
});
exports.UserModel = mongoose_1.models.User || (0, mongoose_1.model)("User", exports.userSchema);
