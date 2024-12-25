import mongoose from "mongoose";

const logSchema = new mongoose.Schema({
    method: {
        type:String,
        default:""
    },
    url: {
        type:String,
        default:""
    },
    status: {
        type:Number,
        default:0
    },
    requestBody:{
        type:Object,
        default:{}
    },
    responseBody:{
        type:Object,
        default:{}
    },
    description:{
        type: Array,
    }
},{
    timestamps:true
});

const Log = mongoose.model('Log', logSchema);

export default Log