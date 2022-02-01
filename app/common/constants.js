export const httpConstants = {
  METHOD_TYPE: {
    POST: 'POST',
    GET: 'GET',
    PUT: 'PUT',
    PATCH: 'PATCH'
  },
  HEADER_TYPE: {
    URL_ENCODED: 'application/x-www-form-urlencoded',
    APPLICATION_JSON: 'application/json'
  },
  HEADER_KEYS: {
    DEVICE_TYPE: 'device-type',
    DEVICE_ID: 'device-id',
    SESSION_TOKEN: 'session-token',
    PUSH_TOKEN: 'push-token'
  },
  DEVICE_TYPE: {
    ANDROID: 'android',
    IOS: 'ios',
    WEB: 'web'
  },
  CONTENT_TYPE: {
    URL_ENCODE: 'application/x-www-form-urlencoded'
  },
  WEBSERVICE_PATH: {
    SYNC_ATTENDANCE: 'sync-attendance/'
  },

  RESPONSE_STATUS: {
    SUCCESS: true,
    FAILURE: false
  },
  RESPONSE_CODES: {
    UNAUTHORIZED: 401,
    SERVER_ERROR: 500,
    NOT_FOUND: 404,
    OK: 200,
    NO_CONTENT_FOUND: 204,
    BAD_REQUEST: 400,
    FORBIDDEN: 403,
    GONE: 410,
    UNSUPPORTED_MEDIA_TYPE: 415,
    TOO_MANY_REQUEST: 429
  },
  LOG_LEVEL_TYPE: {
    INFO: 'info',
    ERROR: 'error',
    WARN: 'warn',
    VERBOSE: 'verbose',
    DEBUG: 'debug',
    SILLY: 'silly',
    FUNCTIONAL: 'functional',
    HTTP_REQUEST: 'http request'
  }
}

export const stringConstants = {
  SERVICE_STATUS_HTML:
    '<body style="font-family: Helvetica !important; background-color: black">' +
    '<div style="display: flex; flex:1; height: 100% ; justify-content: center; align-items: center; min-height: 100vh !important; font-size: 24px !important; color: #605DFF !important;">' +
    '⚡ Template 🔋 MicroService is working fine</div></body>'
}

export const genericConstants = {
  DEVICE_TYPE: {},
  NOTIFICATION_TYPE:{
    PUSH:"push",
    EMAIL:"email"
  }
}


export const amqpConstants = {
  rabbitMqConst: {
    NO_CONNECTION: 'Server is not running. Restart your app',
    RABBITMQ_NOT_STARTED: 'Unable to start Rabbit Mq server',
    RABBITMQ_START: 'RabbitMq server successfully started'
  },
  queueType: {
    ONE_TO_ONE_QUEUE: 'one_to_one_queue',
    DISTRIBUTED_QUEUE: 'distributed_queue',
    PUBLISHER_SUBSCRIBER_QUEUE: 'publisher_subscriber_queue',
    ROUTING_QUEUE: 'routing_queue',
    TOPICS_QUEUE: 'topics_queue',
    REQUEST_REPLY_QUEUE: 'request_reply_queue',
  },
  AMQP_EXCHANGE_NAME: {
    SAVE_RTSP_EXCHANGE: "mad-rtsp-exchange",
    NOTIFY_MAD_EXCHANGE: "notify-mad-exchange"
  },
  AMQP_QUEUE_NAME: {
    SAVE_RTSP_QUEUE: "save-rtsp-queue",
    NOTIFY_MAD_QUEUE: "notify-mad-queue"
  },
  exchangeType: {
    FANOUT: 'fanout',
    TOPIC: 'topic'
  },


  AMQP_PAYLOAD_TYPE: {}
};

export const apiSuccessMessage = {
  USER_ADD_SUCCESS:"User added successfully",
  USER_COOKIES_ADD_SUCCESS: 'User cookies add successfully',
  USER_COOKIES_GET_SUCCESS: 'User cookies fetched successfully',
  USER_COOKIES_UPDATE_SUCCESS: 'User cookies updated successfully',
  FETCH_SUCCESS: 'Information fetched successfully',
  USER_UPDATE_SUCCESS:'user updated successfully',
  USER_LOGOUT_SUCCESS:'user logout successfully',
  EMAIL_UPDATED_SUCCESS: 'email changed successfully',
  USER_ALREADY_EXISTS: 'user already exists',
  USER_PASSWORD_RESET_SUCCESS:"We sent an email to your Mail",
  USER_SIGNUP_SUCCESS:"User signup successfully",
  LOGIN_SUCCESS:"User login successfully",
  USER_GET_SUCCESS:"User details get successfully"

}

export const apiEndpoints = {
  GET_METERS: '/get-meters'
}

export const apiFailureMessage = {
  INVALID_PARAMS: 'Invalid Parameters',
  INVALID_REQUEST: 'Invalid Request',
  UPDATE_USER: 'Unable to update user',
  INVALID_SESSION_TOKEN: 'Invalid session token',
  INTERNAL_SERVER_ERROR: 'Internal server Error',
  BAD_REQUEST: 'Bad Request!',
  DEVICE_ID_OR_SESSION_TOKEN_EMPTY: 'Device id or session token can\'t be empty or null',
  SESSION_GENERATION: 'Unable to generate session!',
  SESSION_EXPIRED: 'Session Expired!',
  RESET_PASSWORD_AUTH0:'reset password successfully',
  USER_ALREADY_EXISTS:'user alraedy exist',
  USER_NAME_ALREADY_EXISTS:"user name already exists",
  USER_MAIL_ALREADY_EXISTS:"user name already exists",
  USER_DOES_NOT_EXISTS:'user does not exist',
  NO_EMAIL_FOUND:'No email found'
  
}

export const globalIdConstants = {
  phone_country:"phoneCountry",
  phone_number:"phoneNumber",
  email:"email"
}
