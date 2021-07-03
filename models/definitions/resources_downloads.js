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
    users_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
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
    resources_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "resources_id",
      references: {
        key: "id",
        model: "resources_model"
      }
    },
    referrals_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "referrals_id",
      references: {
        key: "id",
        model: "referrals_model"
      }
    },
    ip_address: {
      type: DataTypes.STRING(45),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "ip_address"
    },
    download_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "download_date"
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
    }
  };
  const options = {
    tableName: "resources_downloads",
    comment: "",
    indexes: [{
      name: "fk_resources_downloads_resources1_idx",
      unique: false,
      type: "BTREE",
      fields: ["resources_id"]
    }, {
      name: "fk_resources_downloads_users1_idx",
      unique: false,
      type: "BTREE",
      fields: ["users_id"]
    }, {
      name: "fk_resources_downloads_referrals1_idx",
      unique: false,
      type: "BTREE",
      fields: ["referrals_id"]
    }]
  };
  const ResourcesDownloadsModel = sequelize.define("resources_downloads_model", attributes, options);
  return ResourcesDownloadsModel;
};