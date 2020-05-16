module.exports = function(sequelize, DataTypes) {
  const Players = sequelize.define("Players", {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [3]
      }
    },
    selection: {
      type: DataTypes.STRING,
      validate: {
        len: [8]
      }
    },
    score: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    currentVotes: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  });

  Players.associate = function(models) {
    Players.belongsTo(models.User);
  };

  return Players;
};
