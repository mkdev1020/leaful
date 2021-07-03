const {
  DataTypes
} = require('sequelize');

module.exports = sequelize => {
  const attributes = {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: null,
      primaryKey: true,
      autoIncrement: true,
      comment: null,
      field: "id"
    },
    record_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "record_date"
    },
    record_type: {
      type: DataTypes.ENUM('impression', 'click'),
      allowNull: false,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "record_type"
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "created_at"
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "updated_at"
    },
    users_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "users_id",
      references: {
        key: "id",
        model: "users_model"
      }
    },
    advertisements_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "advertisements_id",
      references: {
        key: "id",
        model: "advertisements_model"
      }
    }
  };
  const options = {
    tableName: "advertisements_records",
    comment: "",
    indexes: [{
      name: "fk_advertisements_records_advertisements1_idx",
      unique: false,
      type: "BTREE",
      fields: ["advertisements_id"]
    }, {
      name: "fk_advertisements_records_users1_idx",
      unique: false,
      type: "BTREE",
      fields: ["users_id"]
    }]
  };
  const AdvertisementsRecordsModel = sequelize.define("advertisements_records_model", attributes, options);
  return AdvertisementsRecordsModel;
};