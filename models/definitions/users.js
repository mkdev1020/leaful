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
    email: {
      type: DataTypes.STRING(45),
      allowNull: false,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "email",
      unique: "email_UNIQUE"
    },
    first_name: {
      type: DataTypes.STRING(45),
      allowNull: false,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "first_name"
    },
    last_name: {
      type: DataTypes.STRING(45),
      allowNull: false,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "last_name"
    },
    password_hash: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "password_hash"
    },
    last_sign_in_date: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "last_sign_in_date"
    },
    is_zombie: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "is_zombie"
    },
    donation_date: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "donation_date"
    },
    donated_options_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "donated_options_id",
      references: {
        key: "id",
        model: "donations_options_model"
      }
    },
    alias_first_name: {
      type: DataTypes.STRING(45),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "alias_first_name"
    },
    alias_last_name: {
      type: DataTypes.STRING(45),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "alias_last_name"
    },
    username: {
      type: DataTypes.STRING(45),
      allowNull: false,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "username",
      unique: "username_UNIQUE"
    },
    email_payout: {
      type: DataTypes.STRING(45),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "email_payout",
      unique: "email_payout_UNIQUE"
    },
    avatar_locator: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "avatar_locator"
    },
    communication_enabled: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: 1,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "communication_enabled"
    },
    portfolio_module: {
      type: DataTypes.ENUM('about', 'tip', 'message', 'share'),
      allowNull: false,
      defaultValue: "about",
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "portfolio_module"
    },
    about_me: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "about_me"
    },
    role: {
      type: DataTypes.ENUM('teacher', 'admin'),
      allowNull: false,
      defaultValue: "teacher",
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "role"
    },
    marketing_email_enabled: {
      type: DataTypes.INTEGER(1),
      allowNull: true,
      defaultValue: 1,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "marketing_email_enabled"
    },
    is_deactivated: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: 0,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "is_deactivated"
    },
    is_dormant: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: 0,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "is_dormant"
    },
    dormancy_reason: {
      type: DataTypes.ENUM('no_sign_in', 'excess_funds'),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "dormancy_reason"
    },
    dormancy_date: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "dormancy_date"
    },
    timezone_offset: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: 300,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "timezone_offset"
    },
    tos_accepted_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "tos_accepted_at"
    },
    is_usa_resident: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: 1,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "is_usa_resident"
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
    tableName: "users",
    comment: "",
    indexes: [{
      name: "fk_users_donations_options1_idx",
      unique: false,
      type: "BTREE",
      fields: ["donated_options_id"]
    }]
  };
  const UsersModel = sequelize.define("users_model", attributes, options);
  return UsersModel;
};