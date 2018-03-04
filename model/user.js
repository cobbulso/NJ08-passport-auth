const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
mongoose.Promise = global.Promise;

const userSchema = mongoose.Schema({
    email: { type: String, required: true, trim: true, unique: true },
    password: { type: String, required: true, minlength: 3 },
    role: { type: String, enum: ['customer', 'premium', 'admin'], default: 'customer' }
});

userSchema.methods.encryptPassword = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
}

userSchema.methods.verifyPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
}

module.exports = mongoose.model('users', userSchema);