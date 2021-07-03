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
    affiliate_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "affiliate_id",
      references: {
        key: "id",
        model: "users_model"
      }
    },
    code: {
      type: DataTypes.STRING(45),
      allowNull: false,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "code",
      unique: "code_UNIQUE"
    },
    landing_uri: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "landing_uri"
    },
    commission_percentage_affiliate: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: 25,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "commission_percentage_affiliate"
    },
    expiration_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "expiration_date"
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
    tableName: "referrals",
    comment: "",
    indexes: [{
      name: "fk_referrals_users2_idx",
      unique: false,
      type: "BTREE",
      fields: ["affiliate_id"]
    }]
  };
  const ReferralsModel = sequelize.define("referrals_model", attributes, options);
  return ReferralsModel;
};