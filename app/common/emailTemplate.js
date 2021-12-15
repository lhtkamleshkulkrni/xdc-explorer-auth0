

export default class EmailTemplate {
static createEmail(name, username, password) {
        const emailTemplate = `<head>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter&display=swap" rel="stylesheet">
    <style>
        body {
            background-color: #f7f9fc;
            justify-content: center;
            align-items: center;
            display: flex;
            font-family: 'Inter', sans-serif;
        }
    
        .td {
            background-color: #f7f9fc;
            text-align: left;
            margin: 0;
            padding: 0px !important;
            font-family: 'Inter', sans-serif;
            height: 100% !important;
        }
    
        .header {
            display: flex;
            justify-content: center;
            width: 100%;
            /* margin: 0 0 50px; */
            padding: 35px 0px 35px;
            border-radius: 6px;
            background-color: #2149b9;
        }
    
        .account-recovery {
            width: 200px;
            height: 24px;
            margin: 3px 0 3px 9px;
            font-family: 'Inter', sans-serif;
            font-size: 20px;
            font-weight: 600;
            font-stretch: normal;
            font-style: normal;
            line-height: normal;
            letter-spacing: 0.77px;
            color: white;
        }
    
        .p {
            padding: 0 32px;
            font-size: 13px;
            letter-spacing: 0.5px;
        }
    
        .username-password {
            width: 126px;
            margin: 0 0px 0 32px;
            padding: 15px 36px 16px 13px;
            border-radius: 4px;
            border: solid 1px #e3e7eb;
            background-color: #f7f9fc;
        }
    
        .text-field {
            width: 340px;
            height: 52px;
    
            border: solid 1px #e3e7eb;
        }
    
        .Unsubscribe {
            font-family: 'Inter', sans-serif;
            text-align: center;
            font-size: 12px;
            font-weight: normal;
            font-stretch: normal;
            font-style: normal;
            line-height: normal;
            letter-spacing: 0.46px;
            color: #2149b9;
        }
    
        .copyright {
            font-family: 'Inter', sans-serif;
            font-size: 13px;
            text-align: center;
            font-weight: normal;
            font-stretch: normal;
            font-style: normal;
            line-height: normal;
            letter-spacing: 0.5px;
            color: #2a2a2a;
        }
    
        .footer {
            margin: 52px 0 0 0;
            background: #f7f9fc;
            padding-top: 25px;
            margin-bottom: -15px;
        }
    
        .text-color {
            padding: 0 32px;
            font-size: 13px;
            letter-spacing: 0.5px;
            color: #7b7b7b;
        }
    
        .img {
            width: 30px;
            height: 30px;
            margin: 0 9px 0 0;
            border: solid 2px var(--white-two);
        }
    
        .main {
            margin-top: 20px;
        }
    </style>
    </head>
    
    <body>
    <div>
        <div style="height: 100% !important; margin: 0; padding: 0">
            <table style="
          width: 600px;
          -webkit-text-size-adjust: 100%;
          -ms-text-size-adjust: 100%;
          mso-table-lspace: 0pt;
          mso-table-rspace: 0pt;
          margin: 0;
          padding: 0;
          font-family: 'Inter', sans-serif;
          border-collapse: collapse !important;
          height: 37.8125rem !important;
        " align="center" border="0" cellpadding="0" cellspacing="0" height="100%" width="100%" id="bodyTable">
                <tr style="display: flex; flex-direction: column">
                    <td class="td" align="center" valign="top" id="bodyCell">
                        <p style="margin-top: 34px; margin-bottom: 20px; padding: 0px">
    
                        </p>
                    </td>
                    <td style="background-color: #ffffff">
                        <img src="https://lmeqebp7fj.execute-api.us-east-1.amazonaws.com/testnet/get?fileName=xinfin-explorer-s3/emailTemlate/1638448458708_2CuK96fuCR.png"
                            style="width: 80px; height: 30px; margin-top:20px" />
                        <div class="main">
                            <div class="header">
                                <img src="https://lmeqebp7fj.execute-api.us-east-1.amazonaws.com/testnet/get?fileName=xinfin-explorer-s3/forgotPassword/1639111317425_dvFwN9eDZT.png"
                                    style="
                      width: 30px;
                      height: 30px;
                      border: solid 2px var(--white-two);
                      border-radius: 50px;
                    " />
                                <div class="account-recovery">Account Recovery</div>
                            </div>
                            <p class="p">Hi ${name} ,</p>
    
                            <p class="p">
                                A new account recovery request has been made for your account.<br><br>
                                The following is your new set of login credentials. If the
                                credentials are not used within 24 hours of this email, they
                                will expire
                            </p>
    
                            <div>
                                <div style="display: flex">
                                    <div class="username-password"> Username</div>
                                    <div class="text-field">
                                        <p style="width: 81px,
    height: 19px,
    margin: 15px 291px 11px 30px"> ${username}</p>
                                    </div>
                                </div>
                                <div style="display: flex">
                                    <div class="username-password">Password</div>
                                    <div class="text-field">${password}</div>
                                </div>
                            </div>
                            <p class="text-color">
                                For security reasons, it is highly recommended to change the
                                temporary password after logging in to your account.
                            </p>
    
                            <br />
                            <p class="p">Best Regards</p>
                            <p class="p">Team XDC</p>
                        </div>
                        <div class="footer">
                            <p class="copyright">© 2021 XDC Network. All Rights Reserved.</p>
                            <p class="Unsubscribe">Unsubscribe | Privacy Policy</p>
                        </div>
                    </td>
                </tr>
            </table>
        </div>
    </div>
    </body>`
        return emailTemplate
    }
}