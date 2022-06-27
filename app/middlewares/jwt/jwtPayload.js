module.exports = class JWTPayload {

    constructor(userRole = null, created_on = null, clientSignature = null) {
        this.userRole = userRole; // 2 = guest
        this.created_on = created_on;
        this.clientSignature = clientSignature;
}

  static getTokenFromReqObj(reqObj, tokenPropName) {
      if(!reqObj || !tokenPropName) return null;

      // 1. Try to fetch directly
    //   const token = reqObj[`${tokenPropName}`];
    let token;
    if(reqObj.authorization) { token = (reqObj.authorization).split(" ")[1]; }
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
