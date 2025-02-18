const DatabaseAdapter = require('./database-adapter');

class MongooseGenericAdapter extends DatabaseAdapter {
    constructor(model) {
        super();
        this.model = model;
    }

    async create(data) {
        return (await this.model.create(data)).toJSON();
    }

    async getAll(query = {}) {
        const results = await this.model.find(query);
        return results.map(result => result.toJSON());
    }

    async getById(id) {
        const result = await this.model.findById(id);
        return result ? result.toJSON() : null;
    }

    async update(id, data) {
        const updated = await this.model.findByIdAndUpdate(id, data, { new: true });
        return updated ? updated.toJSON() : null;
    }

    async remove(id) {
        return await this.model.findByIdAndUpdate(id, { deletedAt: new Date() }, { new: true });
    }
}

module.exports = MongooseGenericAdapter;
