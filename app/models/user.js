import mongoose from "mongoose";
//const AutoIncrement = require('mongoose-sequence')(mongoose);
let Schema = mongoose.Schema;


let UserSchema = new Schema({
  userId: { type: String, default: "" },
  userName: { type: String, default: "" },
  profilePic: { type: String, default: "" },
  email: { type: String, default: "" },
  userMeta: { type: Object, default: {} },

  status: { type: String, default: "ACTIVE", enum: ['ACTIVE', 'INACTIVE', 'REQUESTED', 'INVITED', 'ACCEPTED', 'REJECTED'] },
  "isDeleted": { type: Boolean, default: false },
  "isActive": { type: Boolean, default: true },
  "addedOn": { type: Number, default: Date.now() },
  "modifiedOn": { type: Number, default: Date.now() }
});

UserSchema.static({
  getUserDetails: function (request, selectionKey = "") {
    return this.findOne(request, selectionKey);
  },
  getUserList: function (request, selectionKey = "", limit = 0, skip = 0, sortCriteria = '-modifiedOn') {
    return this.find(request, selectionKey).sort(sortCriteria).skip(skip).limit(limit);
  },
  findAndUpdateData: function (findObj, updateObj) {
    return this.findOneAndUpdate(findObj, updateObj, { new: true })
  },
})

export default mongoose.model('xin-users', UserSchema);
