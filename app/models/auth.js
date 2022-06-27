class Auth {
    constructor(email = null, pass = null, isReturningUser = false, locked = false) {
        this.email = email;
        this.pass = pass;
        this.isReturningUser = isReturningUser || false;
        this.locked = locked || false;
    }

    static getAuthInfoFromRequestObj(reqObj, updateableFields = false) {
      //  if (!reqObj || !reqObj.email || !reqObj.pass) return null;

        const locked = reqObj.locked === undefined || reqObj.locked === null ? false : reqObj.locked;
        return new Auth(reqObj.email || null, reqObj.pass || null, reqObj.isReturningUser || false, locked );
    }

    static getTokenFromReqObj(reqObj, tokenPropName) {
        if(!reqObj || !tokenPropName) return null;

        // 1. Try to fetch directly
        const token = reqObj[`${tokenPropName}`];
        if(token) return token;

        // 2. Try fetching by props match
        const propsAry = Object.getOwnPropertyNames(reqObj);
        propsAry.forEach(prop => {
            if(prop === tokenPropName) {
                return reqObj.prop;
            }
        });
        return null;
    }
}

module.exports = Auth;