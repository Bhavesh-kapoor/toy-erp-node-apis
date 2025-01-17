class Service {
  static Model = null;

  static async create(data) {
    const doc = new this.Model(data);
    await doc.save();
    return doc;
  }

  /**
   * Fetch docs by ID or with filters.
   * @param {string | number} id - Doc ID.
   * @param {Object} filters - Query parameters for filtering and pagination.
   * @returns {Promise<Object>} - Paginated list of docs.
   */
  static async get(id, filters = {}, initialStage, extraStage) {
    if (!id) {
      return await this.Model.findAll(filters, initialStage, extraStage);
    }
    return await this.Model.findDocById(id);
  }

  static async getDocById(id, allowNull = false) {
    return await this.Model.findDocById(id, allowNull);
  }

  static async getSafe(id, filter = {}) {
    if (!id) {
      return await this.Model.findOne(filter);
    }
    return await this.Model.findById(id);
  }

  static async getWithAggregate(pipeline = []) {
    return await this.Model.aggregate(pipeline);
  }

  /**
   * Update an doc by ID.
   * @param {string} id- ID of the doc to update.
   * @param {Object} updates - Fields to update.
   * @returns {Promise<Object>} - Updated doc.
   */
  static async update(id, updates) {
    const doc = await this.Model.findDocById(id);
    doc.update(updates);
    await doc.save();
    return doc;
  }

  /**
   * Delete doc by ID.
   * @param {string} id - ID of the doc to delete.
   * @returns {Promise<Object>} - Deleted doc.
   */
  static async deleteDoc(id) {
    const deletedDoc = await this.Model.findDocById(id);

    // TODO: Implement proper delete after performing checks

    deletedDoc.deletedAt = new Date();
    await deletedDoc.save();
    return deletedDoc;
  }
}

export default Service;
