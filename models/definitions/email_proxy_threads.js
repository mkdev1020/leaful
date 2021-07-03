const {
  DataTypes
} = require('sequelize');

module.exports = sequelize => {
  const attributes = {
    id: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: null,
      primaryKey: true,
      autoIncrement: false,
      comment: null,
      field: "id",
      unique: "id_UNIQUE"
    },
    users_id_a: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "users_id_a",
      references: {
        key: "id",
        model: "users_model"
      }
    },
    users_id_b: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "users_id_b",
      references: {
        key: "id",
        model: "users_model"
      }
    },
    last_activity: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "last_activity"
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
    tableName: "email_proxy_threads",
    comment: "",
    indexes: [{
      name: "fk_email_proxy_threads_users1_idx",
      unique: false,
      type: "BTREE",
      fields: ["users_id_a"]
    }, {
      name: "fk_email_proxy_threads_users2_idx",
      unique: false,
      type: "BTREE",
      fields: ["users_id_b"]
    }]
  };
  const EmailProxyThreadsModel = sequelize.define("email_proxy_threads_model", attributes, options);
  return EmailProxyThreadsModel;
};