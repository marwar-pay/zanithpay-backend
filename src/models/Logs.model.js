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
    req:{
        type:Object,
        default:{}
    },
    res:{
        type:Object,
        default:{}
    }
},{
    timestamps:true
});

const Log = mongoose.model('Log', logSchema);

export default Log