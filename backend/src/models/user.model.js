module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define("user", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: Sequelize.STRING(60),
      allowNull: false,
      validate: {
        len: [20, 60]
      }
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false
    },
    address: {
      type: Sequelize.STRING(400),
      allowNull: false,
      validate: {
        len: [1, 400]
      }
    },
    role: {
      type: Sequelize.STRING,
      defaultValue: 'user',
      validate: {
        isIn: [['admin', 'user', 'store_owner']]
      }
    }
  });

  return User;
};
