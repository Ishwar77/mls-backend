class APIResponse {
    constructor(statusCode, message, metaData) {
        this.statusCode = statusCode;
        this.message = message;
        this.metaData = metaData;
    }

    /**
     * Utility function to send out Responses
     * @param respObj HttpResponse object 
     * @param statusCode Number  
     * @param message String OPTIONAL
     * @param metaData Object OPTIONAL
     * @see https://www.restapitutorial.com/httpstatuscodes.html
     */
    static sendResponse(respObj, statusCode = 200, message = '', metaData = null) {
        if (!respObj) {
            return null;
        }
        const response = new APIResponse(statusCode, message, metaData);
        respObj.statusCode = statusCode;
        respObj.send(response);
    }
}

module.exports = APIResponse;