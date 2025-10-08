const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');

const userSchema = mongoose.Schema(
  {
    phone_number: {
      type: String,
      trim: true,
      unique: true,
      required: [true, 'phone number is required'],
      validate: {
        validator: (val) => {
          return /^\d{10}$/.test(val); // only 10 digits
        },
        message: (props) => `${props.value} is not a valid phone number`,
      },
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: {
        values: ['admin', 'operator', 'commuter'],
        message: '{VALUE} is not a valid role',
      },
      required: [true, 'role is required'],
      default: 'commuter',
    },
    email: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: (val) => {
          return validator.isEmail(val);
        },
        message: (props) => `${props.value} is not a valid email`,
      },
    },
    name: { type: String, lowercase: true, trim: true },
  },
  {
    timestamps: true, // automatically generate createdAT and updatedAt
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.passwordHash;
      },
    },
    toObject: { virtuals: true },
  }
);

// Hash password before saving to db (pre "save")
userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();

  const salt = await bcrypt.genSalt(12);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);

  next(); // required to exit the function
});

const User = mongoose.model('user', userSchema);

module.exports = User;
