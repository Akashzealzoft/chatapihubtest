import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import Jwt from 'jsonwebtoken'
import { sequelize } from '../../db/index.js'
import { DataTypes,Sequelize } from 'sequelize'

const User = sequelize.define(
    "user",
    {
    avatar: {
    type: DataTypes.JSONB, // Assuming you want to store JSON in PostgreSQL
    defaultValue: {
      url: 'https://via.placeholder.com/200x200.png',
      localPath: '',
    },
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    lowercase: true,
    trim: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    lowercase: true,
    trim: true,
        },
   role: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'USER', // Adjust as needed
    validate: {
      isIn: [['USER', 'ADMIN']], // Add other roles as needed
    },
        },
    password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  loginType: {
    type: DataTypes.STRING,
      defaultValue: 'EMAIL_PASSWORD',
    validate: {
      isIn: [['GOOGLE', 'GITHUB','EMAIL_PASSWORD']], // Add other roles as needed
    }
  },
  isEmailVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  refreshToken: {
    type: DataTypes.STRING,
  },
  forgotPasswordToken: {
    type: DataTypes.STRING,
  },
  forgotPasswordExpiry: {
    type: DataTypes.DATE,
  },
  emailVerificationToken: {
    type: DataTypes.STRING,
  },
  emailVerificationExpiry: {
    type: DataTypes.DATE,
  },

    }, {
    timestamps: true,
    hooks: {
        beforeCreate: async (user) => {
            if (user.password) {
                user.password = await bcrypt.hash(user.password, 10);
            }
        }
    }
}
)


User.prototype.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

User.prototype.generateAccessToken = function () {
  return Jwt.sign(
    {
      _id: this.id,
      email: this.email,
      username: this.username,
      role: this.role,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
};

User.prototype.generateRefreshToken = function () {
  return Jwt.sign(
    {
      _id: this.id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
  );
};


sequelize
  .sync()
  .then(() => console.log("Table created"))
    .catch((error) => console.log(error));
  
export { User };
