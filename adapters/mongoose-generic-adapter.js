const DatabaseAdapter = require('./database-adapter');
const mongoose = require('mongoose');

class MongooseGenericAdapter extends DatabaseAdapter {
    constructor(model, relations = []) {
        super();
        this.model = model;
        this.relations = relations; // Default relations to populate
    }

    async create(data) {
        const document = await this.model.create(data);
        return this.transformDocument(document);
    }

    async getAll(query = {}) {
        const documents = await this.model.find(query);
        return documents.map(doc => this.transformDocument(doc));
    }

    async getAllWithRelations(query = {}, relations = []) {
        const populateFields = relations.length ? relations : this.relations;
        const documents = populateFields.length
            ? await this.model.find(query).populate(populateFields)
            : await this.model.find(query);
        return documents.map(doc => this.transformDocument(doc));
    }

    async getById(id) {
        const document = await this.model.findById(id);
        return document ? this.transformDocument(document) : null;
    }

    async getByIdWithRelations(id, relations = []) {
        const populateFields = relations.length ? relations : this.relations;
        const document = populateFields.length
            ? await this.model.findById(id).populate(populateFields)
            : await this.model.findById(id);
        return document ? this.transformDocument(document) : null;
    }

    async update(id, data) {
        const updatedDocument = await this.model.findByIdAndUpdate(id, data, { new: true });
        return updatedDocument ? this.transformDocument(updatedDocument) : null;
    }

    async remove(id) {
        const deletedDocument = await this.model.findByIdAndUpdate(id, { deletedAt: new Date() }, { new: true });
        return deletedDocument ? this.transformDocument(deletedDocument) : null;
    }

    /**
     * Start a MongoDB Transaction Session
     */
    async startTransaction() {
        const session = await mongoose.startSession();
        session.startTransaction();
        return {
            session,
            commit: async () => await session.commitTransaction(),
            rollback: async () => await session.abortTransaction(),
            end: async () => await session.endSession()
        };
    }

    /**
     * Apply `toJSON()` transformation to the main document and its populated fields.
     */
    transformDocument(doc) {
        if (!doc) return null;

        // Convert root document
        const transformedDoc = doc.toJSON();

        // Extract the main object without populated fields
        const { ...mainObject } = transformedDoc;

        // Loop through all fields and manually reassign populated fields
        Object.keys(transformedDoc).forEach(key => {
            const field = doc[key]; // Get the actual populated field from the original document

            if (typeof field === 'object' && field !== null) {
                // If it's an array of populated objects, apply `toJSON()` to each
                if (Array.isArray(field)) {
                    mainObject[key] = field.map(item => (item.toJSON ? item.toJSON() : item));
                }
                // If it's a single populated object, apply `toJSON()`
                else if (typeof field.toJSON === 'function') {
                    mainObject[key] = field.toJSON();
                } else {
                    mainObject[key] = field; // Keep the value as it is if not transformable
                }
            }
        });

        return mainObject;
    }
}

module.exports = MongooseGenericAdapter;
