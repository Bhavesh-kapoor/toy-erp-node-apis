import app from "#configs/server";
import connectDB from "#configs/database";
import env from "#configs/env";



await connectDB(env.DB_URI);


app.listen(env.PORT,()=>{
    console.log(`Server is running at ${env.PORT}`);
});

