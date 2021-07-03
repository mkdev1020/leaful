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
    login: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: 1,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "login"
    },
    download: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: 1,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "download"
    },
    upload: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: 1,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "upload"
    },
    editing: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: 1,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "editing"
    },
    controls: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: 1,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "controls"
    },
    income: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: 1,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "income"
    },
    payouts: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: 1,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "payouts"
    },
    payments: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: 1,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "payments"
    },
    advertise: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: 1,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "advertise"
    },
    messages: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: 1,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "messages"
    },
    follow: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: 1,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "follow"
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
    tableName: "users_permissions",
    comment: "",
    indexes: [{
      name: "fk_users_permissions_users_idx",
      unique: false,
      type: "BTREE",
      fields: ["users_id"]
    }]
  };
  const UsersPermissionsModel = sequelize.define("users_permissions_model", attributes, options);
  return UsersPermissionsModel;
};