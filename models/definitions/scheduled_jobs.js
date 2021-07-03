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
    name: {
      type: DataTypes.STRING(45),
      allowNull: false,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "name"
    },
    minute: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: "*",
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "minute"
    },
    hour: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: "*",
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "hour"
    },
    day_of_month: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: "*",
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "day_of_month"
    },
    month: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: "*",
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "month"
    },
    day_of_week: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: "?",
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "day_of_week"
    },
    enabled: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: 0,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "enabled"
    },
    last_run: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "last_run"
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
    tableName: "scheduled_jobs",
    comment: "",
    indexes: []
  };
  const ScheduledJobsModel = sequelize.define("scheduled_jobs_model", attributes, options);
  return ScheduledJobsModel;
};