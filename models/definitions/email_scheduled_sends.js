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
    send_at_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "send_at_date"
    },
    sent_status: {
      type: DataTypes.ENUM('unsent', 'sent'),
      allowNull: false,
      defaultValue: "unsent",
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "sent_status"
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
    email_templates_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: null,
      primaryKey: true,
      autoIncrement: false,
      comment: null,
      field: "email_templates_id",
      references: {
        key: "id",
        model: "email_templates_model"
      }
    },
    email_values: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "email_values"
    }
  };
  const options = {
    tableName: "email_scheduled_sends",
    comment: "",
    indexes: [{
      name: "fk_email_scheduled_sends_users1_idx",
      unique: false,
      type: "BTREE",
      fields: ["users_id"]
    }, {
      name: "fk_email_scheduled_sends_email_templates1_idx",
      unique: false,
      type: "BTREE",
      fields: ["email_templates_id"]
    }]
  };
  const EmailScheduledSendsModel = sequelize.define("email_scheduled_sends_model", attributes, options);
  return EmailScheduledSendsModel;
};