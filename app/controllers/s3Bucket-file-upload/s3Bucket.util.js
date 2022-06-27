
class FileUploadInputs {
    entityType = 'ALSDOC' | 'SAMPLEDATA' | 'SDTM' ;

    constructor(type) {
        this.entityType = type;
    }

    static getDataFromRequest(reqBody) {
        if (!reqBody) {
            return null;
        }

       // console.log('reqBody = ', reqBody);

        const type = reqBody['type'] ? (reqBody['type']).toUpperCase() : null;

        if (!type) {
            return null;
        }

        return new FileUploadInputs(type);
    }

    static hasError(fileUploadInput) {
        if (!fileUploadInput) {
            return true;
        }
        if (!fileUploadInput.entityType) {
            return true;
        }
        return false;
    }
}

module.exports = FileUploadInputs;