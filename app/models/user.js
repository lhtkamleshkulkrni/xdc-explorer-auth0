import mongoose from "mongoose";

let Schema = mongoose.Schema;
let UserSchema = new Schema({
  userId: { type: String, default: "" },
  name: { type: String, default: "" },
  email: { type: String, default: "" },
  password: { type: String, default: "" },
  profilePic: { type: String, default: "" },
  pushToken: { type: String, default: "" },

  status: {
    type: String,
    default: "ACTIVE",
    enum: [
      "ACTIVE",
      "INACTIVE",
      "REQUESTED",
      "INVITED",
      "ACCEPTED",
      "REJECTED",
    ],
  },

  isDeleted: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  addedOn: { type: Number, default: Date.now() },
  modifiedOn: { type: Number, default: Date.now() },
});

UserSchema.static({
  getUserDetails: function (request, selectionKey = "") {
    return this.findOne(request, selectionKey);
  },
  findData: function (findObj) {
    return this.find(findObj)
  },

  getUserList: function (
    request,
    selectionKey = "",
    limit = 0,
    skip = 0,
    sortCriteria = "-modifiedOn"
  ) {
    return this.find(request, selectionKey)
      .sort(sortCriteria)
      .skip(skip)
      .limit(limit);
  },

  findAndUpdateData: function (findObj, updateObj) {
    return this.findOneAndUpdate(findObj, updateObj, { new: true });
  },
});


export default mongoose.model("xin-users", UserSchema);