import app from './utils/app.js'
import connectDB from './config/db.js'
const PORT = process.env.PORT || 4000;



// Server start
connectDB()
    .then(() => {

        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);

        })
    }).catch((error) => {
        console.log("Error connectiong to MOngoDB", error);

    })
