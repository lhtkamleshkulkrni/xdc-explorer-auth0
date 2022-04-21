

export default class EmailTemplate {
static createEmail(name, username, password) {
        const emailTemplate = `<html>
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
          <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500&display=swap"rel="stylesheet"/>
          <link href='https://fonts.googleapis.com/css?family=Inter' rel='stylesheet'>
          <style>
            body {
              display: flex;
              font-family: Inter;
            }
            .mainContianer {
              padding: 15px;
              max-width: 588px;
              width: 100%;
            }
            .xdcLogo {
              width: 85px;
              margin-top: 20px;
            }
            .container {
              border-radius: 6px;
            }
            .containerHeader {
              background-color: #2149b9;
              padding: 33px 0;
              margin-top: 28px;
              border-top-left-radius: 6px;
              border-top-right-radius: 6px;
            }
            .headerContent {
              display: flex;
              flex-flow: row nowrap;
              margin-left: 185px;
            }
            .lockLogo {
              width: 33px;
            }
            .heading {
              font-size: 20px;
              font-weight: 600;
              color: #ffffff;
              margin-top: 4px;
              margin-left: 12px;
              
            }
            .contentContainer {
              padding: 33px 34px 86px 33px;
              background-color: #ffffff;
              border-bottom-left-radius: 6px;
              border-bottom-right-radius: 6px;
            }
            .paraText {
              color: #202020;
              font-size: 15px;
            }
            .table {
              border: 1px solid #e3e7eb;
              color: #202020;
              font-size: 15px;
              border-radius: 4px;
              margin-top: 30px;
              margin-bottom: 30px;
            }
            .b-b-1 {
              border-bottom: 1px solid #e3e7eb;
            }
            .b-r-1 {
              border-right: 1px solid #2a2a2a;
              margin: auto 5px;
              height: 14px;
            }
            .row {
              display: flex;
            }
            .firstColumn {
              border-right: 1px solid #e3e7eb;
              padding: 14px 0 14px 13px;
              background-color: #f7f9fc;
              width: 126px;
            }
            .secondColumn {
              padding: 14px 15px 14px 17px;
            }
            .b-t-l-r {
              border-top-left-radius: 4px;
            }
            .b-b-l-r {
              border-bottom-left-radius: 4px;
            }
            .footer {
              background: #f7f9fc;
              padding-top: 25px;
            }
            .unsubscribe {
              font-size: 12px;
              color: #2149b9;
              text-decoration: none;
            }
            .privacy {
              font-size: 12px;
              color: #2149b9;
              text-decoration: none;
              text-align: center;
            }
            .copyright {
              font-size: 13px;
              text-align: center;
              color: #2a2a2a;
            }
            .privacyUnsubscribContainer {
              display: flex;
              margin-left: 210px;
            }
            @media only screen and (max-width: 600px) {
              .headerContent {
                  margin-left: 33px;
                }
              .firstColumn {
                  width: 90px;
                }
            }
          </style>
        </head>
        <body style="background-color: #f7f9fc">
          <div class="mainContianer" style="margin-left: auto; margin-right: auto">
            <img class="xdcLogo" src="https://xinfin-explorer-s3.s3.amazonaws.com/emailTemlate/1638448458708_2CuK96fuCR.png"/>
            <div class="container">
              <div class="containerHeader">
                <div class="headerContent">
                  <img class="lockLogo" src="https://xinfin-explorer-mainnet-s3.s3.us-east-2.amazonaws.com/email-lock/1643636625132_6V5dJ6M6Fn.png">
                  <span class="heading">Account Recovery</span>
                </div>
              </div>
              <div class="contentContainer">
                <p class="paraText">
                  <b>Hi ${name} ,</b>
                  <br /><br />
                  A new account recovery request has been made for your account.
                  <br /><br />
                  The following is your new set of login credentials. If the
                  credentials are not used within 24 hours of this email, they
                  will expire
                </p>
                <div class="table">
                  <div class="row b-b-1">
                    <span class="firstColumn b-t-l-r">Username</span>
                    <span class="secondColumn">${username}</span>
                  </div>
                  <div class="row">
                    <span class="firstColumn b-b-l-r">Password</span>
                    <span class="secondColumn">${password}</span>
                  </div>
                </div>
                <p class="paraText">
                  For security reasons, it is highly recommended to change the
                  temporary password after logging in to your account.
                  <br /><br />
                  Best Regards
                  <br /><br />
                  Team XDC
              </div>
              <div class="footer">
                <div style="text-align: center; color: #7b7b7b">This email address is not monitored, please do not reply.</div>
                <div class="copyright">© 2022 XDC Foundation. All Rights Reserved.</div>
                <p style="text-align: center">
                  <a style="text-decoration: none;"
                    href="https://observer.xdc.org/privacy-policy" class="privacy">Privacy Policy</a><p>
              </div>
            </div>
          </div>
        </body>
      </html>`
        return emailTemplate
    }
}