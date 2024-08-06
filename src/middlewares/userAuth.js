export const userAuth = (req, res, next) => {
    try {
        const data = req.cookies.accessToken
        if(!data){
            res.status(401).json({ message: "Invalid Token" });
            next();
        }
        next();
    } catch (error) {
        res.status(404).json({ message: "Internel Server Error !" });
    }
}