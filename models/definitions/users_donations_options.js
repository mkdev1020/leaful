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
    donations_options_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "donations_options_id",
      references: {
        key: "id",
        model: "donations_options_model"
      }
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
    num_donation_option_prompts: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      defaultValue: 0,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "num_donation_option_prompts"
    },
    num_donation_prompts_total: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      defaultValue: 0,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "num_donation_prompts_total"
    },
    last_donation_prompt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "last_donation_prompt"
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
    tableName: "users_donations_options",
    comment: "",
    indexes: [{
      name: "fk_donations_donations_options1_idx",
      unique: false,
      type: "BTREE",
      fields: ["donations_options_id"]
    }, {
      name: "fk_donations_users1_idx",
      unique: false,
      type: "BTREE",
      fields: ["users_id"]
    }]
  };
  const UsersDonationsOptionsModel = sequelize.define("users_donations_options_model", attributes, options);
  return UsersDonationsOptionsModel;
};