import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
    name : {
        type: String,
        trim: true,
        required: true,
        maxlength: 32,
        unique : true,
    },
    slug : {  // for seo
        type : String,
        unique : true,
        lowercase : true,
    }
})


export default mongoose.model('Category', categorySchema);