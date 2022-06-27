console.log("Welcome to LifeSciences - Backend App...!");
// 1. Imports
const genericErrorHandlers = require("./app/utils/errorHandler");
genericErrorHandlers(); 
const cors = require("cors");
const express = require("express");
const app = new express();
const Helper = require("./app/utils/helper");

const authRoute = require("./app/routes/auth");
const userRoute = require("./app/routes/user-test");
const sponsorRoute = require("./app/v1/sponsor-module/sponsor.routes");
const studyRoute = require("./app/v1/study-module/study.routes");
const alsStagingRoute = require("./app/v1/als-staging-module/als-staging.routes");
const testCasesRoute = require("./app/v1/test-cases-module/test-cases.routes");
const draftRoute = require("./app/v1/draft-module/draft.routes");
const folderRoute = require("./app/v1/folder-module/folder.routes");
const dataDictionaryRoute = require("./app/v1/data-dictionary-module/data-dictionary.routes");
const matrixRoute = require('./app/v1/matrix-module/matrix.routes');
const visitRoute = require('./app/v1/visits-module/visits.routes');
const formRoute = require('./app/v1/forms-module/forms.routes');

const historyRoute = require('./app/v1/history-module/history.routes')

const fieldRoute = require('./app/v1/field-module/field.routes');
const sdtmMappingRoute = require('./app/v1/sdtm-mapping-module/sdtm-mapping.routes');
const testCaseV2Route = require('./app/v1/test-cases-module-V2/test-cases-v2.routes')
const uploadFunctnRoute = require("./app/controllers/s3Bucket-file-upload/s3Bucket.router");
const changedAlsDataRoute = require("./app/v1/changed-als-data-module/changed-als-data.routes");
const notFoundRoute = require("./app/routes/notFound");
const initJwtRoutes = require("./app/middlewares/jwt/init.router");
const registrationLoginRoutes = require("./app/v1/registration-and-login-module/registration-and-login.routes");
const syncRoutes = require("./app/v1/sync-save-module/sync-save.routes");

const initRoutes = require("./app/controllers/file-upload-router");

// global.__basedir = __dirname;
// var corsOptions = {
//   origin: "http://localhost:4400"
// };
// app.use(cors(corsOptions));

// 2. Initializarions
app.use(express.json());
// ** Enable COROS, Compression... for a Prod ready build
require("./app/utils/prodReady").make(app);
app.use(express.urlencoded({ extended: true }));
initRoutes(app);

app.use((req, res, next) => {
    res.set({
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "*",
        "Access-Control-Allow-Headers": "'Access-Control-Allow-Headers: Origin, Content-Type, X-Auth-Token'",
    });

    next();
});

const fileUpload = require('express-fileupload');
app.use(fileUpload({
    createParentPath: true,
    preserveExtension: 5,
    abortOnLimit: true,
    responseOnLimit: 'The file size is too large, try with files lesser than 1Mb',
    limitHandler: (req, res, next) => {
        logger.error('Prevented bulk file uploading');
        next();
    },
    tempFileDir: 'tmp',
    debug: false
}));

// 2.1. Route Handlers
app.use('/api/auth/', authRoute);
app.use('/api/user/', userRoute);
app.use('/api/sponsor/', sponsorRoute);
app.use('/api/study/', studyRoute);
app.use('/api/alsstaging/', alsStagingRoute);
app.use('/api/testcases/', testCasesRoute);
app.use('/api/draft/', draftRoute);
app.use('/api/folder/', folderRoute);
app.use('/api/datadictionary/', dataDictionaryRoute);
app.use('/api/matrix/', matrixRoute);
app.use('/api/visits/', visitRoute);
app.use('/api/form/', formRoute);

app.use('/api/history/', historyRoute);

app.use('/api/field/', fieldRoute);
app.use('/api/sdtmmaping/', sdtmMappingRoute);
app.use('/api/ver2test/', testCaseV2Route);
app.use('/api/upload/', uploadFunctnRoute);
app.use('/api/changedalsdata/', changedAlsDataRoute);
app.use('/api/initsession/', initJwtRoutes);
app.use('/api/reglogin/', registrationLoginRoutes);
app.use('/api/sync/', syncRoutes);
app.use('*', notFoundRoute); // Default case, always keep this at the end

// 3. Run DB Server
const dbs = ['mongodb', 'mongodb-mlab'];
Helper.connectToDb(dbs[1]);

// 4. Run App Server
const port =  Helper.getAppConfig("port") || 8888;
app.listen( port , () => {
    console.log(`Listening at port ${port}`);
});

