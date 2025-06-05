
// 错误代码枚举
export const ErrorCode = {
    MISSING_ID: 1,
    RECORD_NOT_FOUND: 2,
    TOKEN_EXPIRED: 3,
    INVALID_TOKEN: 4,
    MISSING_FIELDS: 5,
    SERVER_ERROR: 6,
    ADMIN_PERMISSION_DENIED: 7,
    MISSING_AUTH: 8,
    INVALID_AUTH: 9,
    INVALID_CIPHER_TEXT: 10,
    DECRYPT_FAILED: 11,
    REQUEST_EXPIRED: 12,
    EXIST_ADDRESS: 10001,  // 地址已被其他邮箱使用
    EXIST_ORDER: 10002,     // 存在未完成订单
    TOKEN_INACTIVE: 1008,  // Add this new error code
    TOKEN_ALREADY_ACTIVATED: 1009,  // Add this new error code
} as const;


export const TypeCodeMap = {
  1: 'normal',
  2: 'middle',
  3: 'higher',
  4: 'super',
  5: 'test'
};

export enum TokenType {
  NONE = 0,
  NORMAL = 1,
  MIDDLE = 2,
  HIGHER = 3,
  SUPER = 4,
  TEST = 5
}

export const BASE_PROXY_URL = 'http://api.ddtaim.dpdns.org/'
export const BASE_REQUEST_URL = 'https://api.ddtaim.dpdns.org/'

export const Version = '1.0.0'

// dev
// export const BASE_PROXY_URL = 'http://localhost:4001/'
// export const BASE_REQUEST_URL = 'http://localhost:4001/'

// 本地prod
// export const BASE_PROXY_URL = 'http://localhost:4000/'
// export const BASE_REQUEST_URL = 'http://localhost:4000/'

