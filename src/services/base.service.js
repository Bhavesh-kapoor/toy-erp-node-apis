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
  static async get(id, filters = {}) {
    if (!id) {
      return await this.Model.findAll(filters);
    }
    return await this.Model.findDocById(id);
  }

  static async getDocById(id, allowNull = false) {
    return await this.Model.findDocById(id, allowNull);
  }

  static async getDoc(filter = {}, allowNull = false) {
    const data = await this.Model.findDoc(filter, allowNull);
    return data;
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
    await deletedDoc.deleteOne();
    return deletedDoc;
  }
}

export default Service;
