class EmailUtils {
    static getTextMessage(accessUrl) {
        return `
            We are honoring your request to access the Memo app.
            You can proceed to our web application at url ${accessUrl}

            Your feedback means a lot to us, do share one.
        `;
    }

    static getHtmlMessage(accessUrl) {
        return `
        <div class="memo-app-authorization" style="border: solid gray 1px;
    padding: 15px;
    min-width: 350px; 
    overflow: hidden;
    width: 50%;
    border-radius: 3px;">
        <div class="memo-app-auth-msg">
            <p style="font-family: Roboto;
            font-size: 1.08rem;
            font-weight: 600;"> We are honoring your request to access the Memo app</p>
            <p style="font-family: Roboto;
            font-size: 1.05rem;"> You can proceed to our web application at <a href="${accessUrl}">url</a> </p>
        </div>
        <div class="memo-app-auth-url">
            <div
                style="font-size: 10px;font-family: Lucida Console; width: 100%;overflow: hidden; text-overflow: ellipsis; margin-top: -11px; margin-bottom: 25px;">
                ${accessUrl}
            </div>
        </div>
        <a class="memo-app-auth-action" href="${accessUrl}" style="
        background-color: #1b39a8;
        height: 35px;
        border-radius: 2px;
        color: #fff;
        font-weight: 600;
        font-size: 1.05rem;
        text-decoration: none;
        max-width: 59%;
        min-width: 350px;
        display: flex;
        align-items: center;
        justify-content: center;">
            Memo
        </a>

        <div class="memo-app-auth-foot" style="font-family: Roboto; font-size: 1.02rem; color: teal;">
            <p> Your feedback means a lot to us, <em>do share one</em>. </p>
        </div>
    </div>
            `;
    }

}

module.exports = EmailUtils;