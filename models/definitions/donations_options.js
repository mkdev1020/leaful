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
    is_default: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: 0,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "is_default"
    },
    tier_1: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "tier_1"
    },
    tier_2_onset: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: 3,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "tier_2_onset"
    },
    tier_2: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "tier_2"
    },
    tier_3_onset: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: 5,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "tier_3_onset"
    },
    tier_3: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "tier_3"
    },
    placement: {
      type: DataTypes.ENUM('prompt', 'sidebar'),
      allowNull: false,
      defaultValue: "prompt",
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "placement"
    },
    started_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "started_at"
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
    tableName: "donations_options",
    comment: "",
    indexes: []
  };
  const DonationsOptionsModel = sequelize.define("donations_options_model", attributes, options);
  return DonationsOptionsModel;
};