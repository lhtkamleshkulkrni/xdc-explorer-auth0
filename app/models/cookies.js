import mongoose from "mongoose";

let Schema = mongoose.Schema;
let UserCookiesSchema = new Schema({
    userId: { type: String, default: "" },
    cookiesAllowed:[{ type: String, default: "" }],
    privacyConsent: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    addedOn: { type: Number, default: Date.now() },
    modifiedOn: { type: Number, default: Date.now() },
});

UserCookiesSchema.static({
    UserCookieDetails: function (request, selectionKey = "") {
        return this.findOne(request, selectionKey);
    },
    findData: function (findObj) {
        return this.find(findObj)
    },

    getUserCookieList: function (
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

    findOneAndUpdateData: function (findObj, updateObj) {
        return this.findOneAndUpdate(findObj, updateObj, { new: true });
    },

    findAndUpdateData: function (findObj, updateObj) {
        return this.update(findObj, updateObj, {upsert: true});
    },
});


export default mongoose.model("xin-cookies", UserCookiesSchema);