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
    email_proxy_threads_id: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "email_proxy_threads_id",
      references: {
        key: "id",
        model: "email_proxy_threads_model"
      }
    },
    users_id_from: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "users_id_from",
      references: {
        key: "id",
        model: "users_model"
      }
    },
    message: {
      type: DataTypes.STRING(5000),
      allowNull: false,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "message"
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
    tableName: "support_thread_messages",
    comment: "",
    indexes: [{
      name: "fk_support_thread_messages_email_proxy_threads1_idx",
      unique: false,
      type: "BTREE",
      fields: ["email_proxy_threads_id"]
    }, {
      name: "fk_support_thread_messages_users1_idx",
      unique: false,
      type: "BTREE",
      fields: ["users_id_from"]
    }]
  };
  const SupportThreadMessagesModel = sequelize.define("support_thread_messages_model", attributes, options);
  return SupportThreadMessagesModel;
};