const JOI = require("../../utils/JOI");
/**
 * A Matrix has uuid, study_id, matrixName, oid, addable, 
 * maximum, version, isActive, created, lastUpdated properties
 */

 class Matrix { 
    /**
     * To create a Matrix instance
     * @param uuid String, Unique ID provided to each Matrix
     * @param study_id string, study_id ID provided to a Matrix
     * @param matrixName String, represents the title of this Matrix 
     * @param oid String
     * @param addable Number
     * @param maximum String
     * @param version String
     * @param isActive Boolean, represents weather the user is active / closed the account
     * @param created Date, Represents the Created Date
     * @param lastUpdated Date, Represents the Last Updated Date
     */
     constructor( uuid, study_id, matrixName, oid, addable, maximum, version, 
        isActive = true, created = new Date(), lastUpdated = new Date()) {
        this.uuid = uuid;
        this.study_id = study_id;
        this.matrixName = matrixName;
        this.oid = oid;
        this.addable = addable;
        this.maximum = maximum;
        this.version = version;
        this.isActive = isActive;
        this.created = created;
        this.lastUpdated = lastUpdated;
    }

        
    /**
     * Static function to get JOI validation schema for Matrix
     */
     static getJOIValidationSchema() {
        return {
            uuid: JOI.string(),  
            study_id: JOI.string(), 
            matrixName: JOI.string(), 
            oid: JOI.string(), 
            addable: JOI.string(), 
            maximum: JOI.string(), 
            version: JOI.string(), 
            isActive: JOI.any().default(true),
            created: JOI.any().default(new Date()), 
            lastUpdated: JOI.any().default(new Date())
        };
    }

        
    /**
     * Verifies the instance value and if invalid state, retuns error object, if valied returns null
     * @returns any | null
     */
     hasError() {
        let error = JOI.validate(this, Matrix.getJOIValidationSchema());
        return (error && error.error) ? error.error : null;
    }

    
    /**
     * Static function to get Matrix data from HttpRequest object
     * @param reqObj Any
     * @param updateableFields Boolean OPTIONAL DEFAULT = false, if true get only properties to be updated
     * @returns Matrix | null
     */
     static getMatrixFromRequestObj(reqObj, updateableFields = false) {
        if (!reqObj) return null;
        if (!updateableFields) {
            const matrix = new Matrix(
                reqObj.uuid, 
                reqObj.study_id,
                reqObj.matrixName || 'null', 
                reqObj.oid || 'null', 
                reqObj.addable || 'null', 
                reqObj.maximum || 'null', 
                reqObj.version || 'null', 
                reqObj.isActive || true,
                reqObj.created || new Date(), 
                reqObj.lastUpdated || new Date()
            );
            return matrix;
        }
        const dtdtr = {};
        if (reqObj.matrixName) dtdtr.matrixName = reqObj.matrixName;
        if (reqObj.oid) dtdtr.oid = reqObj.oid;
        if (reqObj.addable) dtdtr.addable = reqObj.addable;
        if (reqObj.maximum) dtdtr.maximum = reqObj.maximum;
        if (reqObj.version) dtdtr.version = reqObj.version;
        if (reqObj.isActive !== undefined && reqObj.isActive !== null) dtdtr.isActive = reqObj.isActive;
        dtdtr.lastUpdated = new Date();
        return dtdtr;
    }
 }
 
 module.exports = Matrix;