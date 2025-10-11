"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseRepositry = void 0;
class DatabaseRepositry {
    model;
    constructor(model) {
        this.model = model;
    }
    async create({ data, options, }) {
        return await this.model.create(data, options);
    }
    async findOne({ filter, select, options }) {
        const doc = this.model.findOne(filter).select(select || " ");
        if (options?.lean) {
            doc.lean(options.lean);
        }
        if (options?.populate) {
            doc.populate(options.populate);
        }
        return await doc.exec();
    }
    async updateOne({ filter, update, options }) {
        if (Array.isArray(update)) {
            update.push({
                $set: {
                    __v: { $add: ["$__v", 1] }
                }
            });
            return await this.model.updateMany(filter || {}, update, options);
        }
        return await this.model.updateOne(filter || {}, { ...update, $inc: { __v: 1 } }, options);
    }
    async updateMany({ filter, update, options }) {
        if (!filter || Object.keys(filter).length === 0) {
            throw new Error("Filter is required to prevent mass update.");
        }
        return await this.model.updateMany(filter, update, options);
    }
    async find({ filter, projection, options }) {
        return await this.model.find(filter, projection, options);
    }
    async findById({ id, projection, options }) {
        const doc = this.model.findById(id, projection, options);
        if (options?.lean) {
            doc.lean(options.lean);
        }
        return await doc.exec();
    }
    async findByIdAndUpdate({ id, update, options }) {
        return await this.model.findByIdAndUpdate(id, update, options);
    }
    async findOneAndUpdate({ filter, update, options }) {
        return await this.model.findOneAndUpdate(filter, update, options);
    }
    async deleteOne({ filter }) {
        return await this.model.deleteOne(filter);
    }
    async deleteMany({ filter }) {
        return await this.model.deleteMany(filter);
    }
    async paginate({ filter, projection = {}, options = {}, page = 1, size = 5 }) {
        page = Math.floor(page < 1 ? 1 : page);
        options.limit = Math.floor(size < 1 || !size ? 5 : size);
        options.skip = (page - 1) * options.limit;
        const result = await this.find({ filter, projection, options });
        return result;
    }
}
exports.DatabaseRepositry = DatabaseRepositry;
