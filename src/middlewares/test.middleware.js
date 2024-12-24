

export const testMiddleware = async (req, res, next) => {
    try {
        console.log("request body>>>",req.body);
        
    } catch (error) {
        console.log(error.message);
        
    }
}