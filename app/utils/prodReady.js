const helmet = require('helmet');
const compression = require('compression');
const cors = require("cors");


class ProdReady {
    static make(app) {
        if(!app) return null;

        app.use(helmet());
        app.use(compression());
        app.use(cors());
    }
}

module.exports = ProdReady;